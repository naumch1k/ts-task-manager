// state management
class TasksState {
    private listeners: any[] = [];
    private tasks: any[] = [];
    private static instance: TasksState;

    private constructor() {

    }

    static getInstance() {
        if (this.instance) this.instance; 

        this.instance = new TasksState;
        return this.instance; 
    }

    addListener(listenerFn: Function) {
        this.listeners.push(listenerFn);
    }

    addTask(title: string, description: string) {
        const newTask = {
            id: Math.random().toString(),
            title: title,
            description: description,
        };

        this.tasks.push(newTask);

        for (const listenerFn of this.listeners) {
            listenerFn(this.tasks.slice());
        }
    }
}

const tasksState = TasksState.getInstance();

// validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}

function validate(validatableInput: Validatable) {
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

// autobind decorator
function autobind(
    _: any,
    _2:string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
         const boundFn = originalMethod.bind(this);
         return boundFn;
        }
    };
    return adjDescriptor;
}

class TaskList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedTasks: any[];

    constructor(private status: 'todo' | 'doing' | 'done') {
        this.templateElement = document.getElementById('task-list') as HTMLTemplateElement;
        this.hostElement = document.getElementById('app') as HTMLDivElement;
        this.assignedTasks = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.status}-tasks`;

        tasksState.addListener((tasks: any[]) => {
            this.assignedTasks = tasks;
            this.renderTasks();
        });

        this.attach();
        this.renderContent();
    }

    private renderTasks() {
       const listEl = document.getElementById(`${this.status}-tasks-list`) as HTMLUListElement;

        for (const task of this.assignedTasks) {
            const listItem = document.createElement('li');
            listItem.textContent = task.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.status}-tasks-list`;
        this.element.querySelector('ul')!.id = listId;
        // TODO: capitalize first letter
        this.element.querySelector('h2')!.textContent = this.status;
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

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

    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const taskForm = new TaskForm();
const toDoTaskList = new TaskList('todo');
const DoingTaskList = new TaskList('doing');
const DoneTaskList = new TaskList('done');
