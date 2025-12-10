import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface CreateUserBody extends Record<string, unknown> { }
export interface LoginBody {
  email: string
  password: string
}
export interface LoginResponse {
  message: string
  token: string
  user: Record<string, unknown>
}

export interface RegisterFromPaymentBody {
  email: string
  transactionStatus: string
  statusCode?: number
  authorizationCode?: string
  transactionId?: string | number
  amount?: number
  currency?: string
  reference?: string
}

export interface RegisterFromPaymentResponse {
  message: string
  user: Record<string, unknown>
}

class UsersService extends APIBase {
  async create<T>(body: CreateUserBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users', body, undefined, config)
  }

  async login<T = LoginResponse>(body: LoginBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users/login', body, { 'Content-Type': 'application/json' }, config)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token')
    try {
      window.dispatchEvent(new Event('auth:token-expired'))
    } catch {}
  }

  async registerFromPayment<T = RegisterFromPaymentResponse>(body: RegisterFromPaymentBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users/register-from-payment', body, { 'Content-Type': 'application/json' }, config)
  }

  async getById<T = { message: string; user: Record<string, unknown> }>(userId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`users/${userId}`, undefined, config)
  }

  async existsByEmail<T = { message: string; exists: boolean; user?: Record<string, unknown> }>(email: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>('users/exists', undefined, { ...(config || {}), params: { email } })
  }
}

const usersService = new UsersService()

export default usersService
