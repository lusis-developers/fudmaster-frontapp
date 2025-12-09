<script setup lang="ts">

const menu = [
  { name: 'Perfil', link: '/profile' },
  { name: 'Cursos', link: '/settings' },
  { name: 'Configuración', link: '/settings' },
];
</script>

<template>
  <div class="user-sidebar">
    <div class="user-sidebar-wrapper">
      <ul class="user-menu">
        <li v-for="item in menu" :key="item.name">
          <a :href="item.link">{{ item.name }}</a>
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
    width: 180px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
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
  }

  &-menu {
    list-style: none;
    padding: 0;
    margin-top: 36px;

    li {
      padding: 0 12px;
      margin-bottom: 15px;
      margin: 24px 0;

      a {
        text-decoration: none;
        color: #333;
        font-weight: 500;

        &:hover {
          color: $FUDMASTER-GREEN;
        }
      }
    }
  }
}
</style>