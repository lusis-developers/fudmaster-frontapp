<script setup lang="ts"></script>

<template>
  <header class="user-header">
    <div class="user-header-wrapper">
      <div class="user-header-wrapper-left">
        <button class="menu-button">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="logo">
          <img src="../assets/fudmaster-blanco.png" alt="fudmaster-logo">
        </div>
      </div>
      <div class="user-header-wrapper-right">
        hola
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
  .user {
    &-header {
      background-color: $FUDMASTER-DARK;
      color: white;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &-wrapper {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        &-left {
          display: flex;
          align-items: center;
          gap: 16px;

          .menu-button {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;

            &:hover {
              color: $FUDMASTER-GREEN;
            }
          }
          
          .logo {
            width: 120px;
            img {
              width: 100%;
            }
          }
        }

      }
    }
  }
</style>