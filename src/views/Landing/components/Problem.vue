<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goToCheckout() { router.push('/checkout') }
const problems = [
  {
    icon: '💣',
    description:
      'Tienes robo hormiga: Sabes que te roban, pero no sabes dónde ni cuánto.',
  },
  {
    icon: '☠️',
    description:
      'Eres esclavo Operativo: Si tú no abres el local, nada funciona bien. No has tenido vacaciones en 2 años.',
  },
  {
    icon: '🙈',
    description:
      'Usas Marketing Ciego: Pagas el botón "Promocionar" en Instagram pero no sabes si eso trajo clientes reales.',
  },
  {
    icon: '💸',
    description:
      'Tienes Ventas Estancadas: Tienes buen producto, pero no tienes clientes o pedidos suficientes.',
  },
  {
    icon: '😵‍💫',
    description:
      'Te sientes ahogado en deudas: Tienes buenas ventas, pero sientes que no es suficiente.',
  },
]
</script>

<template>
  <div class="wrapper">
    <section class="problem-section">
      <h2 class="problem-title">
        Esto es para ti si...
      </h2>
      <div v-for="(item, i) in problems" :key="i">
        <span>
          {{ item.icon }}
        </span>
        <p class="problem-description">
          {{ item.description }}
        </p>
      </div>
      <!-- <div class="actions">
        <button class="cta" type="button" @click="goToCheckout">Resolverlo ahora</button>
      </div> -->
      <div class="cta-wrapper">
        <button class="cta-button" @click="goToCheckout">
          🎁 Reclama tus <span>$693</span> de descuento aqui 🎁
        </button>
        <!-- <p class="cta-subtitle">Solo para los primeros 50 - Quedan 28 cupos</p> -->
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
    .cta-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-center; /* Alinea botón y subtitulo a la derecha */
      margin-top: 12px;
    }
    /* --- BOTÓN --- */
    .cta-button {
      background: $FUDMASTER-PURPLE;
      color: $FUDMASTER-LIGHT;
      border: none;
      padding: 18px 24px;
      font-size: 1.1rem;
      font-weight: 700;
      border-radius: 50px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
      white-space: nowrap;

      span {
        color: $FUDMASTER-DARK;
        font-weight: 600;
        font-size: 1rem;
        margin: 0;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(233, 30, 99, 0.6);
        // filter: brightness(1.1); // Opcional para brillo
      }

      &:active {
        transform: translateY(0);
      }
    }

  }
}
</style>
