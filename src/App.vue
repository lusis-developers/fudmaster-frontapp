<script setup lang="ts">

</script>

<template>
  <div class="app-container">
    <div class="app-container-view">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss">
  .app-container  {
    background-color: blue;
    min-height: 100vh;
    width: 100%;
    &-view {
      width: 100%;
    }
  }

</style>
