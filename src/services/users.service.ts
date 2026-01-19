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

export type Gender = 'male' | 'female' | 'prefer_not_to_say' | 'other'
export type HeardAboutUs =
  | 'social_media_ad'
  | 'friend_colleague'
  | 'search_engine'
  | 'online_article_blog'
  | 'youtube_video'
  | 'podcast'
  | 'event_webinar'
  | 'email_campaign'
  | 'teachable_marketplace'
  | 'other'

export type AccountType = 'free' | 'premium' | 'student' | 'founder'

export interface UpdateUserBody {
  name?: string
  email?: string
  gender?: Gender
  genderOther?: string | null
  dateOfBirth?: string | null
  heardAboutUs?: HeardAboutUs
  heardAboutUsOther?: string | null
}

export interface OnboardingBody {
  jobPosition?: string
  businessName?: string
  businessType?: string
  businessTypeOther?: string
  employeeCount?: string
  numberOfLocations?: number
  heardAboutUs?: string
  heardAboutUsOther?: string
}

export interface CourseAccess {
  teachableCourseId: number
  status: 'active' | 'revoked'
  enrolledAt: string
  expiresAt: string | null
  courseRef?: string | null
}

export interface CareerAccess {
  careerId: string
  name: string
  courseIds: number[]
  status: 'active' | 'revoked'
  enrolledAt: string
  careerRef?: string | null
}

export interface PaymentItem {
  provider: 'teachable' | 'stripe' | 'other'
  amount: number
  currency: string
  transactionId: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  courseId?: number
  careerId?: string
}

export interface SafeUser {
  _id: string
  name: string
  email: string
  teachableUserId?: number
  gender: Gender | null
  genderOther: string | null
  dateOfBirth: string | null
  heardAboutUs: HeardAboutUs | null
  heardAboutUsOther: string | null
  points: number
  accountType: AccountType
  courses: CourseAccess[]
  careers: CareerAccess[]
  payments: PaymentItem[]
  transactions: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateUserResponse {
  message: string
  user: SafeUser
}

export interface GetUserResponse {
  message: string
  user: SafeUser
}

export interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface RequestPasswordRecoveryBody {
  email: string
}

export interface RequestPasswordRecoveryResponse {
  message: string
}

export interface ResetPasswordBody {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

class UsersService extends APIBase {
  async create<T>(body: CreateUserBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users', body, undefined, config)
  }

  async login<T = LoginResponse>(body: LoginBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users/login', body, { 'Content-Type': 'application/json' }, config)
  }

  /**
   * Inicia sesión o registra un usuario mediante Google (Firebase Auth).
   * Envía el ID Token de Firebase al backend para verificación y creación de sesión.
   * 
   * @param firebaseToken El ID Token obtenido de result.user.getIdToken()
   */
  async googleLogin<T = LoginResponse>(firebaseToken: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Sobrescribimos los headers para enviar el token de Firebase en lugar del token de la app
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`
    }
    return this.post<T>('users/google-login', {}, headers, config)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token')
    try {
      window.dispatchEvent(new Event('auth:token-expired'))
    } catch { }
  }

  async registerFromPayment<T = RegisterFromPaymentResponse>(body: RegisterFromPaymentBody, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.post<T>('users/register-from-payment', body, { 'Content-Type': 'application/json' }, config)
  }

  async getById<T = GetUserResponse>(userId: string | number, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>(`users/${userId}`, undefined, config)
  }

  async changePassword<T = ChangePasswordResponse>(userId: string | number, body: ChangePasswordBody): Promise<AxiosResponse<T>> {
    return this.patch<T>(`users/${userId}/password`, body)
  }

  async existsByEmail<T = { message: string; exists: boolean; user?: Record<string, unknown> }>(email: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.get<T>('users/exists', undefined, { ...(config || {}), params: { email } })
  }

  async updateById<T = UpdateUserResponse>(userId: string | number, body: UpdateUserBody): Promise<AxiosResponse<T>> {
    return this.patch<T>(`users/${userId}`, body)
  }

  async requestPasswordRecovery<T = RequestPasswordRecoveryResponse>(body: RequestPasswordRecoveryBody): Promise<AxiosResponse<T>> {
    return this.post<T>('users/request-password-recovery', body)
  }

  async resetPassword<T = ResetPasswordResponse>(body: ResetPasswordBody): Promise<AxiosResponse<T>> {
    return this.post<T>('users/reset-password', body)
  }

  async submitOnboarding<T = { message: string, user: SafeUser }>(userId: string | number, body: OnboardingBody): Promise<AxiosResponse<T>> {
    return this.patch<T>(`users/${userId}/onboarding`, body)
  }
}

const usersService = new UsersService()

export default usersService
