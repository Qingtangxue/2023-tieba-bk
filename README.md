# 百度贴吧毕业设计项目

这是一个基于Veaury(Vue+React混合框架)和Django的百度贴吧仿制项目。

## 技术栈

### 前端
- **Veaury**: Vue + React 混合编程框架
- **Vue 3**: 现代化前端框架
- **React 18**: 用户界面库
- **Vite**: 快速构建工具
- **Ant Design**: UI组件库

### 后端
- **Django 4.2**: Python Web框架
- **Django REST Framework**: API框架
- **MySQL 8.0**: 数据库
- **Redis**: 缓存

## 项目结构

```
project/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── vue-components/    # Vue组件
│   │   ├── react-components/   # React组件
│   │   ├── pages/             # 混合页面
│   │   └── main.js            # 应用入口
│   ├── package.json
│   └── vite.config.js
├── backend/           # 后端项目
│   ├── tieba/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/           # 用户管理
│   │   ├── tiebas/          # 贴吧管理
│   │   └── posts/           # 帖子管理
│   └── manage.py
└── docs/              # 项目文档
    ├── 需求文档建立.docx
    ├── 项目文档.md
    └── 页面原型.html
```

## 快速开始

### 1. 安装依赖

```bash
# 前端依赖
cd frontend
npm install

# 后端依赖
cd ../backend
pip install -r requirements.txt
```

### 2. 配置数据库

创建MySQL数据库并配置backend/tieba/settings.py中的数据库连接。

### 3. 运行项目

```bash
# 启动后端服务
cd backend
python manage.py migrate
python manage.py runserver

# 启动前端服务
cd ../frontend
npm run dev
```

访问 http://localhost:3000 查看应用。

## 功能特性

- ✅ 用户注册登录
- ✅ 贴吧创建和管理
- ✅ 帖子发布和浏览
- ✅ 评论和回复
- ✅ 点赞和收藏
- ✅ 搜索功能
- ✅ 消息通知

## 开发团队

- 项目文档：Qingtangxue
- 代码实现：AI助手

## 许可证

MIT License