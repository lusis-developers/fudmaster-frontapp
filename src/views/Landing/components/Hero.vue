
<script setup lang="ts">
  // No necesitas lógica adicional aquí
</script>

<template>
  <div class="vsl-hero">
    <div class="vsl-container">
      <div class="vsl-content">
        <h1 class="vsl-title">Transforma tu carrera gastronómica</h1>
        <p class="vsl-subtitle">Descubre los secretos de éxito con Nicole y su equipo</p>
        
        <div class="vsl-video-wrapper">
          <iframe
            src="https://fast.wistia.net/embed/iframe/ecdxw6wr0v"
            title="Video de presentación"
            allow="autoplay; fullscreen"
            allowfullscreen
            class="wistia_embed"
            name="wistia_embed"
            msallowfullscreen
            width="100%"
            height="100%">
          </iframe>
          </div>

        <button class="cta-button">Acceso Limitado - ¡Actúa Ahora!</button>
        <p class="cta-subtitle">Solo para los primeros 50 - Quedan 28 lugares</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vsl {
  &-hero {
    background: $FUDMASTER-LIGHT;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  &-container {
    max-width: 900px;
    width: 100%;
  }

  &-content {
    text-align: center;
    color: $FUDMASTER-DARK;
  }

  &-title {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 20px;
  }

  &-subtitle {
    font-size: 24px;
    margin-bottom: 40px;
    opacity: 0.95;
  }

  &-video-wrapper {
    margin: 40px 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    background: #000;
    
    /* Esta línea es clave para que se vea bien sin el script */
    aspect-ratio: 16 / 9;
    width: 100%;

    iframe {
      width: 100%;
      height: 100%;
      display: block;
      border: none;
    }
  }
}

.cta-button {
  background: $FUDMASTER-PINK;
  color: $FUDMASTER-LIGHT;
  border: none;
  padding: 18px 50px;
  font-size: 20px;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;

  &:hover {
    background: #fdb913;
    color: #1a1a1a;
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
}

.cta-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

@media (max-width: 768px) {
  .vsl {
    &-title {
      font-size: 32px;
    }

    &-subtitle {
      font-size: 18px;
    }
  }

  .cta-button {
    padding: 14px 40px;
    font-size: 16px;
  }
}
</style>