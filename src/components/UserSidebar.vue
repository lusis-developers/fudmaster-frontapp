<script setup lang="ts">

const menu = [
  { name: 'Perfil', link: '/profile' },
  { name: 'Configuración', link: '/settings' },
  { name: 'Cursos', link: '/settings' },
];

function openCloseMenu() {
  console.log('Menu toggled');
}
</script>

<template>
  <div class="user-sidebar">
    <ul class="user-menu">
      <li v-for="item in menu" :key="item.name">
        <a :href="item.link">{{ item.name }}</a>
      </li>
    </ul>
    <button @click="openCloseMenu">
      <i class="fa-solid fa-gear"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.user {
  &-sidebar {
    background-color: $FUDMASTER-LIGHT;
    height: 100vh;
    border-right: 1px solid #e0e0e0;
    width: 180px;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  &-menu {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 15px;

      a {
        text-decoration: none;
        color: #333;
        font-weight: 500;

        &:hover {
          color: #007bff;
        }
      }
    }
  }
}
</style>