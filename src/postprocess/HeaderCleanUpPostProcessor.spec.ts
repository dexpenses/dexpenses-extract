import HeaderCleanUpPostProcessor, {
  containsMostlyNumbers,
} from './HeaderCleanUpPostProcessor';
import { HeaderExtractor } from '../extractor/header';

describe('ContainsMostNumbers', () => {
  it('should match if at least 6 digits and more than 80% are digits', () => {
    expect(containsMostlyNumbers('Tel. 0123 4567890')).toBe(true);
    expect(containsMostlyNumbers('Im Wege 123')).toBe(false);
    expect(containsMostlyNumbers('38440 WOB')).toBe(false);
    expect(containsMostlyNumbers('38440')).toBe(false);
  });
});

describe('HeaderCleanUpPostProcessor', () => {
  it('should not fail if header is absent', () => {
    const headerCleanUpPostProcessor = new HeaderCleanUpPostProcessor();
    (headerCleanUpPostProcessor as any).headerExtractor = new HeaderExtractor();
    headerCleanUpPostProcessor.touch({});
  });
});
