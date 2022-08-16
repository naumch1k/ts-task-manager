namespace App {
    export enum TaskStatus {
        Todo,
        Doing,
        Done,
    }
    
    export class Task {
        constructor(
            public id: string,
            public title: string,
            public description: string,
            public status: TaskStatus,
        ) {}
    }
}