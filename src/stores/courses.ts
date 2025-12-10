import { defineStore } from 'pinia'
import coursesService from '@/services/courses.service'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [] as any[],
    enrolledCourses: [] as any[],
    currentCourse: null as any | null,
    currentLecture: null as any | null,
    currentVideo: null as any | null,
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
  }
})
