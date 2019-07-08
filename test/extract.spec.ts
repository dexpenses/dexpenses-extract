import * as fs from 'fs';
import * as path from 'path';
import extractReceipt from '../src';

/*
 * Skip Geo Coding API call during testing
 */
jest.mock('../src/extractor/place', () => {
  return {
    PlaceExtractor: jest.fn().mockImplementation(() => ({
      field: 'place',
      extract: () => null,
    })),
  };
});

const userData = {
  phoneNumber: '+491234567890',
};

const testSuites: Record<string, string[]> = {
  general: [],
};

const testRoot = __dirname;
const dir = path.resolve(testRoot, 'data');
for (const entry of fs.readdirSync(dir)) {
  const entry_path = path.resolve(dir, entry);
  if (fs.statSync(entry_path).isDirectory()) {
    testSuites[path.basename(entry_path)] = fs
      .readdirSync(entry_path)
      .filter((f) => f.endsWith('.txt'))
      .map((f) => path.resolve(entry_path, f));
  } else if (entry.endsWith('.txt')) {
    testSuites.general.push(entry_path);
  }
}

// TODO use describe.each and it.each
for (const [suite, files] of Object.entries(testSuites)) {
  describe(`Extract receipt cloud function (offline) for "${suite}" receipts`, () => {
    for (const textFile of files) {
      if (!textFile.endsWith('.txt')) {
        continue;
      }
      it(`should successfully extract info from '${path.basename(
        textFile
      )}'`, async () => {
        const text = fs.readFileSync(textFile, 'utf8');
        const config = {
          gmaps: { key: '' },
        }; // we need no config in tests
        const result = await extractReceipt(config)(text, userData);
        expect({ result }).toMatchSnapshot();
      });
    }
  });
}
