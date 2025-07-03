# maimai-js

我希望实现一个类似midway.js的全栈框架，核心是基于ioc的sdk，类型安全，服务端基于serverless。前端引用这个sdk，就是直接导入可以发送请求的函数，后端导入，就是需要实现的类型

## 🎯 核心理念

**一套 SDK，两端复用**：

- **前端**：导入 SDK → 获得类型安全的请求函数
- **后端**：导入 SDK → 获得需要实现的接口类型
- **IoC 驱动**：基于依赖注入的服务管理
- **类型安全**：端到端的 TypeScript 类型保障

## 🏗️ 技术栈

### 核心框架

- **IoC 容器**: `tsyringe` - 轻量级依赖注入
- **前端**: `Vite + React + TypeScript`
- **后端**: `Hono + TypeScript` (Serverless Ready)
- **包管理**: `pnpm` (Monorepo)

### 开发工具

- **构建工具**: `Vite` (前端) + `tsup` (SDK)
- **代码规范**: `ESLint + Prettier`
- **类型检查**: `TypeScript 5.0+`
- **测试框架**: `Vitest`

## 📦 项目结构

```
maimai-js/
├── packages/
│   ├── core/           # 核心 SDK - 接口定义与装饰器
│   ├── client/         # 客户端 SDK - HTTP 请求封装
│   ├── server/         # 服务端 SDK - Hono 集成
│   └── types/          # 共享类型定义
├── examples/
│   ├── frontend/       # 前端示例 (Vite + React)
│   ├── backend/        # 后端示例 (Hono)
│   └── shared/         # 共享业务逻辑
├── docs/              # 文档
└── tools/             # 开发工具
```

## 🎨 设计模式

### 1. 服务定义 (@maimai/core)

```typescript
// 定义服务接口
@Injectable()
export abstract class UserService {
  @Get('/api/users/:id')
  abstract getUser(id: string): Promise<User>

  @Post('/api/users')
  abstract createUser(data: CreateUserDto): Promise<User>
}
```

### 2. 前端使用 (@maimai/client)

```typescript
// 前端直接调用
import { createClient } from "@maimai/client";
import { UserService } from "./shared/services";

const client = createClient<UserService>({
  baseURL: "https://api.example.com",
});

// 类型安全的调用
const user = await client.getUser("123"); // 自动推断返回类型
```

### 3. 后端实现 (@maimai/server)

```typescript
// 后端实现接口
@Injectable()
export class UserServiceImpl extends UserService {
  constructor(@inject(UserRepository) private userRepo: UserRepository) {
    super();
  }

  async getUser(id: string): Promise<User> {
    return this.userRepo.findById(id);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.userRepo.create(data);
  }
}
```

## 🚀 核心特性

### ✨ 类型安全

- 端到端 TypeScript 类型推断
- 编译时接口契约验证
- 自动生成客户端类型

### 🔄 IoC 驱动

- 基于装饰器的依赖注入
- 服务生命周期管理
- 插件化扩展机制

### ⚡ Serverless First

- Hono 轻量级运行时
- 支持多种部署平台
- 冷启动优化

### 🎯 开发体验

- 零配置开箱即用
- 热重载开发模式
- 统一的错误处理

## 📋 实现计划

### Phase 1: 核心 SDK

- [ ] `@maimai/core` - 装饰器与接口定义
- [ ] `@maimai/client` - HTTP 客户端封装
- [ ] `@maimai/server` - Hono 集成

### Phase 2: 开发工具

- [ ] CLI 工具 - 项目脚手架
- [ ] 代码生成 - 自动生成客户端
- [ ] 开发服务器 - 热重载支持

### Phase 3: 生态完善

- [ ] 插件系统 - 中间件扩展
- [ ] 文档站点 - 使用指南
- [ ] 示例项目 - 最佳实践

## 🛠️ 快速开始

```bash
# 安装脚手架
pnpm add -g @maimai/cli

# 创建项目
maimai create my-app --template=fullstack

# 启动开发
cd my-app
pnpm dev
```

## 📚 核心包说明

### @maimai/core

- 服务接口定义
- IoC 装饰器 (`@Injectable`, `@Get`, `@Post` 等)
- 类型工具函数

### @maimai/client

- HTTP 客户端生成器
- 请求/响应拦截器
- 错误处理机制

### @maimai/server

- Hono 应用集成
- IoC 容器初始化
- 路由自动注册

## 🎪 使用示例

完整的端到端示例：

```typescript
// shared/services/user.service.ts
import { Injectable, Get, Post } from '@maimai/core'

@Injectable()
export abstract class UserService {
  @Get('/users/:id')
  abstract getUser(id: string): Promise<User>

  @Post('/users')
  abstract createUser(user: CreateUserDto): Promise<User>
}

// frontend/src/api/index.ts
import { createClient } from '@maimai/client'
import { UserService } from '../../shared/services'

export const api = createClient<UserService>({
  baseURL: process.env.VITE_API_URL
})

// frontend/src/components/UserProfile.tsx
import { api } from '../api'

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    api.getUser(userId).then(setUser)  // 类型安全！
  }, [userId])

  return <div>{user?.name}</div>
}

// backend/src/services/user.service.impl.ts
import { injectable, inject } from 'tsyringe'
import { UserService } from '../../shared/services'

@injectable()
export class UserServiceImpl extends UserService {
  constructor(
    @inject('UserRepository') private userRepo: UserRepository
  ) {
    super()
  }

  async getUser(id: string): Promise<User> {
    return this.userRepo.findById(id)
  }

  async createUser(user: CreateUserDto): Promise<User> {
    return this.userRepo.create(user)
  }
}

// backend/src/app.ts
import { Hono } from 'hono'
import { createApp } from '@maimai/server'
import { UserServiceImpl } from './services'

const app = createApp(new Hono())

app.registerService(UserServiceImpl)

export default app
```

这个方案的核心优势是**类型安全的全栈开发**，前端调用后端接口就像调用本地函数一样简单，同时保持了完整的类型检查和 IoC 的灵活性。
