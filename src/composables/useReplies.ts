import { ref } from 'vue'
import commentsService, { type CommentItem } from '@/services/comments.service'

export function useReplies() {
  const replies = ref<Record<string, CommentItem[]>>({})
  const openReplies = ref<Record<string, boolean>>({})
  const repliesLoading = ref<Record<string, boolean>>({})
  const replyText = ref<Record<string, string>>({})
  const repliesTotal = ref<Record<string, number>>({})

  async function fetchRepliesFor(id: string) {
    repliesLoading.value[id] = true
    try {
      const { data } = await commentsService.getReplies(id, { page: 1, per: 10 })
      const list = Array.isArray((data as any)?.items) ? (data as any).items : []
      replies.value[id] = list
      const total = Number((data as any)?.total ?? list.length ?? 0)
      repliesTotal.value[id] = total
      return list
    } finally {
      repliesLoading.value[id] = false
    }
  }

  async function submitReplyFor(id: string, userId: string) {
    const txt = (replyText.value[id] || '').trim()
    if (!userId || !txt) return
    await commentsService.reply(id, { userId, content: txt })
    replyText.value[id] = ''
    return await fetchRepliesFor(id)
  }

  function toggleReplies(id: string) {
    const cur = !!openReplies.value[id]
    openReplies.value[id] = !cur
    return openReplies.value[id]
  }

  async function fetchRepliesCountFor(id: string) {
    try {
      const { data } = await commentsService.getReplies(id, { page: 1, per: 1 })
      const total = Number((data as any)?.total ?? 0)
      if (Number.isFinite(total)) {
        repliesTotal.value[id] = total
      }
    } catch {}
  }

  return { replies, openReplies, repliesLoading, replyText, repliesTotal, fetchRepliesFor, submitReplyFor, toggleReplies, fetchRepliesCountFor }
}
