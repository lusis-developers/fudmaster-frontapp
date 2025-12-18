import { defineStore } from 'pinia'
import coursesService from '@/services/courses.service'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [] as any[],
    enrolledCourses: [] as any[],
    currentCourse: null as any | null,
    currentLecture: null as any | null,
    currentVideo: null as any | null,
    progress: {
      percent: 0,
      completed: 0,
      total: 0,
      completedLectureIds: [] as Array<string | number>,
    },
    loading: false as boolean,
    error: '' as string,
    errorCode: null as number | null,
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
    setCurrentLectureFromCourse(lectureId: string | number) {
      const course = this.currentCourse
      const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections : []
      for (const s of sections) {
        const lectures = Array.isArray(s?.lectures) ? s.lectures : []
        const found = lectures.find((l: any) => String(l?.id) === String(lectureId))
        if (found) { this.currentLecture = found; return found }
      }
      return null
    },
    nextLectureIdGlobal(): string | number | null {
      const course = this.currentCourse
      const current = this.currentLecture
      if (!course || !current) return null
      const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections.slice().sort((a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0)) : []
      const list: any[] = []
      for (const s of sections) {
        const lectures = Array.isArray(s?.lectures) ? s.lectures.slice().sort((a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0)) : []
        for (const l of lectures) list.push(l)
      }
      const idx = list.findIndex((l: any) => String(l?.id) === String(current?.id))
      if (idx < 0) return null
      const next = list[idx + 1]
      return next?.id ?? null
    },
    nextLectureIdInSection(): string | number | null {
      const course = this.currentCourse
      const current = this.currentLecture
      if (!course || !current) return null
      const sectionId = current?.lecture_section_id
      const section = (Array.isArray(course?.lecture_sections) ? course.lecture_sections : []).find((s: any) => String(s?.id) === String(sectionId))
      if (!section) return null
      const lectures = Array.isArray(section?.lectures) ? section.lectures.slice().sort((a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0)) : []
      const idx = lectures.findIndex((l: any) => String(l?.id) === String(current?.id))
      if (idx < 0) return null
      const next = lectures[idx + 1]
      return next?.id ?? null
    },
    async goToNextLecture(courseId: string | number, router: any, scope: 'global' | 'section' = 'global', currentLectureId?: string | number) {
      console.log('[coursesStore] goToNextLecture', { courseId, scope, currentLectureId })
      if (!this.currentCourse) {
        try { await this.fetchById(courseId) } catch {}
      }
      if (!this.currentLecture && currentLectureId !== undefined) {
        this.setCurrentLectureFromCourse(currentLectureId)
      }
      let nextId = scope === 'section' ? this.nextLectureIdInSection() : this.nextLectureIdGlobal()
      console.log('[coursesStore] computed nextId', nextId)
      if (!courseId || !nextId) {
        console.log('[coursesStore] nextId not found, abort navigation')
        return false
      }
      this.setCurrentLectureFromCourse(nextId)
      try {
        router.push(`/courses/${courseId}/lectures/${nextId}`)
        console.log('[coursesStore] router.push done')
      } catch (e) {
        console.log('[coursesStore] router.push error', e)
        return false
      }
      return true
    },
    async fetchAll(params?: Record<string, unknown>) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await coursesService.list<any>(params)
        const payload = data as any
        const items = Array.isArray(payload?.courses?.courses) ? payload.courses.courses : []
        const meta = payload?.courses?.meta || {}
        this.meta = {
          total: Number(meta?.total || 0),
          page: Number(meta?.page || 1),
          from: Number(meta?.from || 0),
          to: Number(meta?.to || 0),
          per_page: Number(meta?.per_page || 0),
          number_of_pages: Number(meta?.number_of_pages || 0),
        }
        this.courses = items
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener cursos'
      } finally {
        this.loading = false
      }
    },
    async fetchEnrolled(userId: string | number, params?: Record<string, unknown>) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await coursesService.getEnrolledByUser<any>(userId, params)
        const payload = data as any
        const items = Array.isArray(payload?.courses) ? payload.courses.map((e: any) => e?.course ?? e) : []
        this.enrolledCourses = items
        return items
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener cursos inscritos'
        return []
      } finally {
        this.loading = false
      }
    },
    async fetchById(courseId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await coursesService.getById<any>(courseId)
        const payload = data as any
        this.currentCourse = payload?.course?.course ?? payload?.course ?? payload
        return this.currentCourse
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener curso'
        return null
      } finally {
        this.loading = false
      }
    },
    async fetchVideo(courseId: string | number, lectureId: string | number, videoId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await coursesService.getVideo<any>(courseId, lectureId, videoId)
        this.currentVideo = data
        return data
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener video'
        return null
      } finally {
        this.loading = false
      }
    }
    ,
    async fetchLecture(courseId: string | number, lectureId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await coursesService.getLecture<any>(courseId, lectureId)
        this.currentLecture = (data as any)?.lecture?.lecture ?? (data as any)?.lecture ?? data
        return this.currentLecture
      } catch (e: any) {
        this.error = e?.message || 'Error al obtener lección'
        return null
      } finally {
        this.loading = false
      }
    }
    ,
    async completeLecture(courseId: string | number, lectureId: string | number, payload?: { userId?: string | number; teachableUserId?: string | number }) {
      this.error = ''
      try {
        const storedUserId = localStorage.getItem('user_id')
        const storedTeachable = localStorage.getItem('teachable_user_id')
        const body: Record<string, unknown> = {}
        if (payload?.userId !== undefined && payload?.userId !== null) body.userId = payload.userId
        if (payload?.teachableUserId !== undefined && payload?.teachableUserId !== null) body.teachableUserId = payload.teachableUserId
        if (!body.userId && storedUserId) body.userId = storedUserId
        if (!body.teachableUserId && storedTeachable) body.teachableUserId = storedTeachable
        console.log('[coursesStore] completeLecture POST body', body)
        const { data } = await coursesService.completeLecture<any>(courseId, lectureId, body)
        // Actualizar progreso local si el backend no lo devuelve
        const lid = String(lectureId)
        const exists = (this.progress.completedLectureIds || []).some((id) => String(id) === lid)
        if (!exists) {
          this.progress.completedLectureIds = [...(this.progress.completedLectureIds || []), lectureId]
          this.progress.completed = Number(this.progress.completed || 0) + 1
          const total = Number(this.progress.total || 0) || this.computeTotalLectures()
          this.progress.total = total
          this.progress.percent = total > 0 ? Math.round((this.progress.completed / total) * 100) : 0
        }
        return data
      } catch (e: any) {
        console.log('[coursesStore] completeLecture error', e)
        this.error = e?.message || 'Error al completar la clase'
        return null
      }
    }
    ,
    async fetchProgress(courseId: string | number, userId: string | number) {
      this.loading = true
      this.error = ''
      this.errorCode = null
      try {
        const { data } = await coursesService.getProgress<any>(courseId, userId)
        const root = (data as any)?.progress ?? data
        const courseProgress = (root as any)?.course_progress ?? root
        const sections = Array.isArray(courseProgress?.lecture_sections) ? courseProgress.lecture_sections : []
        const completedList: Array<string | number> = []
        for (const s of sections) {
          const lectures = Array.isArray(s?.lectures) ? s.lectures : []
          for (const l of lectures) {
            const isCompleted = !!(l?.is_completed)
            if (isCompleted && l?.id !== undefined && l?.id !== null) completedList.push(l.id)
          }
        }
        const completed = Number(courseProgress?.completed || completedList.length || 0)
        const meta = (root as any)?.meta || {}
        const totalMeta = Number(meta?.total || 0)
        const totalCourse = this.computeTotalLectures()
        const total = totalMeta > 0 ? totalMeta : totalCourse
        const percentFromApi = Number(courseProgress?.percent_complete || courseProgress?.percent || 0)
        const percentCalc = total > 0 ? Math.round(((completedList.length || completed) / total) * 100) : 0
        const percent = Number.isFinite(percentFromApi) && percentFromApi > 0 ? percentFromApi : percentCalc
        this.progress = {
          percent,
          completed: completedList.length || completed,
          total,
          completedLectureIds: completedList,
        }
        return this.progress
      } catch (e: any) {
        console.log('[coursesStore] fetchProgress error', e)
        const status = e?.response?.status
        const msg = e?.response?.data?.message || e?.message || ''
        
        this.error = msg || 'Error al obtener progreso'
        
        if (status === 404 || msg === 'Not Found' || msg.includes('404')) {
          this.errorCode = 404
        } else {
          this.errorCode = status || 500
        }
        
        return null
      } finally {
        this.loading = false
      }
    }
    ,
    computeTotalLectures(): number {
      const course = this.currentCourse
      const sections = Array.isArray(course?.lecture_sections) ? course.lecture_sections : []
      let total = 0
      for (const s of sections) total += (Array.isArray(s?.lectures) ? s.lectures.length : 0)
      return total
    }
  }
})
