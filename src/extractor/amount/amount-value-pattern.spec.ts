import {
  AmountValuePatternMatcher,
  AmountValuePattern,
} from './amount-value-pattern';

describe('amount-value-pattern', () => {
  it('should call match fn for each tuple and yield the correct result', () => {
    const def: AmountValuePattern = {
      startAt: 'end',
      count: 2,
      match([v1, v2]) {
        if (v1.value === v2.value) {
          return [v1, v2];
        }
        return null;
      },
      getResult: (rs) => rs[0][0].value,
    };
    const matcher = new AmountValuePatternMatcher(def);
    const matchFn = jest.spyOn(def, 'match');
    const getResultFn = jest.spyOn(def, 'getResult');
    expect(matcher.match([1, 1, 2, 3, 3].map((value) => ({ value })))).toBe(3);
    expect(getResultFn).toHaveBeenCalledTimes(1);
    expect(getResultFn).toHaveBeenCalledWith([
      [{ value: 3 }, { value: 3 }],
      [{ value: 1 }, { value: 1 }],
    ]);
    expect(matchFn.mock.calls.map(([arg]) => arg)).toEqual(
      [
        [3, 3],
        [2, 3],
        [1, 2],
        [1, 1],
      ].map((values) => values.map((value) => ({ value })))
    );
  });
});
