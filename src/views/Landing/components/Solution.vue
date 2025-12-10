<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  const router = useRouter()
  function goToCheckout() { router.push('/checkout') }
  
  // Estado del switch: false = Promedio, true = Food Stack
  const isOptimized = ref(false);
  
  // Datos de las métricas
  const metrics = {
    average: {
      primeCost: 65,
      sales: 10000,
      stress: 'Crítico 🤯',
      class: 'state-danger'
    },
    foodstack: {
      primeCost: 42, // Tu Golden Nugget
      sales: 20000, // x2 Ventas
      stress: 'Control Total 😎',
      class: 'state-success'
    }
  };
  </script>
  
  <template>
    <section class="transformation-section">
      <div class="container">
        
        <div class="header-content">
          <h2>
            No es Suerte. Es <span class="highlight">Ingeniería.</span>
          </h2>
          <p class="subtitle">
            Desliza el interruptor para ver la diferencia real entre operar por intuición vs. instalar el sistema Food Stack.
          </p>
        </div>

        <div class="actions">
          <button class="cta" type="button" @click="goToCheckout">Instalar Food Stack ahora</button>
        </div>
  
        <div class="dashboard-card" :class="{ 'optimized-mode': isOptimized }">
          
          <div class="switch-wrapper">
            <span class="label" :class="{ active: !isOptimized }">Restaurante Promedio</span>
            
            <button 
              class="toggle-btn" 
              :class="{ active: isOptimized }"
              @click="isOptimized = !isOptimized"
              aria-label="Toggle Optimization Mode"
            >
              <div class="toggle-circle"></div>
            </button>
  
            <span class="label" :class="{ active: isOptimized }">Modo Food Stack</span>
          </div>
  
          <div class="metrics-grid">
            
            <div class="metric-card">
              <p class="metric-title">Costo Primo (Food + Labor)</p>
              
              <div class="metric-value" :class="isOptimized ? 'text-success' : 'text-danger'">
                {{ isOptimized ? metrics.foodstack.primeCost : metrics.average.primeCost }}%
              </div>
  
              <div class="progress-container">
                 <div 
                   class="progress-fill"
                   :class="isOptimized ? 'bg-success' : 'bg-danger'"
                   :style="{ width: isOptimized ? '42%' : '65%' }"
                 ></div>
              </div>
              
              <p class="metric-note">
                 {{ isOptimized ? 'Rentabilidad máxima blindada' : 'Te estás comiendo la ganancia' }}
              </p>
            </div>
  
            <div class="metric-card">
              <p class="metric-title">Ventas Mensuales</p>
              
              <div class="metric-value text-white">
                ${{ isOptimized ? metrics.foodstack.sales.toLocaleString() : metrics.average.sales.toLocaleString() }}
              </div>
              
              <p class="growth-badge" :class="isOptimized ? 'visible' : 'hidden'">
                🚀 x2 Crecimiento
              </p>
  
              <p class="metric-note">
                {{ isOptimized ? 'Estrategia de Growth + WhatsApp' : 'Esperando clientes pasivamente' }}
              </p>
            </div>
  
            <div class="metric-card">
              <p class="metric-title">Estado del Dueño</p>
              
              <div class="metric-value" :class="isOptimized ? 'text-success' : 'text-danger'">
                {{ isOptimized ? metrics.foodstack.stress : metrics.average.stress }}
              </div>
              
              <p class="metric-note">
                 {{ isOptimized ? 'Gerente Estratégico' : 'Bombero Operativo' }}
              </p>
            </div>
  
          </div>
  
          <div class="dashboard-footer">
            <p>*Datos basados en los resultados reales de nuestras marcas (Bakano, Finestra).</p>
          </div>
  
        </div>
      </div>
    </section>
  </template>
  
  <style lang="scss" scoped>
  // Variables de Color (Puedes mover esto a un archivo _variables.scss global)
  $color-bg-dark: #0f172a;       // Slate 900
  $color-card-bg: #1e293b;       // Slate 800
  $color-border: #334155;        // Slate 700
  $color-text-main: #ffffff;
  $color-text-muted: #94a3b8;    // Slate 400
  $color-accent: #facc15;        // Yellow 400
  $color-success: #4ade80;       // Green 400
  $color-danger: #ef4444;        // Red 500
  $transition-speed: 0.5s;
  
  .transformation-section {
    background-color: #020617; // Slate 950
    padding: 5rem 1rem;
    color: $color-text-main;
    position: relative;
    overflow: hidden;
  
    // Fondo sutil de grilla
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.05;
      background-image: radial-gradient(#ffffff 1px, transparent 1px);
      background-size: 30px 30px;
      pointer-events: none;
    }
  }
  
  .container {
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }
  
  .header-content {
    text-align: center;
    margin-bottom: 4rem;
  
    h2 {
      font-size: 2.5rem;
      font-weight: 900;
      margin-bottom: 1rem;
  
      @media (min-width: 768px) {
        font-size: 3rem;
      }
  
      .highlight {
        color: $color-accent;
      }
    }
  
    .subtitle {
      color: $color-text-muted;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }
  
  // --- DASHBOARD CARD STYLES ---
  .dashboard-card {
    background-color: $color-card-bg;
    border: 1px solid $color-border;
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    transition: border-color $transition-speed, box-shadow $transition-speed;
  
    @media (min-width: 768px) {
      padding: 3rem;
    }
  
    // Efecto glow cuando está activado
    &.optimized-mode {
      border-color: rgba($color-success, 0.3);
      box-shadow: 0 20px 50px rgba($color-success, 0.1);
    }
  }
  
  // --- SWITCH STYLES ---
  .switch-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 4rem;
  
    .label {
      font-weight: 700;
      font-size: 1rem;
      color: #64748b; // Slate 500
      transition: color 0.3s;
  
      &.active {
        color: $color-text-main;
        
        // Color específico para el lado derecho
        &:last-child {
          color: $color-success;
        }
      }
    }
  
    .toggle-btn {
      width: 80px;
      height: 40px;
      background-color: #334155;
      border-radius: 999px;
      border: none;
      position: relative;
      cursor: pointer;
      transition: background-color 0.3s;
      outline: none;
  
      // Círculo interno
      .toggle-circle {
        width: 32px;
        height: 32px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 4px;
        left: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      }
  
      // Estado Activado
      &.active {
        background-color: $color-success;
  
        .toggle-circle {
          transform: translateX(40px);
        }
      }
  
      &:focus-visible {
        box-shadow: 0 0 0 4px rgba($color-success, 0.3);
      }
    }
  }
  
  // --- METRICS GRID STYLES ---
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  
    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .metric-card {
    background-color: #0f172a; // Darker inner bg
    border: 1px solid $color-border;
    border-radius: 16px;
    padding: 2rem 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: transform 0.3s ease;
  
    &:hover {
      transform: translateY(-5px);
      border-color: #475569;
    }
  }
  
  .metric-title {
    color: $color-text-muted;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .metric-value {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
    transition: color $transition-speed;
  
    &.text-success { color: $color-success; }
    &.text-danger { color: $color-danger; }
    &.text-white { color: white; }
  }
  
  // --- PROGRESS BAR ---
  .progress-container {
    width: 100%;
    height: 8px;
    background-color: $color-border;
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 1rem;
  
    .progress-fill {
      height: 100%;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s;
      
      &.bg-success { background-color: $color-success; }
      &.bg-danger { background-color: $color-danger; }
    }
  }
  
  .growth-badge {
    font-size: 1.1rem;
    font-weight: 700;
    color: $color-success;
    margin-bottom: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s;
  
    &.visible {
      opacity: 1;
    }
    &.hidden {
      opacity: 0; // Oculto visualmente pero mantiene el espacio si usas visibility
      display: none; // O usa display: none si prefieres que colapse
    }
  }
  
  .metric-note {
    font-size: 0.85rem;
    color: $color-text-muted;
    font-style: italic;
    min-height: 2.5em; // Para evitar saltos cuando cambia el texto
  }
  
  .dashboard-footer {
    margin-top: 3rem;
    text-align: center;
    
    p {
      color: #475569;
      font-size: 0.9rem;
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
  .cta {
    background: $color-accent;
    color: black;
    border: none;
    border-radius: 12px;
    padding: 12px 18px;
    font-weight: 800;
    cursor: pointer;
  }
  </style>
