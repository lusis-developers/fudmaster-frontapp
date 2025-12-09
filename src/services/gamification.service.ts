import type { AxiosResponse, AxiosRequestConfig } from 'axios'
import APIBase from './httpBase'

export interface UserPointsResponse {
  message: string
  points: number
}

class GamificationService extends APIBase {
  async getUserPoints<T = UserPointsResponse>(userId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`gamification/${userId}/points`, undefined, config)
  }
}

const gamificationService = new GamificationService()

export default gamificationService
