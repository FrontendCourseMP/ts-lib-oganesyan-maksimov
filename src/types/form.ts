import type { Field } from "./field";

export interface FormValidator {
  field<T = string>(name: string): Field<T>;
  validate(): boolean;
  clearErrors(): void;
  onSubmit(cb: (data: FormData) => void): void;
}

export type NForm = FormValidator;

export interface NFormFactory {
  (form: HTMLFormElement): NForm;
  (selector: string): NForm;
}
