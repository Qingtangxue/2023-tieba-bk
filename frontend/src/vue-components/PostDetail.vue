<template>
  <div class="post-detail">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-section">
        <button class="back-btn" @click="goBack">
          ← 返回帖子列表
        </button>
      </div>

      <!-- 帖子内容 -->
      <div class="post-content">
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <div class="author-info">
              <div class="author-avatar">{{ post.author.charAt(0) }}</div>
              <div class="author-details">
                <span class="author-name">{{ post.author }}</span>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
            </div>
            <div class="post-stats">
              <span class="stat">{{ post.views }} 浏览</span>
              <span class="stat">{{ post.likes }} 赞</span>
              <span class="stat">{{ post.comments }} 评论</span>
            </div>
          </div>
        </div>

        <div class="post-body">
          <div class="post-text">
            {{ post.content }}
          </div>
          
          <div class="post-actions">
            <button 
              class="btn btn-primary" 
              :class="{ 'btn-secondary': post.isLiked }"
              @click="toggleLike"
            >
              {{ post.isLiked ? '已赞' : '点赞' }} ({{ post.likes }})
            </button>
            <button 
              class="btn btn-outline" 
              @click="showCommentInput = !showCommentInput"
            >
              评论 ({{ post.comments }})
            </button>
            <button 
              v-if="post.author === userStore.user?.username" 
              class="btn btn-warning" 
              @click="editPost"
            >
              编辑
            </button>
            <button 
              v-if="post.author === userStore.user?.username" 
              class="btn btn-danger" 
              @click="deletePost"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 评论输入框 -->
        <div v-if="showCommentInput" class="comment-input-section">
          <h3>发表评论</h3>
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              placeholder="请输入评论内容..." 
              rows="4"
              class="comment-textarea"
            ></textarea>
            <div class="comment-actions">
              <button 
                class="btn btn-secondary" 
                @click="showCommentInput = false"
              >
                取消
              </button>
              <button 
                class="btn btn-primary" 
                @click="submitComment"
                :disabled="!newComment.trim()"
              >
                发表评论
              </button>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-section">
          <h3>评论 ({{ comments.length }})</h3>
          <div v-if="comments.length === 0" class="no-comments">
            <p>还没有评论，快来发表第一条评论吧！</p>
          </div>
          <div v-else class="comments-list">
            <div 
              v-for="comment in comments" 
              :key="comment.id" 
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-author">
                  <div class="author-avatar">{{ comment.author.charAt(0) }}</div>
                  <div class="author-details">
                    <span class="author-name">{{ comment.author }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                </div>
                <div 
                  v-if="comment.author === userStore.user?.username" 
                  class="comment-actions"
                >
                  <button 
                    class="btn btn-sm btn-warning" 
                    @click="editComment(comment)"
                  >
                    编辑
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="deleteComment(comment.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
              <div class="comment-footer">
                <button 
                  class="btn btn-sm btn-outline" 
                  @click="toggleCommentLike(comment.id)"
                >
                  {{ comment.isLiked ? '取消赞' : '赞' }} ({{ comment.likes }})
                </button>
                <button 
                  class="btn btn-sm btn-outline" 
                  @click="replyToComment(comment)"
                >
                  回复
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑帖子模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑帖子</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updatePost">
            <div class="form-group">
              <label>帖子标题</label>
              <input 
                type="text" 
                v-model="editForm.title" 
                required
              />
            </div>
            <div class="form-group">
              <label>帖子内容</label>
              <textarea 
                v-model="editForm.content" 
                rows="6" 
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showEditModal = false" class="btn btn-secondary">
                取消
              </button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'PostDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const showCommentInput = ref(false)
    const showEditModal = ref(false)
    const newComment = ref('')
    
    const post = reactive({
      id: parseInt(route.params.id),
      title: 'Vue3 组合式API使用心得',
      content: '最近在学习Vue3的组合式API，感觉比选项式API更加灵活和强大。组合式API让我们能够更好地组织代码逻辑，特别是对于复杂的组件来说。\n\n主要优点包括：\n1. 更好的逻辑复用\n2. 更灵活的类型推导\n3. 更好的Tree-shaking支持\n4. 更清晰的代码组织',
      author: '前端开发者',
      tiebaId: 1,
      createdAt: '2023-10-15T10:30:00Z',
      views: 156,
      likes: 23,
      comments: 8,
      isLiked: false
    })
    
    const editForm = reactive({
      title: '',
      content: ''
    })
    
    const comments = ref([
      {
        id: 1,
        postId: 1,
        author: 'React爱好者',
        content: '写得很好！Vue3的组合式API确实比React Hooks更加直观和易用。',
        createdAt: '2023-10-15T11:00:00Z',
        likes: 5,
        isLiked: false
      },
      {
        id: 2,
        postId: 1,
        author: 'JavaScript学习者',
        content: '感谢分享！请问有没有推荐的学习资源？',
        createdAt: '2023-10-15T12:30:00Z',
        likes: 3,
        isLiked: true
      },
      {
        id: 3,
        postId: 1,
        author: 'Vue开发者',
        content: '组合式API配合TypeScript使用体验非常好！',
        createdAt: '2023-10-15T14:15:00Z',
        likes: 8,
        isLiked: false
      }
    ])
    
    const goBack = () => {
      router.back()
    }
    
    const toggleLike = () => {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
    }
    
    const submitComment = () => {
      if (!userStore.user) {
        alert('请先登录')
        router.push('/login')
        return
      }
      
      if (!newComment.value.trim()) {
        alert('请输入评论内容')
        return
      }
      
      const comment = {
        id: Math.max(...comments.value.map(c => c.id)) + 1,
        postId: post.id,
        author: userStore.user.username,
        content: newComment.value,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      }
      
      comments.value.push(comment)
      post.comments += 1
      newComment.value = ''
      showCommentInput.value = false
    }
    
    const toggleCommentLike = (commentId) => {
      const comment = comments.value.find(c => c.id === commentId)
      if (comment) {
        comment.isLiked = !comment.isLiked
        comment.likes += comment.isLiked ? 1 : -1
      }
    }
    
    const editComment = (comment) => {
      alert(`编辑评论: ${comment.content}`)
    }
    
    const deleteComment = (commentId) => {
      if (confirm('确定要删除这条评论吗？')) {
        comments.value = comments.value.filter(c => c.id !== commentId)
        post.comments -= 1
      }
    }
    
    const replyToComment = (comment) => {
      newComment.value = `回复 @${comment.author}: `
      showCommentInput.value = true
    }
    
    const editPost = () => {
      editForm.title = post.title
      editForm.content = post.content
      showEditModal.value = true
    }
    
    const updatePost = () => {
      post.title = editForm.title
      post.content = editForm.content
      showEditModal.value = false
      alert('帖子更新成功！')
    }
    
    const deletePost = () => {
      if (confirm('确定要删除这个帖子吗？')) {
        router.push(`/tieba/${post.tiebaId}/posts`)
        alert('帖子删除成功！')
      }
    }
    
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString('zh-CN')
    }
    
    onMounted(() => {
      // 模拟增加浏览量
      post.views += 1
      
      // 这里可以调用API加载帖子详情和评论
      const postId = parseInt(route.params.id)
      console.log('加载帖子详情:', postId)
    })
    
    return {
      post,
      comments,
      showCommentInput,
      showEditModal,
      newComment,
      editForm,
      userStore,
      goBack,
      toggleLike,
      submitComment,
      toggleCommentLike,
      editComment,
      deleteComment,
      replyToComment,
      editPost,
      updatePost,
      deletePost,
      formatTime
    }
  }
})
</script>

<style scoped>
.post-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.back-section {
  margin-bottom: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #007AFF;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.post-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.post-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e8e8e8;
}

.post-title {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.8rem;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.post-time, .comment-time {
  font-size: 0.9rem;
  color: #666;
}

.post-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  color: #666;
  font-size: 0.9rem;
}

.post-body {
  margin-bottom: 2rem;
}

.post-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e8e8e8;
}

.comment-input-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.comment-input-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.comment-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.comments-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-author .author-avatar {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
}

.comment-footer {
  display: flex;
  gap: 1rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-content {
    padding: 1.5rem;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .post-stats {
    align-self: stretch;
    justify-content: space-around;
  }
  
  .post-actions {
    flex-wrap: wrap;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .comment-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>