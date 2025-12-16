import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface QuizQuestionPublic {
  prompt: string
  options: string[]
}

export interface QuizPublic {
  _id: string
  teachableCourseId: number
  title: string
  description?: string | null
  questions: QuizQuestionPublic[]
  createdAt?: string
  updatedAt?: string
}

export interface GetQuizzesByCourseResponse {
  message: string
  quizzes: QuizPublic[]
}

export interface GetQuizByIdResponse {
  message: string
  quiz: QuizPublic
}

export interface SubmitQuizBody {
  userId: string
  answers: number[]
}

export interface QuizSubmission {
  _id: string
  userRef: string
  quizRef: string
  answers: number[]
  score: number
  passed: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SubmitQuizResponse {
  message: string
  score: number
  passed: boolean
  submission?: QuizSubmission | null
  retryAfterMs?: number
  retryAvailableAt?: string
}

class QuizzesService extends APIBase {
  async getByCourse<T = GetQuizzesByCourseResponse>(courseId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`courses/${courseId}/quizzes`, undefined, config)
  }

  async getById<T = GetQuizByIdResponse>(courseId: string | number, quizId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    console.log('[QuizzesService] getById →', { courseId, quizId, params: config?.params })
    try {
      const res = await this.get<T>(`courses/${courseId}/quizzes/${quizId}`, undefined, config)
      console.log('[QuizzesService] getById ← response', { status: res.status, data: res.data })
      return res
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status
      const data = error?.response?.data ?? error?.data
      console.error('[QuizzesService] getById × error', { status, data, message: error?.message })
      throw error
    }
  }

  async submit<T = SubmitQuizResponse>(courseId: string | number, quizId: string | number, body: SubmitQuizBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    console.log('[QuizzesService] submit →', { courseId, quizId, body })
    try {
      const res = await this.post<T>(`courses/${courseId}/quizzes/${quizId}/submit`, body, { 'Content-Type': 'application/json' }, config)
      console.log('[QuizzesService] submit ← response', { status: res.status, data: res.data })
      return res
    } catch (error: any) {
      const status = error?.response?.status
      const data = error?.response?.data
      console.error('[QuizzesService] submit × error', { status, data, message: error?.message })
      throw error
    }
  }
}

const quizzesService = new QuizzesService()

export default quizzesService
