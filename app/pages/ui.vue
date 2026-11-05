<script setup lang="ts">
// temporary component showcase — delete before submission
import ConfirmModal from "~/components/modals/ConfirmModal.vue";
import { icons, type IconName } from "~/utils/icons";

const modal = useModal();
const toast = useToast();

const iconNames = Object.keys(icons) as IconName[];
const checkA = ref(false);
const checkB = ref(true);
const done = ref(2);
const lastResult = ref("—");

async function openDanger() {
  const result = await modal.open(ConfirmModal, {
    title: "Удалить заметку?",
    text: "«Покупки на неделю» и все её задачи будут удалены без возможности восстановления.",
    confirmText: "Удалить",
  });
  lastResult.value = String(result);
}

async function openWarn() {
  const result = await modal.open(ConfirmModal, {
    title: "Выйти без сохранения?",
    text: "В заметке есть несохранённые изменения. Если выйти сейчас, они будут потеряны.",
    confirmText: "Выйти",
    cancelText: "Остаться",
    tone: "warn",
  });
  lastResult.value = String(result);
}

function openStacked() {
  modal
    .open(ConfirmModal, {
      title: "Нижняя модалка",
      text: "Закрой верхнюю — фокус и Escape вернутся сюда.",
      confirmText: "Ок",
      tone: "warn",
    })
    .then((result) => (lastResult.value = `нижняя: ${result}`));
  modal
    .open(ConfirmModal, {
      title: "Верхняя модалка",
      text: "Tab и Escape сейчас работают только здесь.",
      confirmText: "Ок",
    })
    .then((result) => (lastResult.value = `верхняя: ${result}`));
}
</script>

<template>
  <div class="ui">
    <header>
      <p class="eyebrow">Временная страница</p>
      <h1 class="title">UI-кит</h1>
      <p class="muted">Витрина базовых компонентов. Удалить перед сдачей.</p>
    </header>

    <section class="block">
      <h2>Кнопки</h2>
      <div class="row">
        <BaseButton icon="plus">Primary</BaseButton>
        <BaseButton variant="ghost" icon="x">Ghost</BaseButton>
        <BaseButton variant="plain" icon="arrowLeft">Plain</BaseButton>
        <BaseButton variant="danger" icon="trash">Danger</BaseButton>
        <BaseButton variant="danger-ghost" icon="trash">Danger ghost</BaseButton>
      </div>
      <div class="row">
        <BaseButton size="sm" icon="save">Small</BaseButton>
        <BaseButton size="sm" variant="ghost">Small ghost</BaseButton>
        <BaseButton disabled icon="save">Disabled</BaseButton>
        <BaseButton to="/" variant="ghost" icon="arrowLeft">Ссылка на главную</BaseButton>
      </div>
    </section>

    <section class="block">
      <h2>Кнопки-иконки</h2>
      <div class="row">
        <BaseIconButton icon="edit" label="Редактировать" tip="Редактировать" />
        <BaseIconButton icon="trash" label="Удалить" tip="Удалить" variant="danger" />
        <BaseIconButton icon="undo" label="Отменить" tip="Отменить · Ctrl+Z" />
        <BaseIconButton icon="redo" label="Повторить" tip="Повторить · Ctrl+Shift+Z" disabled />
      </div>
    </section>

    <section class="block">
      <h2>Иконки</h2>
      <ul class="icons">
        <li v-for="name in iconNames" :key="name">
          <BaseIcon :name="name" :size="22" />
          <span>{{ name }}</span>
        </li>
      </ul>
    </section>

    <section class="block">
      <h2>Чекбокс</h2>
      <div class="row">
        <div class="check-row">
          <BaseCheckbox v-model="checkA" label="Первый" />
          <code>{{ checkA }}</code>
        </div>
        <div class="check-row">
          <BaseCheckbox v-model="checkB" label="Второй" />
          <code>{{ checkB }}</code>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>Прогресс и бейджи</h2>
      <div class="stack">
        <BaseProgress :done="0" :total="3" />
        <BaseProgress :done="done" :total="5" size="md" />
        <BaseProgress :done="3" :total="3" />
      </div>
      <div class="row">
        <BaseButton size="sm" variant="ghost" :disabled="done === 0" @click="done--">−1</BaseButton>
        <BaseButton size="sm" variant="ghost" :disabled="done === 5" @click="done++">+1</BaseButton>
        <span class="muted">{{ done }} / 5</span>
      </div>
      <div class="row">
        <BaseBadge variant="success" icon="check">Готово</BaseBadge>
        <BaseBadge variant="draft" icon="history">Черновик</BaseBadge>
      </div>
    </section>

    <section class="block">
      <h2>Модалки</h2>
      <div class="row">
        <BaseButton variant="danger" @click="openDanger">Confirm: danger</BaseButton>
        <BaseButton variant="ghost" @click="openWarn">Confirm: warn</BaseButton>
        <BaseButton variant="ghost" @click="openStacked">Две модалки стеком</BaseButton>
      </div>
      <p class="muted">
        Результат: <code>{{ lastResult }}</code>
      </p>
    </section>

    <section class="block">
      <h2>Тосты</h2>
      <div class="row">
        <BaseButton variant="ghost" @click="toast.show('Заметка сохранена')">Success</BaseButton>
        <BaseButton variant="ghost" @click="toast.show('Заметку удалили в другой вкладке', 'warn')">
          Warn
        </BaseButton>
      </div>
    </section>

    <section class="block">
      <h2>Клавиши</h2>
      <p class="muted">
        <kbd>Ctrl</kbd> <kbd>Z</kbd> отменить · <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd> повторить
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.ui {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.eyebrow {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-2);
}

.title {
  margin: 6px 0 8px;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.muted {
  color: var(--muted);
}

.block {
  @include glass;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: var(--radius);

  h2 {
    font-size: 18px;
    font-weight: 800;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 420px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    border-radius: 12px;
    background: var(--hover);
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
  }
}
</style>
