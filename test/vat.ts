import * as fs from 'fs';
import * as path from 'path';
import { PaymentMethodExtractor } from '../src/extractor/paymentMethod';
import { AmountExtractor, getAmountValues } from '../src/extractor/amount';
import Pipeline from '../src/pipeline/Pipeline';
import TextSanitizer from '../src/preprocess/TextSanitizer';
import 'core-js/features/array/flat-map';
import 'core-js/features/array/flat';

function floor(r: number): number {
  return Math.floor(r * 100) / 100;
}
function round(r: number): number {
  return Math.round(r * 100) / 100;
}
function equal(x: number, y: number) {
  return Number(Math.abs(x - y).toFixed(2)) < Number.EPSILON;
}

async function main() {
  const pipeline = new Pipeline([
    new TextSanitizer(),
    new PaymentMethodExtractor(),
    new AmountExtractor(),
  ]);

  const normalReceiptFiles = fs
    .readdirSync(path.resolve(__dirname, 'data/normal'))
    .filter((file) => file.endsWith('.txt'));

  const vat19ReceiptTexts: Array<any> = [];

  for (const file of normalReceiptFiles) {
    const text = fs.readFileSync(path.resolve(__dirname, 'data/normal', file), {
      encoding: 'utf8',
    });

    const receipt = await pipeline.run(text);
    const correctAmount = receipt.data!.amount!.value;

    if (!text.match(/(^|[^\d])7([,.] ?0 ?0?)? ?%( |$)/m)) {
      const values = getAmountValues(text.split('\n'));
      const vats: any[] = [];
      for (let i = values.length - 2; i >= 0; i -= 1) {
        const [v1, v2] = values.slice(i, i + 2);
        if (v1 === 0 || v2 === 0) {
          continue;
        }
        if (
          equal(correctAmount, v1 + v2) &&
          (equal(floor(v1 * 0.19), v2) ||
            equal(floor(v2 * 0.19), v1) ||
            equal(round(v1 * 0.19), v2) ||
            equal(round(v2 * 0.19), v1))
        ) {
          if (equal(floor(v1 * 0.19), v2) || equal(round(v1 * 0.19), v2)) {
            vats.push({
              net: v1,
              vat: v2,
              vat_calc: v1 * 0.19,
              calc_type: equal(floor(v1 * 0.19), round(v1 * 0.19))
                ? 'INDET'
                : equal(floor(v1 * 0.19), v2)
                ? 'FLOOR'
                : 'ROUND',
              gross: v1 + v2,
            });
          } else if (
            equal(floor(v2 * 0.19), v1) ||
            equal(round(v2 * 0.19), v1)
          ) {
            vats.push({
              net: v2,
              vat: v1,
              vat_calc: v2 * 0.19,
              calc_type: equal(floor(v2 * 0.19), round(v2 * 0.19))
                ? 'INDET'
                : equal(floor(v2 * 0.19), v1)
                ? 'FLOOR'
                : 'ROUND',
              gross: correctAmount,
            });
          }
        }
      }

      vat19ReceiptTexts.push({ file, text, vats });
      // console.log(
      //   file,
      //   !!text.match(/(^| )[1Il][9g]([,.] ?0 ?0?)? ?%([:; ]|$)/m)
      // );
    }
  }

  // console.log('=======');
  // console.log('no of vat 19 receipts:', vat19ReceiptTexts.length);

  console.log(
    ['file', 'gross', 'net', 'VAT', 'VAT (calc)', 'calc_type'].join(';')
  );

  for (const r of vat19ReceiptTexts) {
    if (!r.vats.length) {
      continue;
    }
    const vat = r.vats[0];
    console.log(
      [r.file, vat.gross, vat.net, vat.vat, vat.vat_calc, vat.calc_type]
        .map((v) => (typeof v === 'number' ? (v + '').replace('.', ',') : v))
        .join(';')
    );
  }
}

main();
