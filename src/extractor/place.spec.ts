import { PlaceExtractor } from './place';
import * as gmaps from '@google/maps';

jest.mock('@google/maps');
const geocode = jest.fn().mockReturnValue({
  asPromise: jest.fn().mockResolvedValue({
    json: {
      results: [
        {
          //place_id: '0815'
        },
      ],
    },
  }),
});
(gmaps.createClient as any).mockReturnValue({
  geocode,
});

describe('PlaceExtractor', () => {
  const extractor = new PlaceExtractor('gmapsKey');

  it('should build the correct address query', () => {
    extractor.extract('', [], {
      header: ['Line 1', 'Line 2', 'Line 3'],
    });
    expect(geocode).toHaveBeenCalledTimes(1);
    expect(geocode).toHaveBeenLastCalledWith({
      address: 'Line 1,Line 2,Line 3',
    });
  });
});
