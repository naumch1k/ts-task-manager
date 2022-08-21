/// <reference path='components/task-form.ts' />
/// <reference path='components/task-list.ts' />

namespace App {
    new TaskForm();
    new TaskList('todo');
    new TaskList('doing');
    new TaskList('done');
}
