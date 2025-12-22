import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'

export interface ConfirmPaymentResponse {
  message: string
  user: any
}

class PaymentService extends APIBase {
  /**
   * Confirms payment, saves to Mongo, and enrolls in Teachable
   * @param userId - User ID (or '0'/'new' if not exists)
   * @param transactionId - Payphone Transaction ID
   * @param clientTransactionId - Generated Client Transaction ID
   * @param email - (Optional) User email from checkout form (priority over Payphone email)
   * @param name - (Optional) User name from checkout form
   */
  async confirmPayment(
    userId: string | number,
    transactionId: string,
    clientTransactionId: string,
    email?: string,
    name?: string
  ): Promise<AxiosResponse<ConfirmPaymentResponse>> {
    return await this.post<ConfirmPaymentResponse>(`payment/${userId}/confirm`, {
      id: transactionId,
      clientTransactionId,
      email,
      name
    })
  }
}

export const paymentService = new PaymentService()
export default paymentService
