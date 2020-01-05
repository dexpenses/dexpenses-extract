import { checkDependencies, DependsOn } from './DependsOn';
import { Extractor } from '../extractor/extractor';
import { Receipt } from '@dexpenses/core';

class ExtractorA extends Extractor<any> {
  public extract(text: string, lines: string[], extracted: Receipt): undefined {
    throw new Error('Method not implemented.');
  }
}
@DependsOn(ExtractorA)
class ExtractorB extends Extractor<any> {
  public extract(text: string, lines: string[], extracted: Receipt): undefined {
    throw new Error('Method not implemented.');
  }
}
@DependsOn(ExtractorA, ExtractorB)
class ExtractorC extends Extractor<any> {
  public extract(text: string, lines: string[], extracted: Receipt): undefined {
    throw new Error('Method not implemented.');
  }
}

describe('DependsOn', () => {
  it('should fail if dependency of an extractor is placed after the extractor in the pipeline', () => {
    expect(() =>
      checkDependencies([new ExtractorB(''), new ExtractorA('')] as any)
    ).toThrowErrorMatchingSnapshot();
  });

  it('should fail if second dependency of an extractor is placed after the extractor in the pipeline', () => {
    expect(() =>
      checkDependencies([
        new ExtractorA(''),
        new ExtractorC(''),
        new ExtractorB(''),
      ] as any)
    ).toThrowErrorMatchingSnapshot();
  });

  it('should successfully verify dependencies if correct order is provided (1 dependency)', () => {
    expect(() =>
      checkDependencies([new ExtractorA(''), new ExtractorB('')])
    ).not.toThrowError();
  });

  it('should successfully verify dependencies if correct order is provided (2 dependencies)', () => {
    expect(() =>
      checkDependencies([
        new ExtractorA(''),
        new ExtractorB(''),
        new ExtractorC(''),
      ])
    ).not.toThrowError();
  });
});
