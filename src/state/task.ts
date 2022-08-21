import { Task, TaskStatus } from "../models/task";

type Listener = (items: Task[]) => void;

export class TasksState {
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

 export const tasksState = TasksState.getInstance();
 