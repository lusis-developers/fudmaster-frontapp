<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function goToCheckout() { router.push('/checkout') }

onMounted(() => {
  if (!document.getElementById('wistia-player-js')) {
    const script1 = document.createElement('script')
    script1.src = "https://fast.wistia.com/player.js"
    script1.async = true
    script1.id = 'wistia-player-js'
    document.head.appendChild(script1)
  }

  if (!document.getElementById('wistia-embed-js')) {
    const script2 = document.createElement('script')
    script2.src = "https://fast.wistia.com/embed/2f09oyiyxq.js"
    script2.async = true
    script2.type = "module"
    script2.id = 'wistia-embed-js'
    document.head.appendChild(script2)
  }
})
</script>

<template>
  <div class="vsl-hero">
    <div class="vsl-container">
      
      <div class="vsl-split-layout">
        
        <div class="vsl-video-column">
          <div class="video-frame">
            <wistia-player media-id="2f09oyiyxq" aspect="1.7777777777777777"></wistia-player>
          </div>
        </div>

        <div class="vsl-content-column">
          <h1 class="vsl-title">
            ¡El regalo <br>
            que necesitas <br>
            para transformar <br>
            tu vida!
          </h1>
          
          <p class="vsl-description">
            Descubre los secretos gastronómicos empresariales de Nicole y su equipo.
          </p>

          <div class="cta-wrapper">
            <button class="cta-button" @click="goToCheckout">
              🔓 Desbloquea tu descuento 🗝️
            </button>
            <p class="cta-subtitle">Solo para los primeros 50 - Quedan 28 cupos</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Asegúrate de que estas variables estén definidas en tu proyecto global
   o descoméntalas aquí para probar */
// $FUDMASTER-PRIMARY: #030b1c; /* Color oscuro de fondo aproximado */
// $FUDMASTER-LIGHT: #ffffff;
// $FUDMASTER-PINK: #e91e63;

.vsl {
  &-hero {
    background-color: $FUDMASTER-PRIMARY;
    // min-height: 100vh; /* Ocupa toda la pantalla */
    display: flex;
    align-items: center; /* Centra verticalmente todo el bloque */
    justify-content: center;
    padding: 48px 20px;
    position: relative;
    overflow: hidden;
  }

  &-container {
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
  }

  &-split-layout {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 40px; /* Espacio entre video y texto */
  }

  /* --- COLUMNA VIDEO --- */
  &-video-column {
    flex: 1.2; /* El video ocupa un poco más de espacio (60% aprox) */
    width: 100%;
  }

  .video-frame {
    position: relative;
    /* padding-bottom: 56.25%; Aspect Ratio 16:9 - Removed as Wistia Player handles it */
    height: auto;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    background: #000;
  }
  
  wistia-player[media-id='2f09oyiyxq']:not(:defined) {
    background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/2f09oyiyxq/swatch');
    display: block;
    filter: blur(5px);
    padding-top: 56.25%;
  }

  /* --- COLUMNA TEXTO --- */
  &-content-column {
    flex: 0.8; /* El texto ocupa un poco menos (40% aprox) */
    color: $FUDMASTER-LIGHT;
    text-align: right; /* Alineado a la derecha como en la referencia */
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* Fuerza los elementos a la derecha */
  }

  &-title {
    font-size: 2.5rem; /* Tamaño grande */
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 25px;
    color: $FUDMASTER-LIGHT;
  }

  &-description {
    font-size: 1.25rem;
    line-height: 1.5;
    margin-bottom: 40px;
    opacity: 0.9;
    max-width: 400px; /* Evita que el texto sea muy ancho */
  }

  .cta-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end; /* Alinea botón y subtitulo a la derecha */
  }
}

/* --- BOTÓN --- */
.cta-button {
  background: $FUDMASTER-ORANGE;
  color: $FUDMASTER-LIGHT;
  border: none;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
  white-space: nowrap;

  @media screen and (max-width: 320px) {
    padding: 14px 16px;
    font-size: 0.75rem;
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

.cta-subtitle {
  font-size: 0.9rem;
  margin-top: 10px;
  opacity: 0.7;
  font-weight: 300;
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 960px) {
  .vsl-split-layout {
    flex-direction: column; /* Apila Video arriba, Texto abajo */
    gap: 40px;
  }

  .vsl-content-column {
    text-align: center; /* Centrar texto en móvil */
    align-items: center;
    padding: 0 10px;
  }

  .vsl-title {
    font-size: 2.5rem;
  }

  .cta-wrapper {
    align-items: center;
  }
}
</style>