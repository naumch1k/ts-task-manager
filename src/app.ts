/// <reference path='./models/drag-drop.ts' />
/// <reference path='./models/task.ts' />
/// <reference path='./state/task.ts' />
/// <reference path='./utils/validation.ts' />
/// <reference path='./decorators/autobind.ts' />
/// <reference path='components/task-form.ts' />
/// <reference path='components/task-list.ts' />

namespace App {
    new TaskForm();
    new TaskList('todo');
    new TaskList('doing');
    new TaskList('done');
}
