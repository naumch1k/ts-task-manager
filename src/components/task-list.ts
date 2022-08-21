/// <reference path='base-component.ts' />

namespace App {
    export class TaskList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
            this.element.querySelector('span')!.textContent = this.assignedTasks.length.toString();
        }

        private renderTasks() {
            const listEl = document.getElementById(`${this.status}-tasks-list`) as HTMLUListElement;

            listEl.innerHTML = '';
            this.element.querySelector('span')!.textContent = this.assignedTasks.length.toString();

            for (const task of this.assignedTasks) {
                new TaskItem(this.element.querySelector('ul')!.id, task);
            }
        }
    }
}
