import { describe, expect, it } from "vitest";
import { HISTORY_LIMIT, createHistory } from "../app/utils/history";

describe("history", () => {
  it("undoes and redoes in LIFO order", () => {
    const history = createHistory<number>();
    history.push(1);
    history.push(2);

    expect(history.undo()).toBe(2);
    expect(history.undo()).toBe(1);
    expect(history.redo()).toBe(1);
    expect(history.redo()).toBe(2);
  });

  it("returns undefined when there is nothing to undo or redo", () => {
    const history = createHistory<number>();

    expect(history.undo()).toBeUndefined();
    expect(history.redo()).toBeUndefined();
  });

  it("clears the redo branch on a new entry after undo", () => {
    const history = createHistory<number>();
    history.push(1);
    history.push(2);
    history.undo();

    history.push(3);

    expect(history.canRedo.value).toBe(false);
    expect(history.redo()).toBeUndefined();
    expect(history.undo()).toBe(3);
    expect(history.undo()).toBe(1);
  });

  it(`keeps only the last ${HISTORY_LIMIT} entries`, () => {
    const history = createHistory<number>();
    for (let i = 1; i <= HISTORY_LIMIT + 10; i++) history.push(i);

    const undone: number[] = [];
    let entry = history.undo();
    while (entry !== undefined) {
      undone.push(entry);
      entry = history.undo();
    }

    expect(undone).toHaveLength(HISTORY_LIMIT);
    expect(undone[0]).toBe(HISTORY_LIMIT + 10);
    expect(undone.at(-1)).toBe(11);
  });

  it("reports canUndo / canRedo and resets on clear", () => {
    const history = createHistory<number>();
    expect(history.canUndo.value).toBe(false);

    history.push(1);
    expect(history.canUndo.value).toBe(true);

    history.undo();
    expect(history.canUndo.value).toBe(false);
    expect(history.canRedo.value).toBe(true);

    history.clear();
    expect(history.canUndo.value).toBe(false);
    expect(history.canRedo.value).toBe(false);
  });
});
