export default class Scanner {
  i = 0;

  constructor(private s: string) {}

  get current() {
    return this.s[this.i];
  }

  advance() {
    this.i += 1;
  }

  hasMore() {
    return this.i < this.s.length;
  }

  consumeUntil(until: string) {
    let res = '';
    while (this.hasMore() && this.current !== until) {
      res += this.current;
      this.advance();
    }
    return res;
  }

  consumeUntilOneOf(until: string[]) {
    let res = '';
    while (this.hasMore() && !until.includes(this.current)) {
      res += this.current;
      this.advance();
    }
    return res;
  }

  consumeSame() {
    const same = this.current;
    let res = '';
    while (this.hasMore() && this.current === same) {
      res += this.current;
      this.advance();
    }
    return res;
  }
}
