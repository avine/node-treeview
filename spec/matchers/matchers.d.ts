declare namespace jasmine {
  interface Matchers<T> {
    toContainItem(expected: any): boolean;
  }
}
