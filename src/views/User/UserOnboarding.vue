<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import usersService, { type OnboardingBody } from "@/services/users.service";

const router = useRouter();
const userStore = useUserStore();

// Form State
const jobPosition = ref("");
const businessName = ref("");
const businessType = ref<string | null>(null);
const businessTypeOther = ref("");
const employeeCount = ref<string | null>(null);
const numberOfLocations = ref<number | null>(null);
const heardAboutUs = ref<string | null>(null);
const heardAboutUsOther = ref("");

const loading = ref(false);
const errorMsg = ref<string | null>(null);

// Options
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
];

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
  if (!jobPosition.value.trim()) return false;
  if (!businessType.value) return false;
  if (businessType.value === 'other' && !businessTypeOther.value.trim()) return false;
  if (!employeeCount.value) return false;
  // numberOfLocations is optional but let's assume if entered checks are done by input type.
  if (!heardAboutUs.value) return false;
  if (heardAboutUs.value === 'other' && !heardAboutUsOther.value.trim()) return false;
  return true;
});

async function handleSubmit() {
  if (!isFormValid.value) return;

  loading.value = true;
  errorMsg.value = null;

  try {
    if (!userStore.id) throw new Error("User ID not found");

    const payload: OnboardingBody = {
      jobPosition: jobPosition.value,
      businessName: businessName.value,
      businessType: businessType.value as string,
      businessTypeOther: businessType.value === 'other' ? businessTypeOther.value : undefined,
      employeeCount: employeeCount.value as string,
      numberOfLocations: numberOfLocations.value ?? 0,
      heardAboutUs: heardAboutUs.value as string,
      heardAboutUsOther: heardAboutUs.value === 'other' ? heardAboutUsOther.value : undefined,
    };

    const { data } = await usersService.submitOnboarding(userStore.id, payload);

    // Update store
    userStore.setUser({
      onboardingCompleted: true, // Optimistic update or use returned user
    });

    // Also explicitly verify returned user
    if ((data.user as any).onboardingCompleted) {
      // Redirection
      router.push("/dashboard");
    } else {
      // Fallback
      router.push("/dashboard");
    }

  } catch (err: any) {
    console.error("Onboarding error:", err);
    errorMsg.value = err.response?.data?.message || "Ocurrió un error al guardar tu información regarding onboarding.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="onboarding-container">
    <div class="onboarding-card">
      <h1>¡Bienvenido a Fudmaster!</h1>
      <p class="subtitle">Para personalizar tu experiencia, necesitamos conocer un poco más sobre ti y tu negocio.</p>

      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="onboarding-form">
        
        <div class="form-group">
          <label>Cargo / Puesto de Trabajo <span class="required">*</span></label>
          <input 
            v-model="jobPosition"
            type="text" 
            placeholder="Ej. Dueño, Chef Ejecutivo, Gerente..." 
            required
          />
        </div>

        <div class="form-group">
          <label>Nombre del Negocio (Opcional)</label>
          <input 
            v-model="businessName"
            type="text" 
            placeholder="Nombre de tu establecimiento" 
          />
        </div>

        <div class="form-group">
          <label>Tipo de Negocio <span class="required">*</span></label>
          <select v-model="businessType" required>
            <option :value="null" disabled>Selecciona una opción</option>
            <option v-for="opt in businessTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="businessType === 'other'" class="form-group sub-group">
          <label>Especifica el tipo de negocio <span class="required">*</span></label>
          <input 
            v-model="businessTypeOther"
            type="text" 
            placeholder="Describe tu negocio" 
            required
          />
        </div>

        <div class="form-group">
          <label>Cantidad de Empleados <span class="required">*</span></label>
          <select v-model="employeeCount" required>
            <option :value="null" disabled>Selecciona un rango</option>
            <option v-for="opt in employeeCountOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Número de Sucursales</label>
          <input 
            v-model.number="numberOfLocations"
            type="number" 
            min="0"
            placeholder="0" 
          />
        </div>

        <div class="form-group">
          <label>¿Cómo te enteraste de nosotros? <span class="required">*</span></label>
          <select v-model="heardAboutUs" required>
            <option :value="null" disabled>Selecciona una opción</option>
            <option v-for="opt in heardAboutUsOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="heardAboutUs === 'other'" class="form-group sub-group">
          <label>Especifica <span class="required">*</span></label>
          <input 
            v-model="heardAboutUsOther"
            type="text" 
            placeholder="Cuéntanos cómo nos conociste" 
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="!isFormValid || loading">
          <span v-if="loading">Guardando...</span>
          <span v-else>Comenzar</span>
        </button>

      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.onboarding-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f8; // Light background
  padding: 2rem;
}

.onboarding-card {
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.5;
  }
}

.error-banner {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #374151;

    .required {
      color: #ef4444;
      margin-left: 2px;
    }
  }

  input,
  select {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: #fff;

    &:focus {
      outline: none;
      border-color: #3b82f6; // Brand color or typical blue
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.sub-group {
  margin-top: -0.5rem;
  padding-left: 1rem;
  border-left: 3px solid #e5e7eb;
}

.submit-btn {
  margin-top: 1rem;
  background-color: #111827; // Dark almost black
  color: white;
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
}

@media (max-width: 640px) {
  .onboarding-container {
    padding: 1rem;
  }

  .onboarding-card {
    padding: 1.5rem;
  }
}
</style>
