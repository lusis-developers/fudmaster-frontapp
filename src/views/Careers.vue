<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type School = { id: number; name: string; weeks: number; description: string }

const schools = ref<School[]>([
  { id: 1, name: 'Escuela de Gestión Gastronómica', weeks: 1, description: 'Optimiza operaciones, costos y rentabilidad de tu cocina.' },
  { id: 2, name: 'Escuela de Meta Ads', weeks: 2, description: 'Campañas efectivas para atraer clientes a tu proyecto gastronómico.' },
  { id: 3, name: 'Escuela de Marketing Digital', weeks: 3, description: 'Posiciona tu marca gastronómica y acelera tu crecimiento.' },
  { id: 4, name: 'Escuela de Gestión de Equipo', weeks: 4, description: 'Lidera brigadas, mejora procesos y eleva la cultura de servicio.' },
])

const deadlines = ref<number[]>([])
const tick = ref<number>(Date.now())
let intervalId: number | undefined

function pixelStyle(i: number) {
  const hues = [120, 200, 20, 280]
  const h = hues[i % hues.length]
  return {
    '--c1': `hsla(${h}, 60%, 60%, 0.18)`,
    '--c2': `hsla(${h}, 40%, 40%, 0.14)`,
    '--c3': `hsla(${h}, 30%, 30%, 0.10)`,
  } as Record<string, string>
}

function endOfNextSunday(): Date {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = (7 - day)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59)
}

function cycleDeadline(weeks: number): number {
  const base = endOfNextSunday()
  base.setDate(base.getDate() + 7 * (weeks - 1))
  return base.getTime()
}

function initDeadlines() {
  deadlines.value = schools.value.map(s => cycleDeadline(s.weeks))
}

function resetAllToOneWeek() {
  const t = cycleDeadline(1)
  deadlines.value = deadlines.value.map(() => t)
}

function goCheckout() { router.push('/checkout') }

function fmt(n: number): string { return String(Math.max(0, n)).padStart(2, '0') }

function countdown(ms: number) {
  const now = tick.value
  const diff = Math.max(0, ms - now)
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return { d, h, m, s, finished: diff <= 0 }
}

onMounted(() => {
  initDeadlines()
  intervalId = window.setInterval(() => {
    tick.value = Date.now()
    if (deadlines.value.some(ms => ms - tick.value <= 0)) {
      resetAllToOneWeek()
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) window.clearInterval(intervalId)
})
</script>

<template>
  <div class="careers-view">
    <div class="container">
      <div class="head">
        <h2 class="title"><i class="fa-solid fa-graduation-cap" /> Escuelas exclusivas de gastronomía</h2>
        <button class="cta" type="button" @click="goCheckout"><i class="fa-solid fa-bag-shopping" /> Unirme ahora</button>
      </div>

      <div class="grid">
        <div v-for="(s, i) in schools" :key="s.id" class="card">
          <div class="cover pixelated" :style="pixelStyle(i)"></div>
          <h3 class="name">{{ s.name }}</h3>
          <p class="desc">{{ s.description }}</p>
          <div class="weeks">Disponible en {{ s.weeks }} semana(s)</div>
          <div class="label">Próximo lanzamiento en:</div>
          <div class="countdown">
            <span class="unit">{{ fmt(countdown(deadlines[i] ?? tick).d) }}d</span>
            <span class="sep">:</span>
            <span class="unit">{{ fmt(countdown(deadlines[i] ?? tick).h) }}h</span>
            <span class="sep">:</span>
            <span class="unit">{{ fmt(countdown(deadlines[i] ?? tick).m) }}m</span>
            <span class="sep">:</span>
            <span class="unit">{{ fmt(countdown(deadlines[i] ?? tick).s) }}s</span>
          </div>
          <div class="ends">Termina el domingo 23:59</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.careers-view { width: 100%; padding: 24px 16px; }
.container { width: 100%; margin: 0 auto; display: grid; gap: 16px; }
.head { display: flex; align-items: center; justify-content: space-between; }
.title { display: inline-flex; align-items: center; gap: 10px; color: $FUDMASTER-DARK; margin: 0; font-size: 22px; }
.cta { background: $FUDMASTER-GREEN; color: $white; border: none; border-radius: 10px; padding: 10px 12px; font-weight: 700; cursor: pointer; }
.grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(3, 1fr); } }
.card { background: $white; border-radius: 12px; padding: 14px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); display: grid; gap: 8px; }
.cover { width: 100%; height: 120px; border-radius: 8px; }
.pixelated {
  --c1: rgba($FUDMASTER-GREEN, 0.15);
  --c2: rgba($FUDMASTER-DARK, 0.12);
  --c3: rgba($FUDMASTER-DARK, 0.06);
  background-image:
    repeating-linear-gradient(0deg, var(--c1) 0 12px, var(--c2) 12px 24px),
    repeating-linear-gradient(90deg, var(--c3) 0 12px, transparent 12px 24px);
  background-size: 24px 24px;
}
.name { color: $FUDMASTER-DARK; font-weight: 700; margin: 0; }
.desc { color: rgba($FUDMASTER-DARK, 0.7); margin: 0; font-size: 14px; }
.weeks { color: rgba($FUDMASTER-DARK, 0.7); font-size: 12px; }
.label { color: rgba($FUDMASTER-DARK, 0.6); font-size: 12px; }
.countdown { display: inline-flex; align-items: center; gap: 6px; font-family: monospace; font-weight: 700; color: $FUDMASTER-DARK; }
.unit { background: rgba($FUDMASTER-GREEN, 0.1); padding: 6px 8px; border-radius: 6px; min-width: 42px; text-align: center; }
.sep { color: rgba($FUDMASTER-DARK, 0.4); }
.ends { color: rgba($FUDMASTER-DARK, 0.6); font-size: 12px; }
</style>
