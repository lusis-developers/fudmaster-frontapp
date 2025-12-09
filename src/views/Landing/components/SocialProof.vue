<script setup lang="ts">
  // Datos de las tarjetas de resultados (Case Studies)
  const results = [
    {
      brand: 'Bakano',
      category: 'Ventas WhatsApp',
      metric: '$20,000+',
      desc: 'Facturación mensual generada exclusivamente por canal de chat automatizado.',
      icon: '💬',
      highlightColor: '#4ade80' // Green
    },
    {
      brand: 'Delacrem',
      category: 'Eficiencia Operativa',
      metric: '$5,000',
      desc: 'Incremento de facturación por empleado (de $3.5k a $5k) mediante estandarización.',
      icon: '⚡',
      highlightColor: '#facc15' // Yellow
    },
    {
      brand: 'Nicole Pastry',
      category: 'Marca & Branding',
      metric: 'Top of Mind',
      desc: 'Posicionamiento como marca premium y alta fidelización de clientes recurrentes.',
      icon: '🧁',
      highlightColor: '#f472b6' // Pink
    }
  ];
  
  // Aquí deberías importar las URLs reales de tus logos
  // Por ahora uso texto para el ejemplo visual
  const brands = [
    'BAKANO', 'DELACREM', 'CASA MÍA', 'NICOLE PASTRY', 'SUCREE', 
    'BAKANO', 'DELACREM', 'CASA MÍA', 'NICOLE PASTRY', 'SUCREE' // Duplicado para efecto infinito
  ];
  </script>
  
  <template>
    <section class="social-proof-section">
      
      <div class="header-container">
        <p class="overline">Resultados Reales, No Teoría</p>
        <h2>El Sistema detrás de las <span class="highlight">Marcas que Conoces</span></h2>
      </div>
  
      <div class="marquee-wrapper">
        <div class="marquee-track">
          <div v-for="(brand, index) in brands" :key="index" class="brand-item">
            <span class="brand-text">{{ brand }}</span>
          </div>
        </div>
      </div>
  
      <div class="cards-container">
        <div 
          v-for="card in results" 
          :key="card.brand" 
          class="result-card"
        >
          <div class="card-header">
            <span class="icon">{{ card.icon }}</span>
            <span class="category">{{ card.category }}</span>
          </div>
          
          <div class="metric-display" :style="{ color: card.highlightColor }">
            {{ card.metric }}
          </div>
          
          <p class="description">
            <strong class="brand-name">{{ card.brand }}:</strong> {{ card.desc }}
          </p>
  
          <div class="verified-badge">
            <span class="check">✓</span> Resultado Verificado
          </div>
        </div>
      </div>
  
    </section>
  </template>
  
  <style lang="scss" scoped>
  // Variables
  $bg-color: #0b0f19;      // Casi negro
  $card-bg: rgba(255, 255, 255, 0.03);
  $border-color: rgba(255, 255, 255, 0.1);
  $text-main: #ffffff;
  $text-muted: #94a3b8;
  $accent: #facc15;
  
  .social-proof-section {
    background-color: $bg-color;
    padding: 5rem 0;
    overflow: hidden; // Vital para el marquee
    position: relative;
    
    // Sutil degradado superior para unir con la sección anterior
    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 100px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
      pointer-events: none;
    }
  }
  
  .header-container {
    text-align: center;
    margin-bottom: 3rem;
    padding: 0 1rem;
  
    .overline {
      color: $accent;
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 0.5rem;
    }
  
    h2 {
      color: $text-main;
      font-size: 2.2rem;
      font-weight: 900;
      
      .highlight {
        // Efecto de subrayado o color diferente
        background: -webkit-linear-gradient(45deg, #fff, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
  
  // --- MARQUEE ANIMATION (Cinta Infinita) ---
  .marquee-wrapper {
    width: 100%;
    display: flex;
    overflow: hidden;
    margin-bottom: 4rem;
    position: relative;
    
    // Máscaras de desvanecimiento a los lados
    &::after, &::before {
      content: "";
      position: absolute;
      top: 0;
      width: 150px;
      height: 100%;
      z-index: 2;
    }
    
    &::before {
      left: 0;
      background: linear-gradient(to right, $bg-color, transparent);
    }
    
    &::after {
      right: 0;
      background: linear-gradient(to left, $bg-color, transparent);
    }
  }
  
  .marquee-track {
    display: flex;
    gap: 4rem;
    animation: scroll 25s linear infinite;
    white-space: nowrap;
    
    // Pausar al pasar el mouse (opcional)
    &:hover {
      animation-play-state: paused;
    }
  }
  
  .brand-item {
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 1;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
    }
  
    .brand-text {
      font-size: 2rem;
      font-weight: 900;
      color: white;
      font-family: 'Impact', sans-serif; // O tu fuente corporativa
      letter-spacing: 2px;
    }
    
    // Si usas imágenes, añade estilos aquí
    img {
      height: 40px;
      width: auto;
      filter: grayscale(100%);
    }
  }
  
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-50% - 2rem)); } // Ajuste según el gap
  }
  
  // --- RESULT CARDS ---
  .cards-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1rem;
  
    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .result-card {
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    transition: transform 0.3s, border-color 0.3s;
    position: relative;
    overflow: hidden;
  
    &:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.3);
      
      // Brillo sutil al hover
      &::after {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
        pointer-events: none;
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  
    .icon {
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      width: 40px; height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
  
    .category {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: $text-muted;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
    }
  }
  
  .metric-display {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1;
  }
  
  .description {
    color: $text-muted;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  
    .brand-name {
      color: white;
    }
  }
  
  .verified-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #4ade80; // Green success
    font-weight: 600;
  
    .check {
      background: rgba(74, 222, 128, 0.2);
      width: 16px; height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
    }
  }
  </style>