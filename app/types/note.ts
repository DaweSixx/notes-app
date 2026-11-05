export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  todos: Todo[];
  createdAt: number;
  updatedAt: number;
}

export type NoteInput = Pick<Note, "title" | "todos">;
