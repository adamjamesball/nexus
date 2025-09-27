declare namespace Testing {
  type AnyFunction = (...args: any[]) => any;
}

declare interface JestMock<T extends Testing.AnyFunction = Testing.AnyFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation(fn: T): this;
  mockResolvedValue(value: Awaited<ReturnType<T>>): this;
  mockRejectedValue(value: unknown): this;
  mockReturnValue(value: ReturnType<T>): this;
  mockClear(): this;
}

declare const jest: {
  fn<T extends Testing.AnyFunction = Testing.AnyFunction>(impl?: T): JestMock<T>;
  mock(moduleName: string, factory?: () => unknown): void;
  spyOn<T, M extends keyof T>(object: T, method: M): JestMock<
    T[M] extends Testing.AnyFunction ? T[M] : Testing.AnyFunction
  >;
  useFakeTimers(): void;
  useRealTimers(): void;
  clearAllMocks(): void;
};

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;

declare interface JestExpect {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toHaveBeenCalledTimes(times: number): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
  toContain(item: unknown): void;
  toMatchInlineSnapshot(snapshot?: string): void;
  toBeInTheDocument(): void;
  toHaveTextContent(text: string | RegExp): void;
}

declare function expect(actual: unknown): JestExpect;
