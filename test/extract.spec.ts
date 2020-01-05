import extractReceipt from '../src';
import { testSuites } from './util';

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

const userData = {
  phoneNumber: '+491234567890',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each(testSuites)(
  'Extract receipt cloud function (offline) for "%s" receipts',
  (suite, cases) => {
    it.each(cases)(
      "should successfully extract info from '%s'",
      async (name, path, text) => {
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
