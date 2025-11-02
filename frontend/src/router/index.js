import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../vue-components/HomePage.vue'
import LoginPage from '../vue-components/LoginPage.vue'
import RegisterPage from '../vue-components/RegisterPage.vue'
import TiebasPage from '../vue-components/TiebasPage.vue'
import PostsPage from '../vue-components/PostsPage.vue'
import PostDetail from '../vue-components/PostDetail.vue'
import ProfilePage from '../vue-components/ProfilePage.vue'
import AdminLayout from '../vue-components/admin/AdminLayout.vue'
import PostManagement from '../vue-components/admin/PostManagement.vue'
import TiebaManagement from '../vue-components/admin/TiebaManagement.vue'
import UserManagement from '../vue-components/admin/UserManagement.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/tiebas',
    name: 'Tiebas',
    component: TiebasPage
  },
  {
    path: '/tieba/:id/posts',
    name: 'Posts',
    component: PostsPage
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    redirect: '/admin/posts',
    children: [
      {
        path: 'posts',
        name: 'AdminPosts',
        component: PostManagement
      },
      {
        path: 'tiebas',
        name: 'AdminTiebas',
        component: TiebaManagement
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UserManagement
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router