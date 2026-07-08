<script setup lang="ts">
</script>

<template>
  <div class="ui-layer">
    <header class="ui-topbar">
      <span class="ui-brand">CHARGE ARENA</span>
    </header>
  </div>
</template>

<style scoped>
.ui-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.ui-topbar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  pointer-events: auto;
}

.ui-brand {
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-accent);
}
</style>
