<script setup lang="ts">
const props = defineProps({
  menuIsOpen: {
    type: Boolean,
    required: true,
  },
});  

const menu = [
  { name: 'Cursos', link: '/courses', icon: 'fa-solid fa-book' },
  { name: 'Perfil', link: '/profile', icon: 'fa-solid fa-user' },
  // { name: 'Configuración', link: '/settings', icon: 'fa-gear' },
];
</script>

<template>
  <div class="user-sidebar" :class="{ 'active': menuIsOpen }">
    <div class="user-sidebar-wrapper">
      <ul class="user-menu">
        <li
          v-for="item in menu"
          :key="item.name"
          :class="{'active': !menuIsOpen}">
          <i :class="item.icon" class="icon" />
          <a :href="item.link" :class="{'active': menuIsOpen}">{{ item.name }}</a>
        </li>
      </ul>
    </div>
    <!-- <router-link to="/setting" class="setting-button">
      <i class="fa-solid fa-gear"></i>
    </router-link> -->
  </div>
</template>

<style lang="scss" scoped>
.user {
  &-sidebar {
    background-color: $FUDMASTER-LIGHT;
    height: 100%;
    border-right: 1px solid #e0e0e0;
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .setting-button {
      background: none;
      border: none;
      padding: 12px;
      cursor: pointer;
      font-size: 18px;
      color: #333;
      margin-bottom: 12px;

    &:hover {
      color: $FUDMASTER-GREEN;
    }
    }

    &.active {
      width: 64px;
    }
  }

  &-menu {
    list-style: none;
    padding: 0;
    margin-top: 42px;

    .icon {
      margin-right: 8px;
    }

    li {
      padding: 0 12px;
      margin: 36px 0;
      display: flex;
      justify-content: center;
      
      &.active {
        display: flex;
        justify-content: flex-start;
      }

      a {
        text-decoration: none;
        color: #333;
        font-weight: 500;

        &:hover {
          color: $FUDMASTER-GREEN;
        }
        
        &.active {
          display: none;
        }
      }

      
    }
  }
}
</style>