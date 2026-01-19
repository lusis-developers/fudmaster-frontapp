<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Generic Option Type
export interface SelectOption {
  label: string;
  value: string | number | null;
}

const props = defineProps<{
  modelValue: string | number | null;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder || 'Select...';
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(value: string | number | null) {
  emit('update:modelValue', value);
  isOpen.value = false;
}

function closeDropdown(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <div class="custom-select" ref="containerRef" :class="{ 'is-open': isOpen }">
    <div class="selected-value" @click="toggleDropdown">
      <span :class="{ 'placeholder': !modelValue && modelValue !== 0 }">
        {{ selectedLabel }}
      </span>
      <i class="fa-solid fa-chevron-down arrow"></i>
    </div>
    
    <transition name="fade">
      <ul v-if="isOpen" class="options-list">
        <!-- Optional: Add 'disabled' logic for placeholder-like options if needed -->
        <li 
          v-for="opt in options" 
          :key="String(opt.value)" 
          class="option-item"
          :class="{ 'active': modelValue === opt.value }"
          @click="selectOption(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.selected-value {
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem; // Space for arrow
  font-size: 0.95rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  min-height: 48px; // Ensure touch target size

  &:hover {
    border-color: var(--text); // Subtle hover interaction
  }

  .placeholder {
    color: var(--text);
    opacity: 0.4;
  }
}

.custom-select.is-open .selected-value {
  border-color: var(--accent, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.6;
  pointer-events: none;
  transition: transform 0.2s;
}

.custom-select.is-open .arrow {
  transform: translateY(-50%) rotate(180deg);
}

.options-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100; // Above other form elements
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  padding: 4px;
  margin: 0;
}

.option-item {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  color: var(--text);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05); // Light mode hover
  }

  &.active {
    background-color: var(--accent, #3b82f6);
    color: white;
  }
}

// Dark mode adjustments (if class or media query used, assuming var(--bg) handles it generally)
@media (prefers-color-scheme: dark) {
  .option-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
