import {
  AmountExtractor,
  findAmountFromCashPaymentValues,
  getAmountValues,
} from './amount';

describe('Amount extractor', () => {
  const extractor = new AmountExtractor();

  it('should be successfully extract the amount', () => {
    const text = `Gesamt 11,10`;
    const result = extractor.extract(text, text.split['\n'], {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount', () => {
    const text = `Betrag 11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `betrag
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).not.toBeNull();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `gesamt
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount if lines contain only the decimals', () => {
    const text = `4,40
    5,90
    4,00
    4,10
    43,50
    0,00
    0,00
    61,90
    61,90`;
    const result = extractor.extract(
      text,
      text.split('\n').map((l) => l.trim()),
      {}
    );
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(61.9);
    }
  });
});

describe('getAmountValues', () => {
  it('should find all amount-like values and transform them to numbers', () => {
    expect(getAmountValues(['3.50-', 'Kaufsumme:', '5,00', '1,50'])).toEqual([
      3.5,
      5,
      1.5,
    ]);

    expect(getAmountValues(['4, 82', '5, 02', '-0,20'])).toEqual([
      4.82,
      5.02,
      0.2,
    ]);

    expect(
      getAmountValues([
        'u zah len EUR: 4.4S',
        'Bar',
        'Rückgeld',
        '50,00',
        '45,55',
      ])
    ).toEqual([4.45, 50, 45.55]);
  });

  // it('should testy test', () => {
  //   const amountValues = getAmountValues(
  //     `BETTENLAGE
  //   Gualitat sehr preiswert
  //   Danisches BETTENLAGER
  //   GmbH &Co KG
  //   Brandgehäge 5
  //   38444 Wolfsbur
  //   Telefon 05308 93030
  //   Bezahlen Sie bei Ihrem nächsten Einkauf
  //   mit PAYBACK Punkten!
  //   Sichern Sie sich jetzt Ihre persönliche
  //   PAYBACK Karte!
  //   EUR
  //   7,49 B
  //   Al inaDeckelS
  //   #001
  //   EAN : 5708155622522
  //   Mel issawäschekorb
  //   19,99 B
  //   #002 EAN: 5708155621617
  //   Sp.Bettt.anthrazit
  //   29,99 B
  //   24,95 E
  //   34,99 B
  //   179,00 B
  //   #003 EAN: 4005540463755
  //   #004 EAN: 5703288068438
  //   #005 EAN : 4005122475305
  //   #006 EAN: 4003589020458
  //   xN&D FIRM
  //   Molton 140x200
  //   xDaunend. 135x200
  //   x Zeilenstorno xxxxx
  //   Molton 140x200
  //   34,99- B
  //   #007 EAN: 4005122475305
  //   PAYBACK Karte: 240XXXXXXXX82
  //   Molton 160x200
  //   39,99 B
  //   #008 EAN: 4005122475336
  //   301,41
  //   Zwischensumme
  //   Rabatte
  //   EUR
  //   25,00% 1,87
  //   25,00% 5,00
  //   -25% Rabatt
  //   25% Rabatt
  //   EUR
  //   6,87
  //   Summe Rabatte
  //   294,54
  //   294,54
  //   EUR
  //   zu zahlen
  //   ZVT
  //   Belegnr
  //   Kartenart
  //   Nr. 701E51F44D5D5XXFXXEC
  //   3582
  //   Girocard
  //   0,00
  //   Rueckgeld
  //   EUR
  //   B 19,00 % MwSt
  //   294,54
  //   NETTO-UMSATZ
  //   47,03
  //   247,51
  //   Kas: 001/0001 Bon 0294
  //   Dat. 15.12. 2018 Zeit 18:10:49
  //   PCO1 P
  //   Vielen Dank für Ihren Einkauf
  //   www. DaenischesBettenlager.de
  //   St.-Nr. 15 282 01808
  //   x Hygieneartikel sind
  //   vom Umtausch ausgeschlossen

  //   `.split('\n')
  //   );

  //   function* range(start: number, end: number) {
  //     for (; start <= end; ++start) {
  //       yield start;
  //     }
  //   }

  //   function last<T>(arr: T[]) {
  //     return arr[arr.length - 1];
  //   }

  //   function* numericCombinations(
  //     n: number,
  //     r: number,
  //     loc: number[] = []
  //   ): IterableIterator<number[]> {
  //     const idx = loc.length;
  //     if (idx === r) {
  //       yield loc;
  //       return;
  //     }
  //     for (let next of range(idx ? last(loc) + 1 : 0, n - r + idx)) {
  //       yield* numericCombinations(n, r, loc.concat(next));
  //     }
  //   }

  //   function* combinations<T>(arr: T[], r: number) {
  //     for (let idxs of numericCombinations(arr.length, r)) {
  //       yield idxs.map((i) => arr[i]);
  //     }
  //   }

  //   function find(values: number[]): number[] | null {
  //     for (let n = values.length; n >= 3; n -= 1) {
  //       for (const subset of combinations(values, n)) {
  //         const possible: number[] = [];
  //         for (let i = 0; i < subset.length; i++) {
  //           const s = [...subset];
  //           const [total] = s.splice(i, 1);
  //           const sum = s.reduce((p, c) => p + c, 0);
  //           if (Math.abs(total - sum) < Number.EPSILON * 10) {
  //             possible.push(total);
  //           }
  //         }
  //         if (possible.length) {
  //           return possible;
  //         }
  //       }
  //     }
  //     return null;
  //   }
  //   const values = amountValues.filter((v) => v !== 0);
  //   console.log(values);

  //   console.log(find(values));

  //   // const getAllSubsets = (theArray) =>
  //   //   theArray.reduce(
  //   //     (subsets, value) =>
  //   //       subsets.concat(subsets.map((set) => [value, ...set])),
  //   //     [[]]
  //   //   );
  //   // function* subsets(array, offset = 0) {
  //   //   while (offset < array.length) {
  //   //     let first = array[offset++];
  //   //     for (let subset of subsets(array, offset)) {
  //   //       subset.push(first);
  //   //       yield subset;
  //   //     }
  //   //   }
  //   //   yield [];
  //   // }

  //   // const possibleTotals = [];
  //   // for (const subset of subsets(amountValues)) {
  //   //   if (subset.length < 3) {
  //   //     continue;
  //   //   }

  //   // }
  // });
});

describe('findAmountFromCashPaymentValues', () => {
  it('should find the right amount value', () => {
    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
      ])
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
        4.59,
      ])
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
        4.59,
        4.59,
      ])
    ).toBe(4.91);

    expect(findAmountFromCashPaymentValues([4.82, 5.02, 0.2])).toBe(4.82);
  });
});
