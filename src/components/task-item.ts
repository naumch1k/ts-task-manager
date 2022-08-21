import { Component } from './base-component';
import { autobind } from '../decorators/autobind';
import { Task } from '../models/task';
import { Draggable } from '../models/drag-drop';

export class TaskItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
