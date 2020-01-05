import { DependsOn } from '../pipeline/DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from '@dexpenses/core';
import {
  createClient as createGmapsClient,
  GeocodingResult,
  PlaceDetailsResult,
  GoogleMapsClient,
} from '@google/maps';
import { PhoneNumberExtractor } from './phone';
import { DateExtractor } from './date';
import { TimeExtractor } from './time';

export type Place = GeocodingResult & PlaceDetailsResult;

@DependsOn(HeaderExtractor, PhoneNumberExtractor, DateExtractor, TimeExtractor)
export class PlaceExtractor extends Extractor<Place> {
  private readonly client: GoogleMapsClient;

  constructor(gmapsKey: string) {
    super('place');
    this.client = createGmapsClient({
      key: gmapsKey,
      Promise,
    });
  }

  public async extract(text: string, lines: string[], extracted: Receipt) {
    if (!extracted.header || extracted.header.length === 0) {
      return null;
    }
    const address = extracted.header.join(',');
    const res = await this.client.geocode({ address }).asPromise();
    const result = res.json.results[0];
    if (res.json.status === 'ZERO_RESULTS') {
      return null;
    }
    if (!result.place_id) {
      return { value: result as Place };
    }
    const pdr = await this.client
      .place({
        placeid: result.place_id,
        fields: ['name', 'formatted_phone_number', 'website'],
      })
      .asPromise();
    return { value: { ...result, ...pdr.json.result } as Place };
  }
}
