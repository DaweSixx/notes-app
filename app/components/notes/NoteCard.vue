
<script setup lang="ts">
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface Props {
  title: string;
  date: string;
  todos: Todo[];
}

defineProps<Props>();
</script>

<template>
  <article class="note-card">
    <div class="note-top">
      <h2>{{ title }}</h2>
      <button class="more-button" aria-label="Note options">···</button>
    </div>

    <p class="note-date">{{ date }}</p>

    <div class="todo-list">
      <label
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
      >
        <input type="checkbox" :checked="todo.done" disabled />
        <span :class="{ completed: todo.done }">
          {{ todo.text }}
        </span>
      </label>
    </div>

    <div class="note-footer">
      <span>
        {{ todos.filter(todo => todo.done).length }}
        of {{ todos.length }} completed
      </span>

      <span class="progress">
        <span
          :style="{
            width: `${todos.length
              ? todos.filter(todo => todo.done).length / todos.length * 100
              : 0}%`
          }"
        />
      </span>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.note-card {
  min-height: 235px;
  display: flex;
  flex-direction: column;
  padding: 22px;
  border: 1px solid #eeedf4;
  border-radius: 15px;
  background: white;
  box-shadow: 0 3px 12px #24204408;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 9px 25px #24204410;
  }
}

.note-top {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
}

.more-button {
  border: 0;
  background: transparent;
  color: #9995aa;
  font-size: 23px;
  cursor: pointer;
}

.note-date {
  margin: 7px 0 20px;
  color: #aaa7b8;
  font-size: 11px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5c596e;
  font-size: 12px;

  input {
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: #7665e8;
  }
}

.completed {
  color: #aaa7b5;
  text-decoration: line-through;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 22px;
  color: #aaa7b5;
  font-size: 10px;
}

.progress {
  width: 65px;
  height: 4px;
  overflow: hidden;
  border-radius: 5px;
  background: #eeeef4;

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #7665e8;
  }
}
</style>
