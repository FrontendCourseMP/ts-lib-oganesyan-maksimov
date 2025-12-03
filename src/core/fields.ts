class FormConnector {
    formElement: HTMLFormElement;
    InputElements: HTMLElement[] = []; 
    constructor(element:HTMLFormElement) {
        this.formElement = element,
        this.fields();
    }

    fields() {
        this.InputElements = [];
        
        this.formElement.querySelectorAll('input, textarea, select').forEach(element => {
            this.InputElements.push(element as HTMLElement);
        });
    }
    getFields() {
        return this.InputElements;
    }
}
class Vadidition {
    //string поля
    maxLength() {

    }
}
class V {
    from: HTMLFormElement|null = null;
    constructor(element: HTMLFormElement) {
        form = new FormConnector(element)
    }
    validate() {

    }
}