import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import APIBase from './httpBase'

export interface CreateUserBody extends Record<string, unknown> {}

class UsersService extends APIBase {
  async create<T>(body: CreateUserBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users', body, undefined, config)
  }
}

const usersService = new UsersService()

export default usersService
