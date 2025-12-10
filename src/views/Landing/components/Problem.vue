<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goToCheckout() { router.push('/checkout') }
const problems = [
  {
    icon: '❌',
    description:
      'El Robo Hormiga: Sabes que te roban, pero no sabes dónde ni cuánto.',
  },
  {
    icon: '❌',
    description:
      'Esclavitud Operativa: Si tú no abres el local, nada funciona bien. No has tenido vacaciones en 2 años.',
  },
  {
    icon: '❌',
    description:
      'Marketing Ciego: Pagas el botón "Promocionar" en Instagram pero no sabes si eso trajo clientes reales.',
  },
  {
    icon: '❌',
    description:
      'Ventas Estancadas: Tienes buen producto, pero el teléfono no suena lo suficiente.',
  },
]
</script>

<template>
  <div class="wrapper">
    <section class="problem-section">
      <h2 class="problem-title">
        ¿Te suena familiar este escenario?
      </h2>
      <div v-for="(item, i) in problems" :key="i">
        <span>
          {{ item.icon }}
        </span>
        <p class="problem-description">
          {{ item.description }}
        </p>
      </div>
      <div class="actions">
        <button class="cta" type="button" @click="goToCheckout">Resolverlo ahora</button>
      </div>
    </section>
  </div>
</template>


<style lang="scss" scoped>
.wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: $FUDMASTER-DARK;
  color: $FUDMASTER-LIGHT;

  .problem-section {
    max-width: 800px;
    width: 100%;
    text-align: left;

    .problem-title {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      font-weight: bold;
    }

    div {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;

      span {
        font-size: 1.5rem;
        margin-right: 0.75rem;
      }

      .problem-description {
        font-size: 1.1rem;
        line-height: 1.4;
      }
    }
    .actions {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }
    .cta {
      background: $FUDMASTER-GREEN;
      color: $white;
      border: none;
      border-radius: 10px;
      padding: 12px 18px;
      font-weight: 700;
      cursor: pointer;
    }
  }
}
</style>
