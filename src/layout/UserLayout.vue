<script setup lang="ts">
  import UserSidebar from '../components/UserSidebar.vue';
</script>

<template>
  <div class="layout main-wrapper">
    <div class="layout-menu-wrapper">
      <UserSidebar />
    </div>
    <div class="layout-view-wrapper">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  min-height: 100vh;
  &-menu-wrapper {
    width: 100%;
    max-width: fit-content;
    min-width: 24px;
  }
  &-view-wrapper {
    width: 100%;
    flex: 1;
  }
}
</style>