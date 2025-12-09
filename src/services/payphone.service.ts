import { 
  PAYPHONE_CONFIG, 
  type PayphoneTransaction, 
  type PayphoneResponse,
  dollarsToCents,
  generateTransactionId 
} from '@/config/payphone';

/**
 * Servicio para manejar las transacciones de Payphone
 * Implementa el flujo completo de Button/Prepare y Button/Confirm
 */
export class PayphoneService {
  
  /**
   * Prepara una transacción de pago con Payphone
   * @param productData - Datos del producto para el pago
   * @returns Promise con la respuesta de Payphone incluyendo la URL de pago
   */
  static async preparePayment(productData: {
    productId: string;
    productName: string;
    price: number;
    customerName?: string;
    customerEmail?: string;
    description?: string;
  }): Promise<PayphoneResponse> {
    try {
      console.log('🔧 [SERVICE] ===== PREPARANDO PAGO EN SERVICIO PAYPHONE =====');
      console.log('🕐 [SERVICE] Timestamp:', new Date().toISOString());
      
      // Generar ID único para la transacción
      const clientTransactionId = generateTransactionId(productData.productId);
      console.log('🆔 [SERVICE] Client Transaction ID generado:', clientTransactionId);
      
      // Convertir precio a centavos
      const amountInCents = dollarsToCents(productData.price);
      console.log('💰 [SERVICE] Conversión de precio:', {
        originalPrice: productData.price,
        amountInCents: amountInCents
      });
      
      // Preparar el cuerpo de la solicitud
      const transactionData: PayphoneTransaction = {
        amount: amountInCents,
        amountWithoutTax: amountInCents, // Asumiendo que el precio ya incluye impuestos
        tax: 0,
        service: 0,
        tip: 0,
        currency: PAYPHONE_CONFIG.CURRENCY,
        reference: `${productData.productName} - ${productData.productId}${productData.customerName ? ` - ${productData.customerName}` : ''}${productData.customerEmail ? ` - ${productData.customerEmail}` : ''}`,
        clientTransactionId,
        storeId: PAYPHONE_CONFIG.STORE_ID,
        responseUrl: PAYPHONE_CONFIG.RESPONSE_URL,
        cancellationUrl: PAYPHONE_CONFIG.CANCEL_URL
      };

      console.log('📋 [SERVICE] Datos de transacción preparados:', {
        product: productData.productName,
        amount: `$${productData.price}`,
        amountInCents: amountInCents,
        transactionId: clientTransactionId,
        storeId: PAYPHONE_CONFIG.STORE_ID,
        responseUrl: PAYPHONE_CONFIG.RESPONSE_URL
      });

      console.log('📡 [SERVICE] Enviando solicitud a API de Payphone...');
      console.log('🔗 [SERVICE] URL:', PAYPHONE_CONFIG.BUTTON_PREPARE_URL);

      // Realizar la solicitud POST a la API de Payphone
      const response = await fetch(PAYPHONE_CONFIG.BUTTON_PREPARE_URL, {
        method: 'POST',
        headers: PAYPHONE_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(transactionData)
      });

      console.log('📨 [SERVICE] Respuesta HTTP recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SERVICE] Error en respuesta de Payphone:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: PAYPHONE_CONFIG.BUTTON_PREPARE_URL
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: PayphoneResponse = await response.json();
      
      console.log('✅ [SERVICE] Pago preparado exitosamente:', {
        transactionId: result.transactionId,
        status: result.transactionStatus,
        hasPaymentUrl: !!result.payWithPayPhone,
        paymentUrl: result.payWithPayPhone ? 'URL presente' : 'URL ausente'
      });

      console.log('🎯 [SERVICE] Resultado completo de Payphone:', result);

      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Error crítico al preparar pago Payphone:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack available',
        productData: productData
      });
      
      throw new Error(
        error instanceof Error 
          ? `Error al procesar el pago: ${error.message}`
          : 'Error desconocido al procesar el pago'
      );
    }
  }

  /**
   * Confirma una transacción después del retorno de Payphone
   * @param transactionId - ID de la transacción de Payphone
   * @param clientTransactionId - ID de la transacción del cliente
   * @returns Promise con el estado final de la transacción
   */
  static async confirmPayment(
    transactionId: string, 
    clientTransactionId: string
  ): Promise<PayphoneResponse> {
    try {
      console.log('🔍 [SERVICE] ===== CONFIRMANDO PAGO EN SERVICIO PAYPHONE =====');
      console.log('🕐 [SERVICE] Timestamp:', new Date().toISOString());
      console.log('🆔 [SERVICE] Transaction ID a confirmar:', transactionId);
      console.log('🆔 [SERVICE] Client Transaction ID:', clientTransactionId);

      const confirmData = {
        id: transactionId,
        clientTransactionId
      };

      console.log('📋 [SERVICE] Datos de confirmación preparados:', confirmData);
      console.log('🔗 [SERVICE] URL de confirmación:', PAYPHONE_CONFIG.BUTTON_CONFIRM_URL);

      console.log('📡 [SERVICE] Enviando solicitud de confirmación...');
      const response = await fetch(PAYPHONE_CONFIG.BUTTON_CONFIRM_URL, {
        method: 'POST',
        headers: PAYPHONE_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(confirmData)
      });

      console.log('📨 [SERVICE] Respuesta de confirmación recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SERVICE] Error en confirmación de Payphone:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          transactionId: transactionId,
          clientTransactionId: clientTransactionId,
          url: PAYPHONE_CONFIG.BUTTON_CONFIRM_URL
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: PayphoneResponse = await response.json();
      
      console.log('✅ [SERVICE] Confirmación de pago exitosa:', {
        transactionId: result.transactionId,
        status: result.transactionStatus,
        clientTransactionId: result.clientTransactionId
      });

      console.log('🎯 [SERVICE] Resultado completo de confirmación:', result);

      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Error crítico al confirmar pago:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : 'No stack available',
        transactionId: transactionId,
        clientTransactionId: clientTransactionId
      });
      
      throw new Error(
        error instanceof Error 
          ? `Error al confirmar el pago: ${error.message}`
          : 'Error desconocido al confirmar el pago'
      );
    }
  }

  /**
   * Redirige al usuario a la página de pago de Payphone
   * @param paymentUrl - URL de pago proporcionada por Payphone
   */
  static redirectToPayment(paymentUrl: string): void {
    if (!paymentUrl) {
      throw new Error('URL de pago no válida');
    }

    console.log('🔄 Redirigiendo a Payphone:', paymentUrl);
    
    // Redirigir en la misma ventana para mantener el contexto
    window.location.href = paymentUrl;
  }

  /**
   * Valida si una URL de respuesta contiene parámetros de Payphone
   * @param url - URL a validar
   * @returns boolean indicando si contiene parámetros válidos
   */
  static isPayphoneResponse(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hasId = urlObj.searchParams.has('id');
      const hasClientTransactionId = urlObj.searchParams.has('clientTransactionId');
      
      return hasId && hasClientTransactionId;
    } catch {
      return false;
    }
  }

  /**
   * Extrae los parámetros de respuesta de Payphone de una URL
   * @param url - URL con parámetros de respuesta
   * @returns Objeto con los parámetros extraídos
   */
  static extractResponseParams(url: string): {
    transactionId: string;
    clientTransactionId: string;
  } | null {
    try {
      const urlObj = new URL(url);
      const transactionId = urlObj.searchParams.get('id');
      const clientTransactionId = urlObj.searchParams.get('clientTransactionId');

      if (!transactionId || !clientTransactionId) {
        return null;
      }

      return {
        transactionId,
        clientTransactionId
      };
    } catch {
      return null;
    }
  }
}

export default PayphoneService;
