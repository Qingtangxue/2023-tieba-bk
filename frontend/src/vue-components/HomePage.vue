<template>
  <div class="home-page">
    <div class="hero-section">
      <h1>欢迎来到百度贴吧</h1>
      <p>发现你感兴趣的社区，与志同道合的人交流</p>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索贴吧、帖子或用户..."
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="btn btn-primary">搜索</button>
      </div>
    </div>

    <div class="content-section">
      <div class="posts-section">
        <h2>最新帖子</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="posts.length === 0" class="empty">暂无帖子</div>
        <div v-else class="posts-list">
          <div v-for="post in posts" :key="post.id" class="post-item card">
            <h3 class="post-title">
              <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
            </h3>
            <div class="post-meta">
              <span>作者: {{ post.author.username }}</span>
              <span>贴吧: {{ post.tieba.name }}</span>
              <span>时间: {{ formatTime(post.created_at) }}</span>
            </div>
            <p class="post-content">{{ post.content.substring(0, 200) }}...</p>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="card">
          <h3>热门贴吧</h3>
          <div v-if="hotTiebas.length === 0" class="empty">暂无热门贴吧</div>
          <div v-else class="tieba-list">
            <div v-for="tieba in hotTiebas" :key="tieba.id" class="tieba-item">
              <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
              <div class="tieba-info">
                <h4 class="tieba-name">{{ tieba.name }}</h4>
                <p class="tieba-desc">{{ tieba.description }}</p>
                <span class="member-count">{{ tieba.member_count }} 成员</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HomePage',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const posts = ref([])
    const hotTiebas = ref([])
    const loading = ref(true)

    const fetchPosts = async () => {
      // 模拟数据
      posts.value = [
        {
          id: 1,
          title: 'Vue3 组合式API使用心得',
          content: '最近在学习Vue3的组合式API，感觉比选项式API更加灵活和强大...',
          author: { username: '前端开发者' },
          tieba: { name: '前端开发' },
          created_at: '2023-10-15T10:30:00Z'
        },
        {
          id: 2,
          title: 'React Hooks 最佳实践',
          content: '分享一些React Hooks的使用技巧和最佳实践...',
          author: { username: 'React爱好者' },
          tieba: { name: '编程技术' },
          created_at: '2023-10-14T14:20:00Z'
        },
        {
          id: 3,
          title: 'JavaScript ES6+ 新特性总结',
          content: '整理了一些ES6及之后版本的新特性，包括箭头函数、解构赋值等...',
          author: { username: 'JavaScript学习者' },
          tieba: { name: '前端开发' },
          created_at: '2023-10-13T09:15:00Z'
        }
      ]
      loading.value = false
    }

    const fetchHotTiebas = async () => {
      // 模拟数据
      hotTiebas.value = [
        {
          id: 1,
          name: '前端开发',
          description: '前端技术交流社区',
          member_count: 1250
        },
        {
          id: 2,
          name: '编程技术',
          description: '编程技术讨论区',
          member_count: 890
        },
        {
          id: 3,
          name: '游戏讨论',
          description: '游戏爱好者聚集地',
          member_count: 2100
        },
        {
          id: 4,
          name: '电影娱乐',
          description: '电影、电视剧、综艺节目讨论区',
          member_count: 1500
        }
      ]
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    onMounted(() => {
      fetchPosts()
      fetchHotTiebas()
    })

    return {
      searchQuery,
      posts,
      hotTiebas,
      loading,
      handleSearch,
      formatTime
    }
  }
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: 1rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
}

.content-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.posts-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.post-title a {
  color: #007AFF;
  text-decoration: none;
}

.post-title a:hover {
  text-decoration: underline;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.post-content {
  color: #444;
  line-height: 1.6;
}

.sidebar .card {
  position: sticky;
  top: 2rem;
}

.tieba-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.tieba-item:last-child {
  border-bottom: none;
}

.tieba-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.tieba-name {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.tieba-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.member-count {
  color: #999;
  font-size: 0.8rem;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .content-section {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    flex-direction: column;
  }
}
</style>