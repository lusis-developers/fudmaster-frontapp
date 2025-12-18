import { defineStore } from 'pinia'
import gamificationService from '@/services/gamification.service'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    points: null as number | null,
    loading: false as boolean,
    error: '' as string,
  }),
  getters: {
    userPoints: (state) => state.points,
  },
  actions: {
    async fetchPoints(userId: string) {
      this.loading = true
      this.error = ''
      try {
        const { data, headers } = await gamificationService.getUserPoints(userId)
        const headerVal = Number((headers as any)['x-user-points'] || (headers as any)['X-User-Points'] || NaN)
        const bodyVal = Number((data as any)?.points ?? NaN)
        const final = Number.isFinite(headerVal) ? headerVal : (Number.isFinite(bodyVal) ? bodyVal : 0)
        this.points = final
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener puntos'
        this.points = null
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.points = null
      this.loading = false
      this.error = ''
    },
  },
})