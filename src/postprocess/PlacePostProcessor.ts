import { Receipt, Address } from '@dexpenses/core';
import PostProcessor from './PostProcessor';
import {
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from '@google/maps';

export default class PlacePostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    const place = extracted.place;
    if (!place) {
      return;
    }
    if (place.name) {
      extracted.header = [place.name];
    }
    if (place.address_components) {
      extracted.address = fromComponents(place.address_components);
    }
    if (!extracted.phone && place.formatted_phone_number) {
      extracted.phone = place.formatted_phone_number;
    }
  }
}

function extract(
  componentName: AddressType | GeocodingAddressComponentType,
  addressComponents: AddressComponent[]
): string | null {
  return (
    addressComponents
      .filter((ac) => ac.types.indexOf(componentName) !== -1)
      .map((ac) => ac.long_name)
      .shift() || null
  );
}

export function fromComponents(addressComponents: AddressComponent[]): Address {
  const city = extract('locality', addressComponents);
  const postalCode = extract('postal_code', addressComponents);
  const street = extract('route', addressComponents);
  const streetNumber = extract('street_number', addressComponents);
  return {
    street: `${street} ${streetNumber}`,
    zip: postalCode,
    city,
  };
}
