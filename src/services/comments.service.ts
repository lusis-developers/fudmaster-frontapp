import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface CommentItem extends Record<string, unknown> {
  _id?: string
  id?: string
  user?: string
  content?: string
  parent?: string | null
  courseId?: number
  lectureId?: number
  videoId?: number
  likes?: string[]
  createdAt?: string
  repliesCount?: number
}

export interface ListCommentsResponse {
  message: string
  items: CommentItem[]
  total: number
  page: number
  per: number
}

export interface CreateCommentBody {
  userId: string
  content: string
  parentId?: string | null
  courseId?: number
  lectureId?: number
  videoId?: number
}

class CommentsService extends APIBase {
  async list<T = ListCommentsResponse>(params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>('comments', undefined, { ...(config || {}), params })
  }

  async getById<T = { message: string; comment: CommentItem }>(commentId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`comments/${commentId}`, undefined, config)
  }

  async getReplies<T = { message: string; items: CommentItem[]; total: number; page: number; per: number }>(commentId: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`comments/${commentId}/replies`, undefined, { ...(config || {}), params })
  }

  async create<T = { message: string; comment: CommentItem }>(body: CreateCommentBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const res = await this.post<T>('comments', body, { 'Content-Type': 'application/json' }, config)
    try { window.dispatchEvent(new Event('comments:created')); window.dispatchEvent(new Event('gamification:points-refresh')) } catch {}
    return res
  }

  async reply<T = { message: string; reply: CommentItem }>(commentId: string, body: { userId: string; content: string }, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const res = await this.post<T>(`comments/${commentId}/replies`, body, { 'Content-Type': 'application/json' }, config)
    try { window.dispatchEvent(new Event('comments:created')); window.dispatchEvent(new Event('gamification:points-refresh')) } catch {}
    return res
  }

  async like<T = { message: string }>(commentId: string, body: { userId: string }, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>(`comments/${commentId}/likes`, body, { 'Content-Type': 'application/json' }, config)
  }

  async unlike<T = { message: string }>(commentId: string, userId: string, _config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.delete<T>(`comments/${commentId}/likes/${userId}`)
  }
}

const commentsService = new CommentsService()

export default commentsService
