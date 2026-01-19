import APIBase from './httpBase'
import type { AxiosResponse, AxiosRequestConfig } from 'axios'
import type { DashboardResponse } from '@/types/dashboard'

class DashboardService extends APIBase {
  /**
   * Retrieves dashboard data for a specific user.
   * GET /api/dashboard/:userId
   */
  async getDashboard(userId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<DashboardResponse>> {
    return this.get<DashboardResponse>(`dashboard/${userId}`, undefined, config)
  }
}

const dashboardService = new DashboardService()

export default dashboardService
