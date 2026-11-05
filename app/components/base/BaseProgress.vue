<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    done: number;
    total: number;
    size?: "sm" | "md";
  }>(),
  { size: "sm" },
);

const percent = computed(() => (props.total ? Math.round((props.done / props.total) * 100) : 0));
const complete = computed(() => props.total > 0 && props.done === props.total);
</script>

<template>
  <div
    class="progress"
    :class="[size, { complete }]"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuemax="total"
    :aria-valuenow="done"
  >
    <span class="bar" :style="{ '--p': `${percent}%` }" />
  </div>
</template>

<style lang="scss" scoped>
.progress {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--line);

  &.md {
    height: 8px;
  }
}

.bar {
  display: block;
  width: var(--p);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), var(--pink));
  transition: width 0.6s var(--ease);
  animation: grow 1s var(--ease) both;
  animation-delay: var(--progress-delay, 0s);

  .complete & {
    background: linear-gradient(90deg, #10b981, #34d399);
  }
}

@keyframes grow {
  from {
    width: 0;
  }
}
</style>
