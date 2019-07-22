import { Optional } from './Optional';

describe('Optional.empty', () => {
  it('should not be present', () => {
    expect(Optional.none().isPresent()).toBe(false);
    expect(new Optional().isPresent()).toBe(false);
    expect(new Optional(null).isPresent()).toBe(false);
  });

  it('should have "null" as "asIs" value', () => {
    expect(Optional.none().asIs()).toBe(null);
    expect(new Optional().asIs()).toBe(null);
    expect(new Optional(null).asIs()).toBe(null);
  });

  it('should not call mapper on "then" and instead return null', () => {
    const mapper = jest.fn().mockImplementation((x) => x);
    expect(Optional.none().then(mapper)).toBe(null);
    expect(mapper).not.toHaveBeenCalled();
    expect(new Optional().then(mapper)).toBe(null);
    expect(mapper).not.toHaveBeenCalled();
    expect(new Optional(null).then(mapper)).toBe(null);
    expect(mapper).not.toHaveBeenCalled();
  });
});

describe('Optional integer with value', () => {
  it('should be present', () => {
    expect(new Optional(0).isPresent()).toBe(true);
    expect(new Optional(1).isPresent()).toBe(true);
  });

  it('should retain "asIs" value', () => {
    expect(new Optional(0).asIs()).toBe(0);
    expect(new Optional(1).asIs()).toBe(1);
  });

  it('should apply mapper', () => {
    expect(new Optional(0).then((x) => x + 1)).toBe(1);
    expect(new Optional(1).then((x) => x + 1)).toBe(2);
  });
});
