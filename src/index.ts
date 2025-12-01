
import { NiceForm } from "./core/Form";
import type { NFormFactory } from "./types";

export const n = ((formOrSelector: HTMLFormElement | string) => {
  const form = typeof formOrSelector === "string"
    ? document.querySelector<HTMLFormElement>(formOrSelector)
    : formOrSelector;

  if (!form) throw new Error("Форма не найдена");
  return new NiceForm(form);
}) as NFormFactory;

export type { NForm, FormValidator } from "./types";
export type { Field } from "./types/field";
