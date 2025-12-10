<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goToCheckout() { router.push('/checkout') }
</script>

<template>
  <div class="urgent" @click="goToCheckout">
    <h2>
      ¡Inscríbete ahora en nuestra oferta de lanzamiento y aprovecha del acceso de por vida!
    </h2>
  </div>
</template>

<style lang="scss" scoped>
.urgent {
  background-color: $FUDMASTER-PINK;
  color: white;
  text-align: center;
  padding: 20px;
  font-weight: bold;
  cursor: pointer;
}
</style>
