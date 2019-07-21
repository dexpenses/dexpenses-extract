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

const dir = path.resolve(__dirname, 'data');
for (const entry of fs.readdirSync(dir)) {
  const entryPath = path.resolve(dir, entry);
  if (fs.statSync(entryPath).isDirectory()) {
    testSuites[path.basename(entryPath)] = fs
      .readdirSync(entryPath)
      .filter((f) => f.endsWith('.txt'))
      .map((f) => path.resolve(entryPath, f));
  } else if (entry.endsWith('.txt')) {
    testSuites.general.push(entryPath);
  }
}

describe.each(
  Object.entries(testSuites).filter(([, files]) => files.length > 0)
)(
  'Extract receipt cloud function (offline) for "%s" receipts',
  (suite, files) => {
    it.each(files.map((file) => [path.basename(file), file]))(
      "should successfully extract info from '%s'",
      async (name, file) => {
        const text = fs.readFileSync(file, 'utf8');
        const config = {
          gmaps: { key: '' },
        }; // we need no config in tests
        const result = await extractReceipt(config)(text, userData);
        expect({ result }).toMatchSnapshot();
      }
    );
  }
);
