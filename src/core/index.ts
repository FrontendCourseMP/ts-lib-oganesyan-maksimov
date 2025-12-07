import { Validator } from './validator';
import { FormConnector } from './form-connector';
import type { ValidationResult, FieldOptions } from '../types/index.ts';

class V {
    private form: FormConnector;
    private validators: Map<string, Validator> = new Map();
    private options: FieldOptions;

    constructor(element: HTMLFormElement, options?: FieldOptions) {
        this.options = options || {};
        this.form = new FormConnector(element, options);
    }

    static form(element: HTMLFormElement, options?: FieldOptions): V {
        return new V(element, options);
    }

    field(fieldName: string): Validator {
        const element = this.form.field(fieldName);
        
        if (!element) {
            throw new Error(`Поле "${fieldName}" не найдено в форме`);
        }

        if (!this.validators.has(fieldName)) {
            this.validators.set(fieldName, new Validator(
                element, 
                this.form.getFormElement(), 
                fieldName,
                this.options
            ));
        }
        
        return this.validators.get(fieldName)!;
    }

    validate(): ValidationResult {
        const errors: Record<string, string | null> = {};
        let isValid = true;

        for (const [fieldName, validator] of this.validators) {
            const error = validator.validate();
            errors[fieldName] = error;
            
            if (error) {
                isValid = false;
                this.showError(fieldName, error);
            } else {
                this.clearError(fieldName);
            }
        }

        return { isValid, errors };
    }

    validateField(fieldName: string): string | null {
        const validator = this.validators.get(fieldName);
        if (!validator) {
            throw new Error(`Валидатор для поля "${fieldName}" не найден`);
        }

        const error = validator.validate();
        
        if (error) {
            this.showError(fieldName, error);
        } else {
            this.clearError(fieldName);
        }

        return error;
    }

    private showError(fieldName: string, error: string) {
        const element = this.form.field(fieldName);
        if (element) {
            element.classList.remove(this.options.validClass || 'valid');
            element.classList.add(this.options.invalidClass || 'invalid');
            element.classList.add(this.options.errorClass || 'error');
            
            let errorContainer = this.form.getErrorContainer(fieldName);
            
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.className = 'error-message';
                errorContainer.setAttribute('data-field', fieldName);
                
                const label = this.form.getLabel(fieldName);
                if (label && label.nextSibling) {
                    label.parentNode?.insertBefore(errorContainer, label.nextSibling);
                } else {
                    element.parentNode?.appendChild(errorContainer);
                }
            }
            
            errorContainer.textContent = error;
            errorContainer.style.display = 'block';
        }
    }

    private clearError(fieldName: string) {
        const element = this.form.field(fieldName);
        if (element) {
            element.classList.remove(this.options.errorClass || 'error');
            element.classList.remove(this.options.invalidClass || 'invalid');
            element.classList.add(this.options.validClass || 'valid');
            
            const errorContainer = this.form.getErrorContainer(fieldName);
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
            }
        }
    }

    reset() {
        for (const [fieldName] of this.validators) {
            this.clearError(fieldName);
        }
    }

    getForm(): HTMLFormElement {
        return this.form.getFormElement();
    }
}

export default V;

export const createValidator = (form: HTMLFormElement, options?: FieldOptions) => {
    return V.form(form, options);
};