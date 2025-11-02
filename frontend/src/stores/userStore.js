import { create } from 'zustand'

const useUserStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  setUser: (userData) => set({ user: userData }),
  
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  
  login: async (credentials) => {
    // 模拟登录逻辑
    if (credentials.username && credentials.password) {
      const mockUser = {
        id: 1,
        username: credentials.username,
        nickname: credentials.username,
        email: credentials.username + '@example.com',
        avatar: null
      }
      const mockToken = 'mock_token_' + Date.now()
      
      get().setToken(mockToken)
      get().setUser(mockUser)
      return { success: true }
    } else {
      return { success: false, error: '用户名和密码不能为空' }
    }
  },
  
  register: async (userData) => {
    // 模拟注册逻辑
    if (userData.username && userData.email && userData.password) {
      const mockUser = {
        id: Date.now(),
        username: userData.username,
        nickname: userData.nickname || userData.username,
        email: userData.email,
        avatar: null
      }
      const mockToken = 'mock_token_' + Date.now()
      
      get().setToken(mockToken)
      get().setUser(mockUser)
      return { success: true }
    } else {
      return { success: false, error: '请填写完整的注册信息' }
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  
  checkAuth: async () => {
    const token = get().token
    if (!token) return false
    
    // 模拟认证检查
    const mockUser = {
      id: 1,
      username: 'demo_user',
      nickname: '演示用户',
      email: 'demo@example.com',
      avatar: null
    }
    
    set({ user: mockUser })
    return true
  }
}))

export { useUserStore }