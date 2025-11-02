<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h2>登录百度贴吧</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              id="username"
              v-model="form.username" 
              type="text" 
              required
              placeholder="请输入用户名"
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input 
              id="password"
              v-model="form.password" 
              type="password" 
              required
              placeholder="请输入密码"
            />
          </div>
          
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="form.rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="showForgotPassword">忘记密码？</a>
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <div class="login-footer">
          <p>还没有账号？ <router-link to="/register">立即注册</router-link></p>
        </div>

        <!-- 忘记密码模态框 -->
        <div v-if="showForgotPasswordModal" class="modal-overlay" @click="showForgotPasswordModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>找回密码</h3>
              <button class="close-btn" @click="showForgotPasswordModal = false">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleForgotPassword">
                <div class="form-group">
                  <label>请输入您的邮箱地址</label>
                  <input 
                    type="email" 
                    v-model="forgotPasswordEmail" 
                    required
                    placeholder="请输入注册时使用的邮箱"
                  />
                </div>
                <div class="form-actions">
                  <button type="button" @click="showForgotPasswordModal = false" class="btn btn-secondary">取消</button>
                  <button type="submit" class="btn btn-primary">发送重置邮件</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
      username: '',
      password: '',
      rememberMe: false
    })
    
    const loading = ref(false)
    const error = ref('')
    const showForgotPasswordModal = ref(false)
    const forgotPasswordEmail = ref('')

    const handleLogin = async () => {
      if (!form.username || !form.password) {
        error.value = '请输入用户名和密码'
        return
      }
      
      loading.value = true
      error.value = ''
      
      const result = await userStore.login(form)
      
      if (result.success) {
        router.push('/')
      } else {
        error.value = result.error || '登录失败'
      }
      
      loading.value = false
    }

    const showForgotPassword = () => {
      showForgotPasswordModal.value = true
      forgotPasswordEmail.value = ''
    }

    const handleForgotPassword = async () => {
      if (!forgotPasswordEmail.value) {
        error.value = '请输入邮箱地址'
        return
      }
      
      try {
        // 模拟发送重置邮件
        alert(`重置密码邮件已发送到: ${forgotPasswordEmail.value}`)
        showForgotPasswordModal.value = false
        error.value = ''
      } catch (err) {
        error.value = '发送重置邮件失败，请稍后重试'
      }
    }

    return {
      form,
      loading,
      error,
      showForgotPasswordModal,
      forgotPasswordEmail,
      handleLogin,
      showForgotPassword,
      handleForgotPassword
    }
  }
})
</script>

<style scoped>
.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007AFF;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

.login-form button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.remember-me input {
  width: auto;
  margin-right: 0.5rem;
}

.forgot-password {
  color: #007AFF;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

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
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
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
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.login-footer a {
  color: #007AFF;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>