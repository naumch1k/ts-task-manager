class TaskForm {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('task-form') as HTMLTemplateElement;
        this.hostElement = document.getElementById('app') as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private getUserInput(): [string, string] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;

        // TODO: improve validation
        if (
            enteredTitle.trim().length === 0 ||
            enteredDescription.trim().length === 0
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

    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();

        if (Array.isArray(userInput)) {
            const [title, description] = userInput;
            console.log(title, description);
            this.clearForm();
        }
    }

    private configure() {
        // TODO: create autobind decorator
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const taskForm = new TaskForm();