<script setup lang="ts">
  import { ref } from 'vue';
  
  // CORRECCIÓN APLICADA: Usamos ref() para la reactividad
  const faqs = ref([
    {
      question: "¿Por qué no ofrecen reembolso?",
      answer: "Porque Food Stack no es un curso para 'ver', es un sistema para 'implementar'. Entregamos propiedad intelectual, herramientas (Excel con macros) y estrategias que usamos en nuestros propios negocios. Buscamos dueños comprometidos, no curiosos.",
      isOpen: true // La primera abierta por defecto
    },
    {
      question: "¿Qué garantía tengo de que esto funciona?",
      answer: "Nuestra garantía son nuestros 5 locales operativos (Bakano, Delacrem, etc.) y los resultados de nuestros alumnos. No enseñamos teoría; enseñamos lo que aplicamos ayer en nuestras cocinas para vender $20k/mes.",
      isOpen: false
    },
    {
      question: "¿Qué pasa si me trabo o no entiendo algo?",
      answer: "No te dejamos solo. Como Miembro Fundador, tienes acceso a la Comunidad Privada donde Luis, Mauro y Denisse responden dudas. Si aplicas el método, el resultado es matemático.",
      isOpen: false
    },
    {
      question: "¿Sirve para mi tipo de comida?",
      answer: "La ingeniería de menú y el control de costos son universales. Ya sea que vendas sushi, hamburguesas o encebollados, los números funcionan igual. El sistema se adapta a tu modelo.",
      isOpen: false
    }
  ]);
  
  const toggleFaq = (index: number) => {
    // CORRECCIÓN APLICADA: Accedemos con .value porque es una referencia reactiva
    faqs.value[index].isOpen = !faqs.value[index].isOpen;
  };
  </script>
  
  <template>
    <section class="guarantee-section">
      <div class="container">
        
        <div class="guarantee-card">
          <div class="badge-wrapper">
            <div class="seal">
              <span>100%</span>
              <small>REAL</small>
            </div>
          </div>
          
          <div class="content">
            <h3>No somos Gurús. <span class="highlight">Somos Operadores.</span></h3>
            <p class="promise">
              Nuestra garantía es nuestra propia reputación y resultados.
            </p>
            <p class="terms">
              A diferencia de otros cursos, nosotros operamos restaurantes todos los días. Si aplicas la <strong>Matriz de Costos de Mauro</strong> y el <strong>Sistema de Ventas de Luis</strong>, y demuestras que no has mejorado tus números en 30 días y has visto todos los cursos, te regalamos una <strong>Sesión de Auditoría 1 a 1</strong> para arreglarlo personalmente contigo.
            </p>
            
            <div class="founder-signature">
              <div class="signature">Mauro Salgan</div>
              <div class="signature">Luis Reyes</div>
              <p class="role">Fundadores & Operadores Activos</p>
            </div>
          </div>
        </div>
  
        <div class="faq-wrapper">
          <h2 class="faq-title">Preguntas Frecuentes</h2>
          
          <div class="faq-grid">
            <div 
              v-for="(item, index) in faqs" 
              :key="index" 
              class="faq-item" 
              :class="{ active: item.isOpen }"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                {{ item.question }}
                <span class="icon">{{ item.isOpen ? '−' : '+' }}</span>
              </div>
              
              <div class="faq-answer" v-show="item.isOpen">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </section>
  </template>
  
  <style lang="scss" scoped>
  // Variables de diseño (Asegurando consistencia sin Tailwind)
  $bg-dark: #020617;
  $card-bg: #0f172a;
  $accent: #facc15; // Amarillo Food Stack
  $text-main: #ffffff;
  $text-muted: #94a3b8;
  $border: #334155;
  
  .guarantee-section {
    background-color: $bg-dark;
    padding: 6rem 1rem;
    color: $text-main;
    border-top: 1px solid $border;
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  // --- ESTILOS DE LA TARJETA ---
  .guarantee-card {
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, #1e293b, #0f172a);
    border: 1px solid $border;
    border-left: 4px solid $accent;
    border-radius: 24px;
    padding: 3rem 2rem;
    position: relative;
    overflow: hidden;
    margin-bottom: 5rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  
    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
      gap: 3rem;
      padding: 4rem;
    }
  }
  
  .badge-wrapper {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  
    @media (min-width: 768px) {
      margin-bottom: 0;
    }
  }
  
  // SELLO "REAL" CSS PURO
  .seal {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    // Degradado azul técnico para denotar seriedad
    background: radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8);
    border: 4px solid #1e293b;
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    position: relative;
    
    // Anillo externo decorativo
    &::after {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.2);
    }
  
    span {
      font-size: 2.5rem;
      line-height: 1;
    }
    small {
      font-size: 0.8rem;
      letter-spacing: 2px;
      opacity: 0.8;
    }
  }
  
  .content {
    text-align: center;
    
    @media (min-width: 768px) {
      text-align: left;
    }
  
    h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 800;
      
      .highlight {
        color: $accent;
      }
    }
  
    .promise {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: white;
    }
  
    .terms {
      color: $text-muted;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 0.95rem;
  
      strong {
        color: white;
        font-weight: 600;
      }
    }
  }
  
  .founder-signature {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 1.5rem;
    
    .signature {
      font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 1.5rem;
      font-style: italic;
      color: white;
      opacity: 0.9;
      display: inline-block;
      margin-right: 1.5rem;
    }
  
    .role {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: $accent;
      margin-top: 0.5rem;
      font-weight: 700;
    }
  }
  
  // --- ESTILOS DEL FAQ ---
  .faq-wrapper {
    margin-top: 4rem;
  }
  
  .faq-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
    color: white;
    font-weight: 800;
  }
  
  .faq-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .faq-item {
    background-color: $card-bg;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  
    &:hover {
      border-color: $text-muted;
    }
  
    &.active {
      border-color: $accent;
      background-color: lighten($card-bg, 3%);
      
      .icon {
        transform: rotate(180deg); // Animación del signo +/-
        color: $accent;
      }
      
      .faq-question {
        color: $accent;
      }
    }
  }
  
  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 1.1rem;
    color: white;
    transition: color 0.3s;
  
    .icon {
      font-size: 1.5rem;
      font-weight: 400;
      transition: transform 0.3s;
    }
  }
  
  .faq-answer {
    margin-top: 1rem;
    color: $text-muted;
    line-height: 1.6;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 1rem;
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  </style>