<script setup lang="ts">  
import { useRouter } from 'vue-router'
const router = useRouter()
function goToCheckout() { router.push('/checkout') }
  </script>
  
  <template>
    <section class="offer-section">
      <div class="offer-container">
        
        <div class="best-value-badge">
          Mejor Oferta Disponible
        </div>
  
        <div class="offer-content">
          <h3 class="title">Be founder</h3>
          <p class="subtitle">Acceso de por vida a todo a la escuela de Fudmaster</p>
  
          <div class="price-display">
            <span class="old-price">$990</span>
            <span class="new-price">$297</span>
            <span class="currency">USD</span>
          </div>
  
          <ul class="benefits-list">
            <li>✅ Acceso a las 4 Rutas de Aprendizaje</li>
            <li>✅ Plantillas de Excel y Contenido</li>
            <li>✅ Comunidad Privada de Dueños</li>
            <li>✅ Actualizaciones de por vida</li>
          </ul>
  
          <button class="buy-btn" @click="goToCheckout">
            Quiero este precio 👉
          </button>
  
          <div class="trust-badges">
            <p>🔒 <strong>Pago 100% Seguro</strong> vía Payphone</p>
          </div>
        </div>
  
      </div>
    </section>
  </template>
  
  <style lang="scss" scoped>
  

  .offer-section {
    padding: 1rem 1rem 5rem 1rem;
    background-color: #020617; // Dark bg
    display: flex;
    justify-content: center;
  }
  
  .offer-container {
    background-color: #0f172a;
    border: 4px solid $FUDMASTER-ORANGE; // Borde dorado grueso
    border-radius: 24px;
    padding: 3rem 2rem;
    max-width: 500px;
    width: 100%;
    text-align: center;
    position: relative;
    box-shadow: 0 0 60px rgba(250, 204, 21, 0.15);
  }
  
  .best-value-badge {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: $FUDMASTER-ORANGE;
    color: black;
    font-weight: 800;
    padding: 0.8rem 2rem;
    border-radius: 99px;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 1px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
  
  .title {
    color: white;
    font-size: 2.2rem;
    font-weight: 800;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #94a3b8;
    margin-bottom: 2rem;
  }
  
  .price-display {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .old-price {
    color: #64748b;
    text-decoration: line-through;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .new-price {
    color: white;
    font-size: 5rem;
    font-weight: 900;
    line-height: 1;
  }
  
  .currency {
    color: #4ade80;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  .benefits-list {
    list-style: none;
    padding: 0;
    text-align: left;
    margin-bottom: 2.5rem;
    color: #e2e8f0;
    
    li {
      margin-bottom: 0.8rem;
      font-size: 1.1rem;
    }
  }
  
  .buy-btn {
    width: 100%;
    background-color: $FUDMASTER-GREEN; // Verde venta
    color: white;
    font-size: 1.5rem;
    font-weight: 900;
    padding: 1.2rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 10px 0 $FUDMASTER-GREEN; // Efecto 3D
    transition: transform 0.1s, box-shadow 0.1s;
    margin-bottom: 1.5rem;
  
    &:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 #15803d;
    }
  }
  
  .trust-badges {
    font-size: 0.9rem;
    color: #94a3b8;
    
    .transfer-link {
      font-size: 0.8rem;
      margin-top: 0.5rem;
      
      a {
        color: #facc15;
        text-decoration: none;
        font-weight: bold;
      }
    }
  }
  </style>
