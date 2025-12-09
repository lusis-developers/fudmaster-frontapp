<script setup lang="ts">
import Hero from './components/Hero.vue';
import Problem from './components/Problem.vue';
import SocialProof from './components/SocialProof.vue';
import Solution from './components/Solution.vue';
import UrgentBar from './components/UrgentBar.vue';
</script>

<template>
  <div class="wrapper">
    <UrgentBar />
    <Hero />
    <Problem />
    <Solution />
    <SocialProof />
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    width: 100%;
  }
</style>
