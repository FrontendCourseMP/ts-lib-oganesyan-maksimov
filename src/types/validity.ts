export interface BrowserValidity {
  badInput: boolean;
  customError: boolean;
  patternMismatch: boolean;
  rangeOverflow: boolean;
  rangeUnderflow: boolean;
  stepMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  typeMismatch: boolean;
  valid: boolean;
  valueMissing: boolean;
}

// HTML-атрибуты валидации 
export interface InputConstraints {
  required?: boolean | "";
  min?: string | number;
  max?: string | number;
  minlength?: number;
  maxlength?: number;
  pattern?: string;
  type?: string;
  step?: string | number;
  multiple?: boolean | "";
}

declare global {
  interface HTMLInputElement {}

  interface HTMLTextAreaElement {}
  interface HTMLSelectElement {}

  interface HTMLElement {
    readonly validity: ValidityState;
    readonly validationMessage: string;
    checkValidity(): boolean;
    setCustomValidity(message: string): void;
  }
}

export {};
