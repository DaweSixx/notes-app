import type { NoteInput, Todo } from "~/types/note";

export type TextOperation =
  | { type: "setTitle"; from: string; to: string }
  | { type: "setTodoText"; todoId: string; from: string; to: string };

export type NoteOperation =
  | TextOperation
  | { type: "toggleTodo"; todoId: string }
  | { type: "addTodo"; todo: Todo; index: number }
  | { type: "removeTodo"; todo: Todo; index: number }
  | { type: "reorderTodos"; from: string[]; to: string[] };

// what changed, so the page can move focus there after undo/redo
export type OperationTarget =
  | { field: "title" }
  | { field: "todo"; todoId: string; exists: boolean }
  | { field: "list" };

export function invertOperation(op: NoteOperation): NoteOperation {
  switch (op.type) {
    case "setTitle":
    case "setTodoText":
      return { ...op, from: op.to, to: op.from };
    case "toggleTodo":
      return op;
    case "addTodo":
      return { type: "removeTodo", todo: op.todo, index: op.index };
    case "removeTodo":
      return { type: "addTodo", todo: op.todo, index: op.index };
    case "reorderTodos":
      return { type: "reorderTodos", from: op.to, to: op.from };
  }
}

export function applyOperation(draft: NoteInput, op: NoteOperation): OperationTarget {
  switch (op.type) {
    case "setTitle":
      draft.title = op.to;
      return { field: "title" };
    case "setTodoText": {
      const todo = draft.todos.find((t) => t.id === op.todoId);
      if (todo) todo.text = op.to;
      return { field: "todo", todoId: op.todoId, exists: true };
    }
    case "toggleTodo": {
      const todo = draft.todos.find((t) => t.id === op.todoId);
      if (todo) todo.done = !todo.done;
      return { field: "todo", todoId: op.todoId, exists: true };
    }
    case "addTodo":
      draft.todos.splice(op.index, 0, { ...op.todo });
      return { field: "todo", todoId: op.todo.id, exists: true };
    case "removeTodo": {
      const index = draft.todos.findIndex((t) => t.id === op.todo.id);
      if (index !== -1) draft.todos.splice(index, 1);
      return { field: "todo", todoId: op.todo.id, exists: false };
    }
    case "reorderTodos": {
      const byId = new Map(draft.todos.map((t) => [t.id, t]));
      draft.todos = op.to.map((id) => byId.get(id)).filter((t): t is Todo => t !== undefined);
      return { field: "list" };
    }
  }
}
