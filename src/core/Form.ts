
import type { Field, FormValidator } from "../types";

export class NiceForm implements FormValidator {
  private rulesMap: Map<string, ((value: any) => string | null)[]> = new Map();
  private form: HTMLFormElement;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.form.noValidate = true;
  }

  field<T = string>(name: string): Field<T> {
    const element = this.form.elements.namedItem(name);
    if (!element) throw new Error(`Поле "${name}" не найдено в форме`);

    const rules: ((value: any) => string | null)[] = [];
    this.rulesMap.set(name, rules);

    const add = (rule: (value: any) => string | null) => {
      rules.push(rule);
      return builder;
    };

    const builder = {
      required: (msg = "Обязательное поле") =>
        add((v: any) => (v === "" || v == null || v === false) ? msg : null),

      string: () => builder as any,
      number: () => builder as any,
      email: (msg = "Неверный email") =>
        add((v: any) => /^\S+@\S+\.\S+$/.test(String(v)) ? null : msg),

      min: (len: number, msg?: string) =>
        add((v: any) => String(v).length >= len ? null : msg ?? `Минимум ${len} символов`),

      max: (len: number, msg?: string) =>
        add((v: any) => String(v).length <= len ? null : msg ?? `Максимум ${len} символов`),

      minValue: (n: number, msg?: string) =>
        add((v: any) => !isNaN(Number(v)) && Number(v) >= n ? null : msg ?? `Не меньше ${n}`),

      pattern: (re: RegExp, msg = "Неверный формат") =>
        add((v: any) => re.test(String(v)) ? null : msg),

      atLeast: (count: number, msg = `Выберите хотя бы ${count}`) =>
        add((v: any) => Array.isArray(v) && v.length >= count ? null : msg),

      _addRule: add,
      _getInput: () => element as HTMLElement,
    } as const;

    return builder as any;
  }

  validate(): boolean {
    this.clearErrors();
    let isValid = true;

    for (const [name, rules] of this.rulesMap) {
      const elements = this.form.elements.namedItem(name);

      const inputs: HTMLInputElement[] =
        elements instanceof RadioNodeList
          ? Array.from(elements as NodeListOf<HTMLInputElement>)
          : elements instanceof HTMLInputElement
            ? [elements]
            : [];

      if (inputs.length === 0) continue;

      const value =
        inputs[0].type === "checkbox" || inputs[0].type === "radio"
          ? inputs.filter(i => i.checked).map(i => i.value)
          : inputs[0].value;

      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          inputs.forEach(input => this.showError(input, error));
          isValid = false;
        }
      }

      inputs.forEach(input => {
        if (!input.checkValidity()) {
          this.showError(input, input.validationMessage || "Неверное значение");
          isValid = false;
        }
      });
    }

    return isValid;
  }

  clearErrors() {
    this.form.querySelectorAll(".n-error").forEach(el => el.remove());
    this.form.querySelectorAll("input, textarea, select").forEach(el => {
      (el as HTMLElement).style.borderColor = "";
    });
  }

  private showError(input: HTMLElement, msg: string) {
    input.parentElement?.querySelector(".n-error")?.remove();
    input.style.borderColor = "red";

    const errorEl = document.createElement("div");
    errorEl.className = "n-error";
    errorEl.style.cssText = "color: red; font-size: 0.85em; margin-top: 4px;";
    errorEl.textContent = msg;
    input.after(errorEl);
  }

  onSubmit(callback: (data: FormData) => void) {
    this.form.addEventListener("submit", e => {
      e.preventDefault();
      if (this.validate()) {
        callback(new FormData(this.form));
      }
    });
  }
}
