namespace App {
    export interface Validatable {
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
    }

    export function validate(validatableInput: Validatable) {
        let isValid = true;

        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }

        if (validatableInput.minLength && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }

        if (validatableInput.maxLength && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }

        return isValid;
    }
}
