<script setup lang="ts">
import UserHeader from '../components/UserHeader.vue'
</script>

<template>
  <div class="wrapper">
    <div class="header">
      <UserHeader :showMenuButton="false" />
    </div>
    <div class="view">
      <RouterView />
    </div>
  </div>
  </template>

<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header { width: 100%; }
.view {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $FUDMASTER-LIGHT;
  padding: 16px;
}
</style>
