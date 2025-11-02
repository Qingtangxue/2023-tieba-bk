<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <h2>注册百度贴吧</h2>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input 
              id="username"
              v-model="form.username" 
              type="text" 
              required
              placeholder="请输入用户名（2-20个字符）"
              minlength="2"
              maxlength="20"
            />
            <div v-if="errors.username" class="field-error">{{ errors.username }}</div>
          </div>
          
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input 
              id="email"
              v-model="form.email" 
              type="email" 
              required
              placeholder="请输入邮箱地址"
            />
            <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input 
              id="password"
              v-model="form.password" 
              type="password" 
              required
              placeholder="请输入密码（至少6位）"
              minlength="6"
            />
            <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input 
              id="confirmPassword"
              v-model="form.confirmPassword" 
              type="password" 
              required
              placeholder="请再次输入密码"
            />
            <div v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</div>
          </div>
          
          <div class="form-group">
            <label for="nickname">昵称（可选）</label>
            <input 
              id="nickname"
              v-model="form.nickname" 
              type="text" 
              placeholder="请输入昵称"
              maxlength="30"
            />
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreeTerms" required />
              <span>我已阅读并同意</span>
              <a href="#" class="terms-link">《百度贴吧用户协议》</a>
              <span>和</span>
              <a href="#" class="terms-link">《隐私政策》</a>
            </label>
            <div v-if="errors.agreeTerms" class="field-error">{{ errors.agreeTerms }}</div>
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>
        
        <div class="register-footer">
          <p>已有账号？ <router-link to="/login">立即登录</router-link></p>
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
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      agreeTerms: false
    })
    
    const errors = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: ''
    })
    
    const loading = ref(false)
    const error = ref('')

    const validateForm = () => {
      // 重置错误信息
      Object.keys(errors).forEach(key => {
        errors[key] = ''
      })
      error.value = ''
      
      let isValid = true
      
      // 用户名验证
      if (!form.username.trim()) {
        errors.username = '请输入用户名'
        isValid = false
      } else if (form.username.length < 2 || form.username.length > 20) {
        errors.username = '用户名长度应为2-20个字符'
        isValid = false
      } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(form.username)) {
        errors.username = '用户名只能包含中文、字母、数字和下划线'
        isValid = false
      }
      
      // 邮箱验证
      if (!form.email.trim()) {
        errors.email = '请输入邮箱地址'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      // 密码验证
      if (!form.password) {
        errors.password = '请输入密码'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = '密码长度至少6位'
        isValid = false
      }
      
      // 确认密码验证
      if (!form.confirmPassword) {
        errors.confirmPassword = '请确认密码'
        isValid = false
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      // 协议同意验证
      if (!form.agreeTerms) {
        errors.agreeTerms = '请同意用户协议和隐私政策'
        isValid = false
      }
      
      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        const result = await userStore.register({
          username: form.username,
          email: form.email,
          password: form.password,
          nickname: form.nickname || form.username
        })
        
        if (result.success) {
          // 注册成功，跳转到登录页面
          router.push('/login?registered=true')
        } else {
          error.value = result.error || '注册失败，请稍后重试'
        }
      } catch (err) {
        error.value = '注册过程中发生错误，请稍后重试'
        console.error('注册错误:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      error,
      handleRegister
    }
  }
})
</script>

<style scoped>
.register-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}

.register-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.register-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.field-error {
  color: #ff4757;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.terms-link {
  color: #007AFF;
  text-decoration: none;
  margin: 0 0.25rem;
}

.terms-link:hover {
  text-decoration: underline;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.register-form button {
  width: 100%;
  padding: 0.875rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  margin-top: 1rem;
}

.register-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  color: #666;
}

.register-footer a {
  color: #007AFF;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-card {
    padding: 2rem 1.5rem;
  }
  
  .register-card h2 {
    font-size: 1.5rem;
  }
  
  .checkbox-label {
    flex-wrap: wrap;
  }
  
  .terms-link {
    margin: 0.125rem 0.25rem;
  }
}
</style>