// drag & drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Task Type
enum TaskStatus {
    Todo,
    Doing,
    Done,
}

class Task {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public status: TaskStatus,
    ) {}
}

// state management
type Listener = (items: Task[]) => void;

class TasksState {
    private listeners: Listener[] = [];
    private tasks: Task[] = [];
    private static instance: TasksState;

    private constructor() {}

    static getInstance() {
        if (this.instance) this.instance; 

        this.instance = new TasksState;
        return this.instance; 
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addTask(title: string, description: string) {
        const newTask = new Task(
            Math.random().toString(),
            title,
            description,
            TaskStatus.Todo,
        );

        this.tasks.push(newTask);
        this.updateListeners();
    }

    moveTask(taskId: string, newStatus: TaskStatus) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {        
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

abstract  class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string,
    ) {
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId) as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) this.element.id = newElementId;

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtStart ? 'afterbegin' : 'beforeend',
            this.element,
        );
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class TaskItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private task: Task;

    constructor(hostId: string, task: Task) {
        super('single-task', hostId, false, task.id);
        this.task = task;

        this.configure();
        this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.task.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent) {}

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector('h3')!.textContent = this.task.title;
        this.element.querySelector('p')!.textContent = this.task.description;
    }
}

class TaskList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedTasks: Task[];

    constructor(private status: 'todo' | 'doing' | 'done') {
        super('task-list', 'app', false, `${status}-tasks`);

        this.assignedTasks = [];

        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();

            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }
    
    @autobind
    dropHandler(event: DragEvent) {
        const taskId = event.dataTransfer!.getData('text/plain');

        tasksState.moveTask(
            taskId,
            this.status === 'todo'
                ? TaskStatus.Todo
                : this.status === 'doing'
                    ? TaskStatus.Doing
                    : TaskStatus.Done
        );

        const listElements = this.element.querySelectorAll('ul')!;
        listElements.forEach(element => element.classList.remove('droppable'))
    }

    @autobind
    dragLeaveHandler(_: DragEvent) {
        const listElements = this.element.querySelectorAll('ul')!;
        listElements.forEach(element => element.classList.remove('droppable'))
        
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        tasksState.addListener((tasks: Task[]) => {
            const filteredTasks = tasks.filter(task => {
                if (this.status === 'todo') { 
                    return task.status === TaskStatus.Todo;
                }
                if (this.status === 'doing') {
                    return task.status === TaskStatus.Doing;
                }
                if (this.status === 'done') {
                    return task.status === TaskStatus.Done;
                }
                return;
            });

            this.assignedTasks = filteredTasks;
            this.renderTasks();
        });
    }

    renderContent() {
        const listId = `${this.status}-tasks-list`;
        this.element.querySelector('ul')!.id = listId;
        // TODO: capitalize first letter
        this.element.querySelector('h2')!.textContent = this.status;
    }

    private renderTasks() {
        const listEl = document.getElementById(`${this.status}-tasks-list`) as HTMLUListElement;

        listEl.innerHTML = '';

        for (const task of this.assignedTasks) {
            new TaskItem(this.element.querySelector('ul')!.id, task);
        }
    }
}

class TaskForm extends Component<HTMLDivElement, HTMLFormElement> {
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

const taskForm = new TaskForm();
const toDoTaskList = new TaskList('todo');
const doingTaskList = new TaskList('doing');
const doneTaskList = new TaskList('done');
