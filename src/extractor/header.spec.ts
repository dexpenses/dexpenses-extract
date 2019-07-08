import { HeaderExtractor } from './header';

describe('Header extractor', () => {
  const extractor = new HeaderExtractor();

  it('should be successfully extract the relevant header lines', () => {
    const text = `* * Kundenbeleg * *
    Cinemaxx Entertainment
    CxX Göttingen
    Bahnhofsallee 3
    37081 Göttingen
    Datum:
    Uhrzeit:
    Beleg-Nr.
    Trace-Nr.
    23.05.2018
    19:47:44 Uhr
    `;
    const result = extractor.extract(
      text,
      text.split('\n').map((s) => s.trim()),
      {}
    );
    expect(result).not.toBeUndefined();
    if (result) {
      expect(result).toEqual([
        'Cinemaxx Entertainment',
        'CxX Göttingen',
        'Bahnhofsallee 3',
        '37081 Göttingen',
      ]);
    }
  });

  it('should be successfully extract the relevant header lines with initial skip', () => {
    const text = `* *
    Kundenbeleg * *
    Cinemaxx Entertainment
    CxX Göttingen
    Bahnhofsallee 3
    37081 Göttingen
    Datum:
    Uhrzeit:
    Beleg-Nr.
    Trace-Nr.
    23.05.2018
    19:47:44 Uhr
    `;
    const result = extractor.extract(
      text,
      text.split('\n').map((s) => s.trim()),
      {}
    );
    expect(result).not.toBeUndefined();
    if (result) {
      expect(result).toEqual([
        'Cinemaxx Entertainment',
        'CxX Göttingen',
        'Bahnhofsallee 3',
        '37081 Göttingen',
      ]);
    }
  });
});
