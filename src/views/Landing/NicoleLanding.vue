<script setup lang="ts">
import Hero from './components/Hero.vue';
import UrgentBar from './components/UrgentBar.vue';
</script>

<template>
  <div class="wrapper">
    <UrgentBar />
    <Hero />
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    width: 100%;
  }
</style>
