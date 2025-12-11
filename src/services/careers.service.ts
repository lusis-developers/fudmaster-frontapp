import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface CreateCareerBody {
  name: string
  description?: string | null
  imageUrl?: string | null
  courseIds?: Array<number | string>
}

export interface CareerItem {
  _id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  courseIds?: number[]
  isActive?: boolean
}

export interface CreateCareerResponse { message: string; career: CareerItem }
export interface GetCareersResponse { message: string; careers: CareerItem[] }
export interface GetCareerByIdResponse { message: string; career: CareerItem; courses: any[] }
export interface AssignCareerResponse { message: string; user: Record<string, unknown>; enrolledCourseIds?: number[] }
export interface EnrollCareerResponse { message: string }
export interface GetUserCareersResponse { message: string; careers: Array<{ access: any; info: any }> }

class CareersService extends APIBase {
  async create<T = CreateCareerResponse>(body: CreateCareerBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('careers', body, { 'Content-Type': 'application/json' }, config)
  }

  async list<T = GetCareersResponse>(params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>('careers', undefined, { ...(config || {}), params })
  }

  async getById<T = GetCareerByIdResponse>(careerId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`careers/${careerId}`, undefined, config)
  }

  async addCourse<T = { message: string; career: CareerItem }>(careerId: string, courseId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>(`careers/${careerId}/courses/${courseId}`, {}, undefined, config)
  }

  async removeCourse<T = { message: string; career: CareerItem }>(careerId: string, courseId: string | number, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.delete<T>(`careers/${careerId}/courses/${courseId}`)
  }

  async assignToUser<T = AssignCareerResponse>(careerId: string, userId: string, options?: { autoEnroll?: boolean; teachableUserId?: string | number }, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const params: Record<string, unknown> = {}
    if (options?.autoEnroll !== undefined) params.autoEnroll = options.autoEnroll
    if (options?.teachableUserId !== undefined && options?.teachableUserId !== null) params.teachableUserId = options.teachableUserId
    return this.post<T>(`careers/${careerId}/assign/${userId}`, {}, undefined, { ...(config || {}), params })
  }

  async enrollUser<T = EnrollCareerResponse>(careerId: string, userId: string, options?: { teachableUserId?: string | number }, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const params: Record<string, unknown> = {}
    if (options?.teachableUserId !== undefined && options?.teachableUserId !== null) params.teachableUserId = options.teachableUserId
    return this.post<T>(`careers/${careerId}/enroll/${userId}`, {}, undefined, { ...(config || {}), params })
  }

  async joinUser<T = EnrollCareerResponse>(careerId: string, userId: string, options?: { teachableUserId?: string | number }, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const params: Record<string, unknown> = {}
    if (options?.teachableUserId !== undefined && options?.teachableUserId !== null) params.teachableUserId = options.teachableUserId
    return this.post<T>(`careers/${careerId}/join/${userId}`, {}, undefined, { ...(config || {}), params })
  }

  async getUserCareers<T = GetUserCareersResponse>(userId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`careers/user/${userId}`, undefined, config)
  }
}

const careersService = new CareersService()

export default careersService
