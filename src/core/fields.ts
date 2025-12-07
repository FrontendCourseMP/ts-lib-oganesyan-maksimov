type ValidationRule = {
    type: string;
    value?: any;
    error: string;
};

type ValidatorConfig = {
    rules: ValidationRule[];
};

class Validator {
    private element: HTMLElement;
    private config: ValidatorConfig;
    private value: any;

    constructor(element: HTMLElement) {
        this.element = element;
        this.config = { rules: [] };
        this.value = this.getValue();
    }

    private getValue(): any {
        if (this.element instanceof HTMLInputElement) {
            if (this.element.type === 'checkbox') {
                return this.element.checked;
            }
            if (this.element.type === 'number' || this.element.type === 'range') {
                return this.element.valueAsNumber;
            }
            return this.element.value;
        }
        if (this.element instanceof HTMLTextAreaElement) {
            return this.element.value;
        }
        if (this.element instanceof HTMLSelectElement) {
            return this.element.value;
        }
        return null;
    }

    string() {
        this.config.rules.push({
            type: 'isString',
            error: 'Поле должно быть строкой'
        });
        return this;
    }

    min(count: number, error: string = 'Минимальная длина не достигнута') {
        this.config.rules.push({
            type: 'min',
            value: count,
            error
        });
        return this;
    }

    max(count: number, error: string = 'Максимальная длина превышена') {
        this.config.rules.push({
            type: 'max',
            value: count,
            error
        });
        return this;
    }

    email(error: string = 'Некорректный email') {
        this.config.rules.push({
            type: 'email',
            error
        });
        return this;
    }

    required(error: string = 'Поле обязательно для заполнения') {
        this.config.rules.push({
            type: 'required',
            error
        });
        return this;
    }

    number() {
        this.config.rules.push({
            type: 'isNumber',
            error: 'Поле должно быть числом'
        });
        return this;
    }

    minNumber(value: number, error: string = 'Значение слишком маленькое') {
        this.config.rules.push({
            type: 'minNumber',
            value,
            error
        });
        return this;
    }

    maxNumber(value: number, error: string = 'Значение слишком большое') {
        this.config.rules.push({
            type: 'maxNumber',
            value,
            error
        });
        return this;
    }

    password() {
        return this;
    }

    confirm(passwordField: string, error: string = 'Пароли не совпадают') {
        this.config.rules.push({
            type: 'confirm',
            value: passwordField,
            error
        });
        return this;
    }

    array() {
        this.config.rules.push({
            type: 'isArray',
            error: 'Поле должно быть массивом'
        });
        return this;
    }

    minLength(count: number, error: string = 'Минимальное количество элементов не достигнуто') {
        this.config.rules.push({
            type: 'minLength',
            value: count,
            error
        });
        return this;
    }

    maxLength(count: number, error: string = 'Максимальное количество элементов превышено') {
        this.config.rules.push({
            type: 'maxLength',
            value: count,
            error
        });
        return this;
    }

    validate(): string | null {
        for (const rule of this.config.rules) {
            const error = this.checkRule(rule);
            if (error) return error;
        }
        return null;
    }

    private checkRule(rule: ValidationRule): string | null {
        switch (rule.type) {
            case 'isString':
                return typeof this.value !== 'string' ? rule.error : null;
                
            case 'required':
                if (this.value === null || this.value === undefined || this.value === '' || 
                    (Array.isArray(this.value) && this.value.length === 0)) {
                    return rule.error;
                }
                return null;
                
            case 'min':
                return typeof this.value === 'string' && this.value.length < rule.value ? rule.error : null;
                
            case 'max':
                return typeof this.value === 'string' && this.value.length > rule.value ? rule.error : null;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return typeof this.value === 'string' && !emailRegex.test(this.value) ? rule.error : null;
                
            case 'isNumber':
                return typeof this.value !== 'number' || isNaN(this.value) ? rule.error : null;
                
            case 'minNumber':
                return typeof this.value === 'number' && this.value < rule.value ? rule.error : null;
                
            case 'maxNumber':
                return typeof this.value === 'number' && this.value > rule.value ? rule.error : null;
                
            case 'isArray':
                return !Array.isArray(this.value) ? rule.error : null;
                
            case 'minLength':
                return Array.isArray(this.value) && this.value.length < rule.value ? rule.error : null;
                
            case 'maxLength':
                return Array.isArray(this.value) && this.value.length > rule.value ? rule.error : null;
                
            case 'confirm':
                return null;
                
            default:
                return null;
        }
    }
}

class FormConnector {
    formElement: HTMLFormElement;
    private inputElements: Map<string, HTMLElement> = new Map();

    constructor(element: HTMLFormElement) {
        this.formElement = element;
        this.collectFields();
    }

    private collectFields() {
        this.inputElements.clear();
        
        this.formElement.querySelectorAll<HTMLElement>('[field-name]').forEach(element => {
            const fieldName = element.getAttribute('field-name');
            if (fieldName) {
                this.inputElements.set(fieldName, element);
            }
        });
        
        this.formElement.querySelectorAll<HTMLElement>('input[name], textarea[name], select[name]').forEach(element => {
            const name = element.getAttribute('name');
            if (name && !this.inputElements.has(name)) {
                this.inputElements.set(name, element);
            }
        });
    }

    field(fieldName: string): HTMLElement | null {
        return this.inputElements.get(fieldName) || null;
    }

    getFields(): Map<string, HTMLElement> {
        return new Map(this.inputElements);
    }
}

class V {
    private form: FormConnector;
    private validators: Map<string, Validator> = new Map();

    constructor(element: HTMLFormElement) {
        this.form = new FormConnector(element);
    }

    field(fieldName: string): Validator {
        const element = this.form.field(fieldName);
        
        if (!element) {
            throw new Error(`Поле "${fieldName}" не найдено в форме`);
        }

        if (!this.validators.has(fieldName)) {
            this.validators.set(fieldName, new Validator(element));
        }
        
        return this.validators.get(fieldName)!;
    }

    validate(): { isValid: boolean; errors: Record<string, string | null> } {
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

    private showError(fieldName: string, error: string) {
        const element = this.form.field(fieldName);
        if (element) {
            element.classList.add('error');
            let errorElement = element.parentElement?.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                element.parentElement?.appendChild(errorElement);
            }
            errorElement.textContent = error;
        }
    }

    private clearError(fieldName: string) {
        const element = this.form.field(fieldName);
        if (element) {
            element.classList.remove('error');
            const errorElement = element.parentElement?.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
}

export function createValidator(form: HTMLFormElement): V {
    return new V(form);
}