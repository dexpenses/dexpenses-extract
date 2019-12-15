import { PhoneNumberExtractor } from './phone';

describe('Phonenumber extractor', () => {
  const extractor = new PhoneNumberExtractor();

  it('should be successfully extract the phone number', () => {
    const phonenumbers = `
          0667695112
          +49 (0) 3817 859717
          (00646) 453182
          01904 968375
          04802167440
          +49(0) 753065489
          08011 221536
          (06789) 76778
          05415 57785
          01662107318
          (00552) 931712
          (08352) 24449
          (03049) 351075
          (07044) 292642
          (02101) 13675
          01817 242173
          0881668514
          +49(0)3220 09433
          06649 02071
          03575 946849
    `
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line);

    for (const phonenumber of phonenumbers) {
      const lines = ['Some Store', phonenumber];
      const extracted = {
        header: lines,
      };
      const extractedPhone = extractor.extract('', lines, extracted);
      expect(extractedPhone).toBe(phonenumber);
    }
  });
});
