import * as fs from 'fs';
import * as path from 'path';
import extractReceipt from '../src';
// import { Extractor } from '../src/extractor/extractor';
// import { Receipt } from '@dexpenses/core';

import * as gmaps from '@google/maps';

jest.mock('@google/maps');
const geocode = jest.fn().mockReturnValue({
  asPromise: jest.fn().mockResolvedValue({
    json: {
      status: 'ZERO_RESULTS',
      results: [],
    },
  }),
});
(gmaps.createClient as any).mockReturnValue({
  geocode,
});

/*
 * Skip Geo Coding API call during testing
 */
// jest.mock('../src/extractor/place', () => {
//   return {
//     PlaceExtractor: jest.fn().mockImplementation(
//       () =>
//         new (class extends Extractor<null> {
//           constructor() {
//             super('place');
//           }

//           public extract(
//             text: string,
//             lines: string[],
//             extracted: Receipt
//           ): null {
//             return null;
//           }
//         })()
//     ),
//   };
// });

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

beforeEach(() => {
  jest.clearAllMocks();
});

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
        const result = await extractReceipt(config)(userData)(text);
        expect({ result }).toMatchSnapshot();
        /**
         * If a header was extracted, ensure the correct geocoding request was "sent"
         */
        if (
          result.data &&
          result.data.header &&
          result.data.header.length > 0
        ) {
          expect(geocode).toHaveBeenCalledTimes(1);
          expect(geocode).toHaveBeenLastCalledWith({
            address: result.data.header.join(','),
          });
        }
      }
    );
  }
);
