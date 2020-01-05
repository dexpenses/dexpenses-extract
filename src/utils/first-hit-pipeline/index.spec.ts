import FirstHitPipeline from '.';
import { processIf, fn } from './Stage';

describe('FirstHitPipeline', () => {
  it('should be null for empty pipeline', () => {
    const pipeline = new FirstHitPipeline<string, string>([]);
    expect(pipeline.run('')).toBeNull();
  });

  it('should return first hit', () => {
    const pipeline = new FirstHitPipeline<string, string>([
      processIf(
        (s) => s === 'foo',
        () => 'O'
      ),
      processIf(
        (s) => s.length === 3,
        (s) => s[1]
      ),
    ]);

    expect(pipeline.run('foo')).toBe('O');
    expect(pipeline.run('bar')).toBe('a');
    expect(pipeline.run('0815')).toBeNull();
  });

  it.each([[0], [''], [false]])(
    'should handle value "%s" (coerced to false) correctly',
    (value) => {
      const nextStage = jest.fn();
      const pipeline = new FirstHitPipeline<any, any>([
        fn(() => value),
        fn(nextStage),
      ]);
      expect(pipeline.run(value)).toBe(value);
      expect(nextStage).not.toHaveBeenCalled();
    }
  );
});
