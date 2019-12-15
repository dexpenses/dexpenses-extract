import { checkDependencies } from './DependsOn';
import { getPipelineStages } from '.';

describe('Extractor pipeline', () => {
  it('should satisfy all dependencies', () => {
    const extractorPipeline = getPipelineStages({ gmaps: { key: '' } }, {});
    expect(() => checkDependencies(extractorPipeline)).not.toThrowError();
  });
});
