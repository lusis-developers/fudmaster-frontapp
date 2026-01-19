<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import commentsService, { type CommentItem } from '@/services/comments.service'
import { useUserStore } from '@/stores/user'
import usersService from '@/services/users.service'
import { useReplies } from '@/composables/useReplies'

const props = defineProps({
  courseId: { type: [String, Number], required: true },
  lectureId: { type: [String, Number], required: true },
  videoId: { type: [String, Number], required: false },
  showTitle: { type: Boolean, required: false, default: true },
})

const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const items = ref<CommentItem[]>([])
const total = ref(0)
const page = ref(1)
const per = ref(20)
const content = ref('')
const posting = ref(false)
const authors = ref<Record<string, string>>({})
const { replies, openReplies, repliesLoading, replyText, repliesTotal, fetchRepliesFor, submitReplyFor, toggleReplies, fetchRepliesCountFor } = useReplies()

const userId = computed(() => {
  if (!userStore.id) userStore.hydrate()
  const uid = userStore.id
  return typeof uid === 'number' ? String(uid) : (uid || '')
})

async function fetchComments() {
  loading.value = true
  error.value = ''
  try {
    const params: Record<string, unknown> = {
      courseId: Number(props.courseId),
      lectureId: Number(props.lectureId),
      page: page.value,
      per: per.value,
    }
    if (props.videoId !== undefined) params.videoId = Number(props.videoId)
    const { data } = await commentsService.list(params)
    items.value = Array.isArray((data as any)?.items) ? (data as any).items : []
    total.value = Number((data as any)?.total || 0)
    await resolveAuthors(items.value)
    const prefetchIds = items.value.slice(0, Math.min(items.value.length, 5)).map(c => String(c._id || c.id))
    await Promise.all(prefetchIds.map(id => fetchRepliesCountFor(id)))
  } catch (e: any) {
    error.value = e?.message || 'Error al obtener comentarios'
  } finally {
    loading.value = false
  }
}

function hasLiked(c: CommentItem): boolean {
  const likes = (c.likes || []) as string[]
  const uid = userId.value
  return !!likes.find(l => String(l) === String(uid))
}

async function toggleLike(c: CommentItem) {
  if (!userId.value || !c || !c._id && !c.id) return
  const id = String(c._id || c.id)
  try {
    if (hasLiked(c)) {
      await commentsService.unlike(id, userId.value)
      c.likes = (c.likes || []).filter((l: any) => String(l) !== String(userId.value))
    } else {
      await commentsService.like(id, { userId: userId.value })
      c.likes = [...(c.likes || []), userId.value]
    }
  } catch { }
}

async function submit() {
  if (!userId.value || !content.value.trim()) return
  posting.value = true
  error.value = ''
  try {
    const body = {
      userId: userId.value,
      content: content.value.trim(),
      parentId: null,
      courseId: Number(props.courseId),
      lectureId: Number(props.lectureId),
      videoId: props.videoId !== undefined ? Number(props.videoId) : undefined,
    }
    await commentsService.create(body)
    content.value = ''
    await fetchComments()
  } catch (e: any) {
    error.value = e?.message || 'No se pudo publicar el comentario'
  } finally {
    posting.value = false
  }
}

async function onToggleReplies(c: CommentItem) {
  const id = String(c._id || c.id)
  const opened = toggleReplies(id)
  if (opened && !replies.value[id]) {
    const list = await fetchRepliesFor(id)
    await resolveAuthors(list)
  }
}

async function resolveAuthors(list: CommentItem[]) {
  const uids = Array.from(new Set(list.map(c => String(c.user || '')).filter(Boolean)))
  const currentId = userId.value
  if (currentId && userStore.name) {
    authors.value[String(currentId)] = String(userStore.name)
  }
  await Promise.all(uids.map(async (uid) => {
    if (authors.value[uid]) return
    try {
      const { data } = await usersService.getById(uid)
      const name = String((data as any)?.user?.name || (data as any)?.user?.fullName || (data as any)?.user?.email || 'Usuario')
      authors.value[uid] = name
    } catch {
      authors.value[uid] = 'Usuario'
    }
  }))
}

function authorName(uid: any): string {
  const id = String(uid || '')
  if (id && id === userId.value) return 'Tú'
  return authors.value[id] || 'Usuario'
}

function replyCountOf(c: CommentItem): number | null {
  const id = String(c._id || c.id)
  const direct = typeof (c as any).repliesCount === 'number' ? Number((c as any).repliesCount) : NaN
  const total = repliesTotal.value[id]
  const val = Number.isFinite(direct) ? direct : (typeof total === 'number' ? total : NaN)
  return Number.isFinite(val) ? Number(val) : null
}

function isRepliesOpen(c: CommentItem): boolean {
  const id = String(c._id || c.id)
  return !!openReplies.value[id]
}

function discussionLabel(c: CommentItem): string {
  const count = replyCountOf(c)
  const opened = isRepliesOpen(c)
  if (!Number.isFinite(count || NaN) || (count || 0) === 0) return 'Responder'
  return opened ? 'Ocultar discusión' : 'Leer discusión'
}

onMounted(fetchComments)
</script>

<template>
  <div class="comments">
    <h3 v-if="props.showTitle" class="title"><i class="fa-regular fa-comments" /> Comentarios <span v-if="total" class="count">{{ total }}</span></h3>
    <div v-if="loading" class="state"><i class="fa-solid fa-spinner fa-spin" /> Cargando comentarios...</div>
    <div v-else-if="error" class="state error"><i class="fa-solid fa-triangle-exclamation" /> {{ error }}</div>

    <div class="composer">
      <textarea v-model="content" class="input" rows="3" placeholder="Escribe tu comentario"></textarea>
      <div v-if="content.trim()" class="composer-preview">
        <div class="preview-label">Vista previa</div>
        <div class="meta">
          <span class="author"><i class="fa-solid fa-user" /> {{ authorName(userId) }}</span>
          <span class="date">Ahora</span>
        </div>
        <p class="content">{{ content }}</p>
        <div class="actions preview-actions">
          <button class="like" disabled>
            <i class="fa-regular fa-heart" /> 0
          </button>
          <button class="reply" disabled>
            <i class="fa-regular fa-comment-dots" /> Responder
          </button>
        </div>
      </div>
      <button class="send" :disabled="posting || !content.trim()" @click="submit">
        <i class="fa-solid fa-paper-plane" /> Publicar
      </button>
    </div>

    <ul class="list" v-if="items.length">
      <li v-for="c in items" :key="c._id || c.id" class="item">
        <div class="meta">
          <span class="author"><i class="fa-solid fa-user" /> {{ authorName(c.user) }}</span>
          <span class="date">{{ new Date(String(c.createdAt)).toLocaleString() }}</span>
        </div>
        <p class="content">{{ c.content }}</p>
        <div class="actions">
          <button class="like" @click="toggleLike(c)">
            <i :class="hasLiked(c) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
            {{ (c.likes || []).length || 0 }}
          </button>
          <button class="reply" @click="onToggleReplies(c)" :aria-expanded="isRepliesOpen(c)">
            <i class="fa-regular fa-comment-dots" /> {{ discussionLabel(c) }}
            <span v-if="replyCountOf(c) !== null && replyCountOf(c) !== 0" class="badge">{{ replyCountOf(c) }}</span>
          </button>
        </div>
        <div v-if="openReplies[String(c._id || c.id)]" class="replies">
          <div v-if="repliesLoading[String(c._id || c.id)]" class="state"><i class="fa-solid fa-spinner fa-spin" /> Cargando respuestas...</div>
          <ul v-else class="replies-list" v-if="(replies[String(c._id || c.id)] || []).length">
            <li v-for="r in (replies[String(c._id || c.id)] || [])" :key="r._id || r.id" class="reply-item">
              <div class="meta">
                <span class="author"><i class="fa-solid fa-user" /> {{ authorName(r.user) }}</span>
                <span class="date">{{ new Date(String(r.createdAt)).toLocaleString() }}</span>
              </div>
              <p class="content">{{ r.content }}</p>
              <div class="actions">
                <button class="like" @click="toggleLike(r)">
                  <i :class="hasLiked(r) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
                  {{ (r.likes || []).length || 0 }}
                </button>
              </div>
            </li>
          </ul>
          <div class="reply-composer">
            <input class="reply-input" type="text" :placeholder="'Responder a ' + authorName(c.user)" v-model="replyText[String(c._id || c.id)]" />
            <button class="send" :disabled="!(replyText[String(c._id || c.id)] || '').trim()" @click="(async () => { const list = await submitReplyFor(String(c._id || c.id), userId); await resolveAuthors(list || []) })()">
              <i class="fa-solid fa-paper-plane" /> Enviar
            </button>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="empty"><i class="fa-regular fa-comment" /> Sé el primero en comentar.</div>
  </div>
</template>

<style lang="scss" scoped>
.comments {
  display: grid;
  gap: 20px;
}

.title {
  color: var(--text);
  font-size: 20px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.count {
  background: color-mix(in oklab, var(--bg), var(--text) 4%);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 500;
}

.state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: color-mix(in oklab, var(--text), transparent 40%);
  font-size: 14px;
}

.state.error {
  color: $alert-error;
}

/* Composer */
.composer {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.input {
  width: 100%;
  resize: vertical;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.5;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
}

.send {
  justify-self: end;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

/* List */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 24px;
}

.item {
  display: grid;
  gap: 12px;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: color-mix(in oklab, var(--text), transparent 50%);
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-weight: 600;
  font-size: 14px;

  i {
    color: color-mix(in oklab, var(--text), transparent 70%);
  }
}

.content {
  color: color-mix(in oklab, var(--text), transparent 10%);
  margin: 0;
  line-height: 1.6;
  font-size: 15px;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

.like,
.reply {
  background: none;
  border: none;
  color: color-mix(in oklab, var(--text), transparent 40%);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in oklab, var(--bg), var(--text) 4%);
    color: var(--text);
  }
}

.like {
  i.fa-solid {
    color: $alert-error;
  }
}

.reply .badge {
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
}

/* Replies */
.replies {
  margin-top: 12px;
  border-left: 2px solid color-mix(in oklab, var(--border), transparent 50%);
  margin-left: 12px;
  padding-left: 20px;
  display: grid;
  gap: 20px;
}

.replies-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.reply-item {
  background: color-mix(in oklab, var(--bg), var(--text) 1%);
  border-radius: 12px;
  padding: 12px 16px;
  display: grid;
  gap: 8px;
}

.reply-composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.reply-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
}

@media (max-width: 600px) {
  .comments {
    gap: 16px;
  }

  .title {
    font-size: 18px;
  }

  .reply-composer {
    grid-template-columns: 1fr;
  }

  .send {
    width: 100%;
    justify-content: center;
  }
}
</style>
