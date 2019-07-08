export class Optional<T> {
  static none<T>(): Optional<T> {
    return new Optional();
  }

  constructor(private value?: T) {}

  then<U>(mapper: (value: T) => U): U | null {
    if (!this.value) {
      return null;
    }
    return mapper(this.value);
  }

  asIs(): T | null {
    if (!this.value) {
      return null;
    }
    return this.value;
  }

  isPresent(): boolean {
    return !!this.value;
  }
}
