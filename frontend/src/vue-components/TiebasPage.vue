<template>
  <div class="tiebas-page">
    <div class="container">
      <div class="page-header">
        <h1>贴吧列表</h1>
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索贴吧..." 
            class="search-input"
          />
          <button class="search-btn" @click="searchTiebas">搜索</button>
        </div>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>排序方式：</label>
          <select v-model="sortBy" @change="applyFilters">
            <option value="name">名称</option>
            <option value="memberCount">成员数</option>
            <option value="postCount">帖子数</option>
            <option value="createdAt">创建时间</option>
          </select>
        </div>
        <div class="filter-group">
          <label>排序方向：</label>
          <select v-model="sortOrder" @change="applyFilters">
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
        </div>
      </div>

      <div class="tiebas-grid">
        <div 
          v-for="tieba in filteredTiebas" 
          :key="tieba.id" 
          class="tieba-card"
        >
          <div class="tieba-header">
            <div class="tieba-avatar">{{ tieba.name.charAt(0) }}</div>
            <div class="tieba-info">
              <h3 class="tieba-name">{{ tieba.name }}</h3>
              <p class="tieba-desc">{{ tieba.description }}</p>
            </div>
          </div>
          
          <div class="tieba-stats">
            <div class="stat">
              <span class="stat-value">{{ tieba.memberCount }}</span>
              <span class="stat-label">成员</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ tieba.postCount }}</span>
              <span class="stat-label">帖子</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ tieba.todayPosts }}</span>
              <span class="stat-label">今日</span>
            </div>
          </div>

          <div class="tieba-actions">
            <button 
              v-if="!tieba.isFollowing" 
              class="btn btn-primary" 
              @click="followTieba(tieba.id)"
            >
              关注
            </button>
            <button 
              v-else 
              class="btn btn-secondary" 
              @click="unfollowTieba(tieba.id)"
            >
              已关注
            </button>
            <router-link 
              :to="`/tieba/${tieba.id}/posts`" 
              class="btn btn-outline"
            >
              进入贴吧
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="filteredTiebas.length === 0" class="empty-state">
        <p>没有找到相关的贴吧</p>
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
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'TiebasPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const searchQuery = ref('')
    const sortBy = ref('memberCount')
    const sortOrder = ref('desc')
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    
    // 模拟贴吧数据
    const tiebas = ref([
      {
        id: 1,
        name: '前端开发',
        description: '前端技术交流社区，分享HTML、CSS、JavaScript、Vue、React等前端技术',
        memberCount: 1250,
        postCount: 5600,
        todayPosts: 23,
        isFollowing: false
      },
      {
        id: 2,
        name: '编程技术',
        description: '编程技术讨论区，涵盖各种编程语言和开发技术',
        memberCount: 890,
        postCount: 3200,
        todayPosts: 15,
        isFollowing: true
      },
      {
        id: 3,
        name: '游戏讨论',
        description: '游戏爱好者聚集地，分享游戏攻略和心得',
        memberCount: 2100,
        postCount: 7800,
        todayPosts: 45,
        isFollowing: false
      },
      {
        id: 4,
        name: '电影娱乐',
        description: '电影、电视剧、综艺节目讨论区',
        memberCount: 1500,
        postCount: 4200,
        todayPosts: 18,
        isFollowing: false
      },
      {
        id: 5,
        name: '音乐分享',
        description: '音乐爱好者交流平台，分享好听的音乐',
        memberCount: 980,
        postCount: 2900,
        todayPosts: 12,
        isFollowing: false
      },
      {
        id: 6,
        name: '体育竞技',
        description: '体育赛事讨论，足球、篮球、网球等各类运动',
        memberCount: 1750,
        postCount: 5100,
        todayPosts: 28,
        isFollowing: false
      }
    ])
    
    const filteredTiebas = computed(() => {
      let filtered = tiebas.value
      
      // 搜索过滤
      if (searchQuery.value) {
        filtered = filtered.filter(tieba => 
          tieba.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          tieba.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      // 排序
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortBy.value]
        let bVal = b[sortBy.value]
        
        if (sortBy.value === 'name') {
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
      return Math.ceil(tiebas.value.length / itemsPerPage.value)
    })
    
    const searchTiebas = () => {
      currentPage.value = 1
      applyFilters()
    }
    
    const applyFilters = () => {
      // 过滤逻辑已经在computed中实现
    }
    
    const changePage = (page) => {
      currentPage.value = page
    }
    
    const followTieba = (tiebaId) => {
      const tieba = tiebas.value.find(t => t.id === tiebaId)
      if (tieba) {
        tieba.isFollowing = true
        tieba.memberCount += 1
        alert(`已关注贴吧：${tieba.name}`)
      }
    }
    
    const unfollowTieba = (tiebaId) => {
      const tieba = tiebas.value.find(t => t.id === tiebaId)
      if (tieba) {
        tieba.isFollowing = false
        tieba.memberCount -= 1
        alert(`已取消关注贴吧：${tieba.name}`)
      }
    }
    
    onMounted(() => {
      // 可以在这里加载真实数据
    })
    
    return {
      searchQuery,
      sortBy,
      sortOrder,
      currentPage,
      filteredTiebas,
      totalPages,
      searchTiebas,
      applyFilters,
      changePage,
      followTieba,
      unfollowTieba
    }
  }
})
</script>

<style scoped>
.tiebas-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 300px;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #FF6B35;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.tiebas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tieba-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tieba-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.tieba-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tieba-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF8E53 0%, #FE6B8B 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.tieba-info {
  flex: 1;
}

.tieba-name {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.tieba-desc {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.tieba-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #FF6B35;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.tieba-actions {
  display: flex;
  gap: 0.5rem;
}

.tieba-actions .btn {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
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

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #FF6B35;
  color: white;
  border-color: #FF6B35;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tiebas-grid {
    grid-template-columns: 1fr;
  }
  
  .tieba-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tieba-actions {
    flex-direction: column;
  }
}
</style>