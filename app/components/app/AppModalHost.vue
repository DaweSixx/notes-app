<script setup lang="ts">
const { stack, close } = useModalStack();

watch(
  () => stack.value.length > 0,
  (locked) => {
    const body = document.body;
    if (locked) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      body.style.paddingRight = scrollbar ? `${scrollbar}px` : "";
    } else {
      body.style.overflow = "";
      body.style.paddingRight = "";
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="modal" :duration="{ enter: 400, leave: 200 }">
      <BaseModal
        v-for="(entry, index) in stack"
        :key="entry.id"
        :active="index === stack.length - 1"
        @dismiss="close(entry.id)"
      >
        <component :is="entry.component" v-bind="entry.props" @resolve="close(entry.id, $event)" />
      </BaseModal>
    </TransitionGroup>
  </Teleport>
</template>
