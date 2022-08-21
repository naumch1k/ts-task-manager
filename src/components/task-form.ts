/// <reference path='base-component.ts' />

namespace App {
    export class TaskForm extends Component<HTMLDivElement, HTMLFormElement> {
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;

        constructor() {
            super('task-form', 'app', true, 'user-input');

            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;

            this.configure();
        }

        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }

        renderContent() {}

        private getUserInput(): [string, string] | void {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;

            const titleValidatable: Validatable = {
                value: enteredTitle,
                required: true,
                minLength: 2,
                maxLength: 20,
            }

            const descriptionValidatable: Validatable = {
                value: enteredDescription,
                required: true,
                minLength: 2,
                maxLength: 50, 
            }

            if (
                !validate(titleValidatable) ||
                !validate(descriptionValidatable)
            ) {
                alert('Invalid input, please try again');
                return;
            } else {
                return [enteredTitle, enteredDescription];
            }
        }

        private clearForm() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
        }

        @autobind
        private submitHandler(event: Event) {
            event.preventDefault();
            const userInput = this.getUserInput();

            if (Array.isArray(userInput)) {
                const [title, description] = userInput;
                tasksState.addTask(title, description);
                this.clearForm();
            }
        }
    }
}
