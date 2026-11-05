<template>
  <div class="bg" aria-hidden="true">
    <span class="blob b1" />
    <span class="blob b2" />
    <span class="blob b3" />
    <span class="blob b4" />
  </div>
</template>

<style lang="scss" scoped>
.bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: var(--blob-opacity);
  animation: float 22s ease-in-out infinite alternate;
  transition: opacity 0.6s;
}

.b1 {
  width: 520px;
  height: 520px;
  top: -160px;
  left: -120px;
  background: #8b5cf6;
}

.b2 {
  width: 440px;
  height: 440px;
  top: 25%;
  right: -140px;
  background: #ec4899;
  animation-delay: -6s;
}

.b3 {
  width: 560px;
  height: 560px;
  bottom: -240px;
  left: 25%;
  background: #6366f1;
  animation-delay: -12s;
}

.b4 {
  width: 260px;
  height: 260px;
  top: 55%;
  left: -60px;
  background: #a78bfa;
  animation-delay: -3s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(70px, -50px) scale(1.1);
  }
  100% {
    transform: translate(-50px, 40px) scale(0.95);
  }
}
</style>
