import { defineStore } from 'pinia'
import certificatesService, { type Certificate, type CertificateStatus } from '@/services/certificates.service'

export const useCertificatesStore = defineStore('certificates', {
  state: () => ({
    items: [] as Certificate[],
    currentStatus: null as CertificateStatus | null,
    loading: false,
    error: null as string | null,
    generating: false,
  }),

  actions: {
    async fetchAll(userId: string | number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await certificatesService.getAll<{ certificates: Certificate[] }>(userId)
        this.items = data.certificates || []
      } catch (err: any) {
        console.error('[CertificatesStore] fetchAll error', err)
        this.error = err.response?.data?.message || err.message || 'Error al cargar certificados'
      } finally {
        this.loading = false
      }
    },

    async fetchStatus(courseId: string | number, userId: string | number) {
      this.loading = true
      this.error = null
      try {
        const { data } = await certificatesService.getStatus<CertificateStatus>(courseId, userId)
        this.currentStatus = data
      } catch (err: any) {
        console.error('[CertificatesStore] fetchStatus error', err)
        this.error = err.response?.data?.message || err.message || 'Error al verificar estado del certificado'
        this.currentStatus = null
      } finally {
        this.loading = false
      }
    },

    async generate(courseId: string | number, userId: string | number) {
      this.generating = true
      this.error = null
      try {
        const { data } = await certificatesService.generate(courseId, { userId: String(userId) })
        // Update local status if successful
        if (this.currentStatus) {
            // We can assume if generation worked, we now have a certificate
            // However, the backend returns pdfUrl and certificateId. 
            // We might need to reload status or manually patch it.
            // Let's just reload status to be safe and get the full object
            await this.fetchStatus(courseId, userId)
        }
        return data
      } catch (err: any) {
        console.error('[CertificatesStore] generate error', err)
        this.error = err.response?.data?.message || err.message || 'Error al generar certificado'
        throw err
      } finally {
        this.generating = false
      }
    }
  }
})
