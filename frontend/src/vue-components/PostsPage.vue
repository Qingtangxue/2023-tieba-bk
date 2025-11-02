<template>
  <div class="posts-page">
    <div class="container">
      <!-- 贴吧头部信息 -->
      <div class="tieba-header">
        <div class="tieba-info">
          <div class="tieba-avatar">{{ currentTieba.name.charAt(0) }}</div>
          <div class="tieba-details">
            <h1>{{ currentTieba.name }}</h1>
            <p class="tieba-description">{{ currentTieba.description }}</p>
            <div class="tieba-stats">
              <span>{{ currentTieba.memberCount }} 成员</span>
              <span>{{ currentTieba.postCount }} 帖子</span>
              <span>{{ currentTieba.todayPosts }} 今日</span>
            </div>
          </div>
        </div>
        <div class="tieba-actions">
          <button 
            v-if="!currentTieba.isFollowing" 
            class="btn btn-primary" 
            @click="followTieba"
          >
            关注
          </button>
          <button 
            v-else 
            class="btn btn-secondary" 
            @click="unfollowTieba"
          >
            已关注
          </button>
          <button class="btn btn-primary" @click="showCreatePostModal = true">
            发帖
          </button>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-section">
        <div class="posts-header">
          <h2>帖子列表</h2>
          <div class="posts-filters">
            <div class="search-bar">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索帖子..." 
                class="search-input"
              />
              <button class="search-btn" @click="searchPosts">搜索</button>
            </div>
            <div class="filter-group">
              <label>排序：</label>
              <select v-model="sortBy" @change="applyFilters">
                <option value="createdAt">最新</option>
                <option value="views">热门</option>
                <option value="likes">点赞</option>
                <option value="comments">评论</option>
              </select>
            </div>
          </div>
        </div>

        <div class="posts-list">
          <div 
            v-for="post in filteredPosts" 
            :key="post.id" 
            class="post-item"
          >
            <div class="post-header">
              <div class="post-author">
                <div class="author-avatar">{{ post.author.charAt(0) }}</div>
                <div class="author-info">
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
            
            <div class="post-content">
              <h3 class="post-title">
                <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
              </h3>
              <p class="post-excerpt">{{ post.content }}</p>
            </div>
            
            <div class="post-actions">
              <button 
                class="btn btn-sm btn-outline" 
                :class="{ 'btn-primary': post.isLiked }"
                @click="toggleLike(post.id)"
              >
                {{ post.isLiked ? '已赞' : '点赞' }} ({{ post.likes }})
              </button>
              <button class="btn btn-sm btn-outline" @click="viewPost(post.id)">
                查看详情
              </button>
              <button 
                v-if="post.author === userStore.user?.username" 
                class="btn btn-sm btn-warning" 
                @click="editPost(post)"
              >
                编辑
              </button>
              <button 
                v-if="post.author === userStore.user?.username" 
                class="btn btn-sm btn-danger" 
                @click="deletePost(post.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredPosts.length === 0" class="empty-state">
          <p>还没有帖子，快来发布第一个帖子吧！</p>
          <button class="btn btn-primary" @click="showCreatePostModal = true">
            发布帖子
          </button>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
            class="pagination-btn"
          >
            上一页
          </button>
          <span class="pagination-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
            class="pagination-btn"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 发帖模态框 -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click="showCreatePostModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>发布新帖子</h3>
          <button class="close-btn" @click="showCreatePostModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createPost">
            <div class="form-group">
              <label>帖子标题</label>
              <input 
                type="text" 
                v-model="newPost.title" 
                placeholder="请输入帖子标题"
                required
              />
            </div>
            <div class="form-group">
              <label>帖子内容</label>
              <textarea 
                v-model="newPost.content" 
                rows="6" 
                placeholder="请输入帖子内容"
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreatePostModal = false" class="btn btn-secondary">
                取消
              </button>
              <button type="submit" class="btn btn-primary">发布</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'PostsPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const searchQuery = ref('')
    const sortBy = ref('createdAt')
    const sortOrder = ref('desc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const showCreatePostModal = ref(false)
    
    const newPost = ref({
      title: '',
      content: ''
    })
    
    // 模拟当前贴吧数据
    const currentTieba = ref({
      id: parseInt(route.params.id),
      name: '前端开发',
      description: '前端技术交流社区，分享HTML、CSS、JavaScript、Vue、React等前端技术',
      memberCount: 1250,
      postCount: 5600,
      todayPosts: 23,
      isFollowing: false
    })
    
    // 模拟帖子数据
    const posts = ref([
      {
        id: 1,
        title: 'Vue3 组合式API使用心得',
        content: '最近在学习Vue3的组合式API，感觉比选项式API更加灵活和强大...',
        author: '前端开发者',
        tiebaId: 1,
        createdAt: '2023-10-15T10:30:00Z',
        views: 156,
        likes: 23,
        comments: 8,
        isLiked: false
      },
      {
        id: 2,
        title: 'React Hooks 最佳实践',
        content: '分享一些React Hooks的使用技巧和最佳实践...',
        author: 'React爱好者',
        tiebaId: 1,
        createdAt: '2023-10-14T14:20:00Z',
        views: 89,
        likes: 15,
        comments: 5,
        isLiked: true
      },
      {
        id: 3,
        title: 'JavaScript ES6+ 新特性总结',
        content: '整理了一些ES6及之后版本的新特性，包括箭头函数、解构赋值等...',
        author: 'JavaScript学习者',
        tiebaId: 1,
        createdAt: '2023-10-13T09:15:00Z',
        views: 234,
        likes: 45,
        comments: 12,
        isLiked: false
      }
    ])
    
    const filteredPosts = computed(() => {
      let filtered = posts.value.filter(post => post.tiebaId === currentTieba.value.id)
      
      // 搜索过滤
      if (searchQuery.value) {
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      // 排序
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortBy.value]
        let bVal = b[sortBy.value]
        
        if (sortBy.value === 'title') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortOrder.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      // 分页
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      return filtered.slice(startIndex, startIndex + itemsPerPage.value)
    })
    
    const totalPages = computed(() => {
      const filtered = posts.value.filter(post => post.tiebaId === currentTieba.value.id)
      return Math.ceil(filtered.length / itemsPerPage.value)
    })
    
    const searchPosts = () => {
      currentPage.value = 1
    }
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const changePage = (page) => {
      currentPage.value = page
    }
    
    const followTieba = () => {
      currentTieba.value.isFollowing = true
      currentTieba.value.memberCount += 1
      alert(`已关注贴吧：${currentTieba.value.name}`)
    }
    
    const unfollowTieba = () => {
      currentTieba.value.isFollowing = false
      currentTieba.value.memberCount -= 1
      alert(`已取消关注贴吧：${currentTieba.value.name}`)
    }
    
    const toggleLike = (postId) => {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }
    }
    
    const viewPost = (postId) => {
      router.push(`/post/${postId}`)
    }
    
    const editPost = (post) => {
      alert(`编辑帖子: ${post.title}`)
    }
    
    const deletePost = (postId) => {
      if (confirm('确定要删除这个帖子吗？')) {
        posts.value = posts.value.filter(post => post.id !== postId)
        currentTieba.value.postCount -= 1
      }
    }
    
    const createPost = () => {
      if (!userStore.user) {
        alert('请先登录')
        router.push('/login')
        return
      }
      
      const newPostData = {
        id: Math.max(...posts.value.map(p => p.id)) + 1,
        title: newPost.value.title,
        content: newPost.value.content,
        author: userStore.user.username,
        tiebaId: currentTieba.value.id,
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        isLiked: false
      }
      
      posts.value.unshift(newPostData)
      currentTieba.value.postCount += 1
      currentTieba.value.todayPosts += 1
      
      newPost.value.title = ''
      newPost.value.content = ''
      showCreatePostModal.value = false
      
      alert('帖子发布成功！')
    }
    
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString('zh-CN')
    }
    
    onMounted(() => {
      // 可以根据路由参数加载对应的贴吧数据
      const tiebaId = parseInt(route.params.id)
      // 这里可以调用API加载贴吧信息和帖子列表
    })
    
    return {
      searchQuery,
      sortBy,
      currentPage,
      showCreatePostModal,
      newPost,
      currentTieba,
      filteredPosts,
      totalPages,
      userStore,
      searchPosts,
      applyFilters,
      changePage,
      followTieba,
      unfollowTieba,
      toggleLike,
      viewPost,
      editPost,
      deletePost,
      createPost,
      formatTime
    }
  }
})
</script>

<style scoped>
.posts-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.tieba-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tieba-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.tieba-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.tieba-details h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.tieba-description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.tieba-stats {
  display: flex;
  gap: 1.5rem;
}

.tieba-stats span {
  color: #666;
  font-size: 0.9rem;
}

.tieba-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.posts-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.posts-header h2 {
  margin: 0;
  color: #333;
}

.posts-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 250px;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.post-item:hover {
  border-color: #007AFF;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.post-time {
  font-size: 0.8rem;
  color: #666;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.8rem;
  color: #666;
}

.post-content {
  margin-bottom: 1rem;
}

.post-title {
  margin: 0 0 0.5rem 0;
}

.post-title a {
  color: #333;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
}

.post-title a:hover {
  color: #007AFF;
}

.post-excerpt {
  margin: 0;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tieba-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .tieba-info {
    flex-direction: column;
    text-align: center;
  }
  
  .tieba-stats {
    justify-content: center;
  }
  
  .tieba-actions {
    justify-content: center;
    width: 100%;
  }
  
  .posts-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .posts-filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .post-actions {
    flex-wrap: wrap;
  }
}
</style>