<script setup lang="ts">
defineProps<{ label: string }>();

const model = defineModel<boolean>({ required: true });

// pop only on user interaction, not when an already-checked box is rendered
const pop = ref(false);

function onChange(event: Event) {
  pop.value = (event.target as HTMLInputElement).checked;
}
</script>

<template>
  <label class="check">
    <input v-model="model" type="checkbox" :aria-label="label" @change="onChange" >
    <span class="box" :class="{ pop }" aria-hidden="true" @animationend="pop = false">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  </label>
</template>

<style lang="scss" scoped>
.check {
  position: relative;
  display: grid;
  flex-shrink: 0;
  cursor: pointer;

  @include hover {
    .box {
      border-color: var(--primary-2);
    }
  }
}

input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.box {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 2px solid var(--check-border);
  border-radius: 7px;
  transition:
    background-color 0.25s,
    border-color 0.25s;

  svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: #fff;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    transition: stroke-dashoffset 0.35s var(--ease) 0.05s;
  }

  &.pop {
    animation: pop 0.4s var(--spring);
  }
}

input:checked + .box {
  border-color: transparent;
  background: linear-gradient(135deg, #10b981, #34d399);

  svg {
    stroke-dashoffset: 0;
  }
}

input:focus-visible + .box {
  outline: 2px solid var(--primary-2);
  outline-offset: 2px;
}

@keyframes pop {
  40% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}
</style>
