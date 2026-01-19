<script setup lang="ts">
import { ref, computed } from "vue";
// import { useRouter } from "vue-router"; 
import { useUserStore } from "@/stores/user";
import usersService, { type OnboardingBody } from "@/services/users.service";
import CustomSelect from "../CustomSelect.vue";

const userStore = useUserStore();

// Form State
const jobPosition = ref<string | null>(null);
const businessName = ref("");
const hasNoBusiness = ref(false); // Toggle state
const businessType = ref<string | null>(null);
const businessTypeOther = ref("");
const employeeCount = ref<string | null>(null);
const numberOfLocations = ref<number | null>(null);
const heardAboutUs = ref<string | null>(null);
const heardAboutUsOther = ref("");

const loading = ref(false);
const errorMsg = ref<string | null>(null);

// Options
const jobPositionOptions = [
  { value: "owner", label: "Dueño / Propietario" },
  { value: "executive_chef", label: "Chef Ejecutivo" },
  { value: "manager", label: "Gerente / Administrador" },
  { value: "cook", label: "Cocinero / Chef de Partie" },
  { value: "pastry_chef", label: "Pastelero / Repostero" },
  { value: "student", label: "Estudiante de Gastronomía" },
  { value: "foodie", label: "Aficionado / Foodie" },
  { value: "other", label: "Otro" },
];

const businessTypeOptions = [
  { value: "physical_restaurant", label: "Restaurante Físico" },
  { value: "dark_kitchen", label: "Dark Kitchen" },
  { value: "food_truck", label: "Food Truck" },
  { value: "catering", label: "Catering" },
  { value: "bakery", label: "Panadería / Repostería" },
  { value: "cafe", label: "Cafetería" },
  { value: "other", label: "Otro" },
];

const employeeCountOptions = [
  "1-5",
  "6-10",
  "11-25",
  "26-50",
  "50+",
].map(val => ({ label: val, value: val }));

const heardAboutUsOptions = [
  { value: "social_media_ad", label: "Anuncio en Redes Sociales" },
  { value: "friend_colleague", label: "Amigo o Colega" },
  { value: "search_engine", label: "Buscador (Google, Bing)" },
  { value: "online_article_blog", label: "Artículo o Blog Online" },
  { value: "youtube_video", label: "Video de YouTube" },
  { value: "podcast", label: "Podcast" },
  { value: "event_webinar", label: "Evento o Webinar" },
  { value: "email_campaign", label: "Email / Newsletter" },
  { value: "teachable_marketplace", label: "Teachable Marketplace" },
  { value: "other", label: "Otro" },
];

// Computed Validation
const isFormValid = computed(() => {
  if (!jobPosition.value) return false;
  // If has business, prioritize Business Type selection logic? 
  // User asked for "Not yet" button for Business NAME. Logic implies if they don't have one, maybe Type doesn't apply?
  // Usually if they don't have a name, they might still be planning a "Restaurant". 
  // Let's assume Type is still required unless we want to change that. 
  // The User Request focused on Name. Let's keep Type required for now as it helps segmentation ("I plan to open a restaurant").

  if (!businessType.value) return false;
  if (businessType.value === 'other' && !businessTypeOther.value.trim()) return false;

  // If has business name or explicitly says "don't have one" (which is valid as name is optional in interface)
  // Logic: Name is optional in current code, so validation only checked other fields.

  if (!employeeCount.value) return false;
  if (!heardAboutUs.value) return false;
  if (heardAboutUs.value === 'other' && !heardAboutUsOther.value.trim()) return false;
  return true;
});

function toggleNoBusiness() {
  hasNoBusiness.value = !hasNoBusiness.value;
  if (hasNoBusiness.value) {
    businessName.value = "Aún no tengo negocio"; // Or keep empty and backend handles
  } else {
    businessName.value = "";
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return;

  loading.value = true;
  errorMsg.value = null;

  try {
    if (!userStore.id) throw new Error("User ID not found");

    const payload: OnboardingBody = {
      jobPosition: jobPosition.value as string,
      businessName: hasNoBusiness.value ? "Aún no tengo negocio" : businessName.value,
      businessType: businessType.value as string,
      businessTypeOther: businessType.value === 'other' ? businessTypeOther.value : undefined,
      employeeCount: employeeCount.value as string,
      numberOfLocations: numberOfLocations.value ?? 0,
      heardAboutUs: heardAboutUs.value as string,
      heardAboutUsOther: heardAboutUs.value === 'other' ? heardAboutUsOther.value : undefined,
    };

    const { data } = await usersService.submitOnboarding(userStore.id, payload);

    // Update store (this will cause the modal to unmount via v-if in parent)
    userStore.setUser({
      onboardingCompleted: true,
    });

    // Explicitly update if backend returns useful data
    if ((data.user as any).onboardingCompleted) {
      // Redundant but safe
      userStore.onboardingCompleted = true;
    }

  } catch (err: any) {
    console.error("Onboarding error:", err);
    errorMsg.value = err.response?.data?.message || "Ocurrió un error al guardar tu información.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="header">
        <h1>¡Bienvenido a Fudmaster!</h1>
        <p class="subtitle">Complete su perfil para continuar.</p>
      </div>

      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        
        <div class="form-row">
            <div class="form-group">
            <label>Cargo / Puesto <span class="required">*</span></label>
            <CustomSelect 
                v-model="jobPosition" 
                :options="jobPositionOptions" 
                placeholder="Selecciona..." 
                required 
            />
            </div>
            
            <div class="form-group">
            <label>Nombre del Negocio</label>
            <div class="input-with-action">
                <input 
                    v-model="businessName"
                    type="text" 
                    placeholder="Nombre" 
                    :disabled="hasNoBusiness"
                />
            </div>
            <button type="button" class="text-btn small-margin" @click="toggleNoBusiness">
                {{ hasNoBusiness ? '¡Ya tengo nombre!' : 'Aún no tengo, pero pronto tendré' }}
            </button>
            </div>
        </div>

        <div class="form-group">
          <label>Tipo de Negocio <span class="required">*</span></label>
          <CustomSelect 
            v-model="businessType" 
            :options="businessTypeOptions" 
            placeholder="Selecciona..." 
            required 
          />
        </div>

        <div v-if="businessType === 'other'" class="form-group sub-group">
          <input 
            v-model="businessTypeOther"
            type="text" 
            placeholder="Especifique..." 
            required
          />
        </div>

        <div class="form-row">
            <div class="form-group">
            <label>Empleados <span class="required">*</span></label>
            <CustomSelect 
                v-model="employeeCount" 
                :options="employeeCountOptions" 
                placeholder="Rango" 
                required 
            />
            </div>

            <div class="form-group">
            <label>Sucursales</label>
            <input 
                v-model.number="numberOfLocations"
                type="number" 
                min="0"
                placeholder="0" 
            />
            </div>
        </div>

        <div class="form-group">
          <label>¿Cómo te enteraste de nosotros? <span class="required">*</span></label>
          <CustomSelect 
            v-model="heardAboutUs" 
            :options="heardAboutUsOptions" 
            placeholder="Selecciona..." 
            required 
          />
        </div>

        <div v-if="heardAboutUs === 'other'" class="form-group sub-group">
          <input 
            v-model="heardAboutUsOther"
            type="text" 
            placeholder="Especifique..." 
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="!isFormValid || loading">
          <span v-if="loading">Guardando...</span>
          <span v-else>Continuar</span>
        </button>

      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75); // Dark overlay
  backdrop-filter: blur(4px);
  z-index: 9999; // Topmost
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: var(--bg); // Theme aware
  color: var(--text); // Theme aware
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
}

.header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text);
  }

  .subtitle {
    color: var(--text);
    opacity: 0.7;
    font-size: 0.95rem;
  }
}

.error-banner {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  text-align: center;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;

  .form-group {
    flex: 1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text);
    opacity: 0.9;

    .required {
      color: #ef4444;
      margin-left: 2px;
    }
  }

  input,
  select {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
    background-color: var(--bg); // Theme aware
    color: var(--text);

    &:focus {
      outline: none;
      border-color: var(--accent, #3b82f6);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: var(--text);
      opacity: 0.4;
    }
  }
}

.sub-group {
  margin-top: -0.5rem;

  input {
    border-left: 3px solid var(--border);
  }
}

.submit-btn {
  margin-top: 1rem;
  background-color: var(--accent, #10b981); // Use accent or default green/blue
  color: white; // Assuming accent implies light text
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.text-btn {
  background: none;
  border: none;
  color: var(--accent, #3b82f6);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 0.25rem;
  align-self: flex-start;

  &:hover {
    opacity: 0.8;
  }
}
</style>
