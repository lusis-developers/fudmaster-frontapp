import { defineStore } from 'pinia'
import careersService, { type CareerItem, type CreateCareerBody, type CreateCareerResponse, type GetCareersResponse, type GetCareerByIdResponse, type GetUserCareersResponse, type AssignCareerResponse, type EnrollCareerResponse } from '@/services/careers.service'

export const useCareersStore = defineStore('careers', {
  state: () => ({
    careers: [] as CareerItem[],
    currentCareer: null as CareerItem | null,
    currentCourses: [] as any[],
    userCareers: [] as Array<{ access: any; info: any }>,
    loading: false as boolean,
    error: '' as string,
    meta: {
      total: 0,
      page: 1,
      from: 0,
      to: 0,
      per_page: 0,
      number_of_pages: 0,
    } as Record<string, number>,
  }),
  actions: {
    async fetchAll(params?: Record<string, unknown>) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.list<GetCareersResponse>(params)
        this.careers = Array.isArray(data?.careers) ? data.careers : []
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener carreras'
      } finally {
        this.loading = false
      }
    },
    async fetchById(careerId: string) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.getById<GetCareerByIdResponse>(careerId)
        this.currentCareer = (data as any)?.career || null
        this.currentCourses = Array.isArray((data as any)?.courses) ? (data as any)?.courses : []
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener carrera'
      } finally {
        this.loading = false
      }
    },
    async create(body: CreateCareerBody) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.create<CreateCareerResponse>(body)
        const created = (data as any)?.career
        if (created) this.careers = [created, ...this.careers]
        return created as CareerItem
      } catch (e: any) {
        this.error = e?.message || 'Error al crear carrera'
        return null
      } finally {
        this.loading = false
      }
    },
    async addCourse(careerId: string, courseId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.addCourse<{ message: string; career: CareerItem }>(careerId, courseId)
        const career = (data as any)?.career
        if (career) {
          this.currentCareer = career
          this.careers = this.careers.map(c => String(c._id) === String(career._id) ? career : c)
        }
        return true
      } catch (e: any) {
        this.error = e?.message || 'Error al asignar curso'
        return false
      } finally {
        this.loading = false
      }
    },
    async removeCourse(careerId: string, courseId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.removeCourse<{ message: string; career: CareerItem }>(careerId, courseId)
        const career = (data as any)?.career
        if (career) {
          this.currentCareer = career
          this.careers = this.careers.map(c => String(c._id) === String(career._id) ? career : c)
        }
        return true
      } catch (e: any) {
        this.error = e?.message || 'Error al remover curso'
        return false
      } finally {
        this.loading = false
      }
    },
    async assignToUser(careerId: string, userId: string, options?: { autoEnroll?: boolean; teachableUserId?: string | number }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.assignToUser<AssignCareerResponse>(careerId, userId, options)
        return data
      } catch (e: any) {
        this.error = e?.message || 'Error al asignar carrera'
        return null
      } finally {
        this.loading = false
      }
    },
    async enrollUser(careerId: string, userId: string, options?: { teachableUserId?: string | number }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.enrollUser<EnrollCareerResponse>(careerId, userId, options)
        return data
      } catch (e: any) {
        this.error = e?.message || 'Error al inscribir usuario'
        return null
      } finally {
        this.loading = false
      }
    },
    async joinUser(careerId: string, userId: string, options?: { teachableUserId?: string | number }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.joinUser<EnrollCareerResponse>(careerId, userId, options)
        return data
      } catch (e: any) {
        this.error = e?.message || 'Error al unir usuario'
        return null
      } finally {
        this.loading = false
      }
    },
    async fetchUserCareers(userId: string) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await careersService.getUserCareers<GetUserCareersResponse>(userId)
        this.userCareers = Array.isArray((data as any)?.careers) ? (data as any)?.careers : []
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener carreras del usuario'
      } finally {
        this.loading = false
      }
    },
    setCurrentCareer(c: CareerItem | null) { this.currentCareer = c },
    setCareers(list: CareerItem[]) { this.careers = list },
    clear() {
      this.careers = []
      this.currentCareer = null
      this.currentCourses = []
      this.userCareers = []
      this.error = ''
      this.loading = false
    }
  }
})

