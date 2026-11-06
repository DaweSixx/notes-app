<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    done: number;
    total: number;
    size?: "sm" | "md";
  }>(),
  { size: "sm" },
);

const { t } = useI18n();

const percent = computed(() => (props.total ? Math.round((props.done / props.total) * 100) : 0));
const complete = computed(() => props.total > 0 && props.done === props.total);

// flash only when a todo gets checked or unchecked, not when todos are added or removed
const pulse = ref(false);

watch(
  () => props.done,
  () => {
    // drop the class for one render so the animation restarts on quick repeated clicks
    pulse.value = false;
    nextTick(() => (pulse.value = true));
  },
);
</script>

<template>
  <div
    class="progress"
    :class="[size, { complete, pulse }]"
    role="progressbar"
    :aria-label="t('progress.label', { done, total })"
    aria-valuemin="0"
    :aria-valuemax="total"
    :aria-valuenow="done"
    @animationend.self="pulse = false"
  >
    <span class="bar" :style="{ '--p': `${percent}%` }" />
  </div>
</template>

<style lang="scss" scoped>
.progress {
  --glow: rgba(236, 72, 153, 0.45);
  --glow-ring: rgba(139, 92, 246, 0.25);

  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--line);

  &.md {
    height: 8px;
  }

  &.complete {
    --glow: rgba(16, 185, 129, 0.5);
    --glow-ring: rgba(16, 185, 129, 0.25);
  }

  &.pulse {
    animation: glow 0.8s var(--ease);
  }
}

.bar {
  position: relative;
  display: block;
  width: var(--p);
  height: 100%;
  border-radius: inherit;
  // the gradient repeats its first color at the end so the flowing loop has no visible seam
  background-image: linear-gradient(90deg, var(--primary), var(--pink), var(--primary));
  background-size: 200% 100%;
  transition: width 0.6s var(--ease);
  // `backwards`, not `both`: a finished animation must release `width`, otherwise the transition never runs
  animation:
    grow 1s var(--ease) backwards,
    flow 4s linear infinite;
  animation-delay: var(--progress-delay, 0s), 0s;

  .complete & {
    background-image: linear-gradient(90deg, #10b981, #6ee7b7, #10b981);
  }

  // bright spot at the leading edge; it rides along while the width transitions
  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 28px;
    border-radius: inherit;
    background: radial-gradient(circle at right, rgba(255, 255, 255, 0.95), transparent 70%);
    opacity: 0;
  }

  .pulse &::after {
    animation: tip-flash 0.8s var(--ease);
  }
}

@keyframes grow {
  from {
    width: 0;
  }
}

@keyframes flow {
  to {
    background-position: 200% 0;
  }
}

@keyframes glow {
  30% {
    box-shadow:
      0 0 0 3px var(--glow-ring),
      0 0 14px var(--glow);
  }
}

@keyframes tip-flash {
  30% {
    opacity: 1;
  }
}
</style>
