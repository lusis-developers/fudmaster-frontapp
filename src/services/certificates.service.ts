import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface Certificate {
  _id: string
  userRef: string
  quizRef: string | any
  pdfUrl: string
  createdAt: string
  updatedAt: string
}

export interface CertificateStatus {
  message: string
  passed: boolean
  certificate: Certificate | null
}

export interface GenerateCertificateBody {
  userId: string
}

class CertificatesService extends APIBase {
  /**
   * Get all certificates for a user
   * GET /courses/user/:userId
   */
  async getAll<T = { certificates: Certificate[] }>(userId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`courses/user/${userId}`, undefined, config)
  }

  /**
   * Get certificate status for a course
   * GET /courses/:courseId/status?userId=...
   */
  async getStatus<T = CertificateStatus>(courseId: string | number, userId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`courses/${courseId}/status`, undefined, { ...(config || {}), params: { userId } })
  }

  /**
   * Generate certificate for a course
   * POST /courses/:courseId/certificate
   */
  async generate<T = { message: string, certificateId: string, pdfUrl: string }>(courseId: string | number, body: GenerateCertificateBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>(`courses/${courseId}/certificate`, body, undefined, config)
  }

  /**
   * Verify certificate by ID
   * GET /courses/verify/:certificateId
   */
  async verify<T = { valid: boolean, certificate: Certificate, user: any, course: any }>(certificateId: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`courses/verify/${certificateId}`, undefined, config)
  }
}

export default new CertificatesService()
