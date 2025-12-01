export type FieldBuilder<T = any> = {
  required(msg?: string): FieldBuilder<NonNullable<T>>;
  optional(): FieldBuilder<T | undefined>;

  string(msg?: string): FieldBuilder<string>;
  number(msg?: string): FieldBuilder<number>;
  email(msg?: string): FieldBuilder<string>;

  min(len: number, msg?: string): FieldBuilder<T>;
  max(len: number, msg?: string): FieldBuilder<T>;
  minValue(val: number, msg?: string): FieldBuilder<T>;
  pattern(regex: RegExp, msg?: string): FieldBuilder<T>;

  array<U = any>(): FieldBuilder<U[]>;
  atLeast(count: number, msg?: string): FieldBuilder<T>;

  refine(check: (v: T) => boolean, msg: string): FieldBuilder<T>;

  _addRule(rule: (v: any) => string | null): FieldBuilder<T>;
  _getInput(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
};

export type Field<T = string> = FieldBuilder<T>;

export {};
