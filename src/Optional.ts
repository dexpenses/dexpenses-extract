export class Optional<T> {
  static none<T>(): Optional<T> {
    return new Optional();
  }

  constructor(private value?: T | null) {}

  then<U>(mapper: (value: T) => U): U | null {
    if (!this.isPresent()) {
      return null;
    }
    return mapper(this.value!);
  }

  asIs(): T | null {
    if (!this.isPresent()) {
      return null;
    }
    return this.value!;
  }

  isPresent(): boolean {
    return this.value !== undefined && this.value !== null;
  }
}
