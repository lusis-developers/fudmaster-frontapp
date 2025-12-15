import { defineStore } from 'pinia'
import quizzesService, { type QuizPublic, type QuizSubmission, type SubmitQuizBody } from '@/services/quizzes.service'

export const useQuizzesStore = defineStore('quizzes', {
  state: () => ({
    quizzes: [] as QuizPublic[],
    currentQuiz: null as QuizPublic | null,
    lastResult: null as ({ score: number; passed: boolean; submission?: QuizSubmission | null } | null),
    loading: false as boolean,
    submitting: false as boolean,
    error: '' as string,
    retryAfterMs: null as number | null,
    retryAvailableAt: null as string | null,
    approvedAlready: false as boolean,
  }),
  actions: {
    async loadByCourse(courseId: string | number) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await quizzesService.getByCourse(courseId)
        this.quizzes = Array.isArray(data?.quizzes) ? data.quizzes : []
      } catch (err: any) {
        this.error = String(err?.message || 'Error al cargar quizzes')
      } finally {
        this.loading = false
      }
    },
    async loadById(courseId: string | number, quizId: string | number, options?: { userId?: string }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await quizzesService.getById(courseId, quizId, { params: options?.userId ? { userId: options.userId } : undefined })
        this.currentQuiz = (data as any)?.quiz || null
        const msg = String((data as any)?.message || '')
        const passed = Boolean((data as any)?.passed || false)
        const score = Number((data as any)?.score || 0)
        const ra = (data as any)?.retryAfterMs
        const rv = (data as any)?.retryAvailableAt
        if (passed) {
          this.approvedAlready = true
          this.lastResult = { score, passed: true, submission: null }
          this.error = msg || 'Quiz already approved.'
        } else if (typeof ra === 'number' || typeof rv === 'string') {
          this.retryAfterMs = typeof ra === 'number' ? ra : null
          this.retryAvailableAt = typeof rv === 'string' ? rv : null
          this.error = msg || 'Retry not allowed yet.'
          this.lastResult = null
        }
      } catch (err: any) {
        this.error = String(err?.message || 'Error al cargar el quiz')
        this.currentQuiz = null
      } finally {
        this.loading = false
      }
    },
    async submit(courseId: string | number, quizId: string | number, userId: string, answers: number[]) {
      this.submitting = true
      this.error = ''
      this.retryAfterMs = null
      this.retryAvailableAt = null
      this.approvedAlready = false
      try {
        const body: SubmitQuizBody = { userId, answers }
        const { data } = await quizzesService.submit(courseId, quizId, body)
        console.log('[QuizzesStore] submit success', data)
        this.lastResult = {
          score: Number((data as any)?.score || 0),
          passed: Boolean((data as any)?.passed || false),
          submission: (data as any)?.submission as (QuizSubmission | null | undefined),
        }
        if ((data as any)?.retryAfterMs) this.retryAfterMs = Number((data as any)?.retryAfterMs)
        if ((data as any)?.retryAvailableAt) this.retryAvailableAt = String((data as any)?.retryAvailableAt)
      } catch (err: any) {
        const status = Number((err?.response?.status ?? err?.status ?? 0))
        const data = (err?.response?.data ?? err?.data ?? {})
        console.error('[QuizzesStore] submit error', { status, data, message: err?.message })
        if (status === 429) {
          this.error = String(data?.message || 'No puedes reintentar aún')
          this.retryAfterMs = typeof data?.retryAfterMs === 'number' ? data.retryAfterMs : null
          this.retryAvailableAt = typeof data?.retryAvailableAt === 'string' ? data.retryAvailableAt : null
          this.lastResult = null
        } else if (status === 409) {
          this.error = String(data?.message || 'Quiz ya aprobado')
          this.approvedAlready = true
          this.lastResult = {
            score: Number(data?.score || 0),
            passed: true,
            submission: null,
          }
        } else {
          this.error = String(err?.message || 'Error al enviar el quiz')
          this.lastResult = null
        }
      } finally {
        this.submitting = false
      }
    },
    clear() {
      this.quizzes = []
      this.currentQuiz = null
      this.lastResult = null
      this.loading = false
      this.submitting = false
      this.error = ''
      this.retryAfterMs = null
      this.retryAvailableAt = null
      this.approvedAlready = false
    },
  },
})
