// Framework Core Types
export interface MaimaiConfig {
  server?: ServerConfig
  plugins?: PluginConfig[]
  logger?: LoggerConfig
}

export interface ServerConfig {
  port?: number
  host?: string
  cors?: CorsConfig
  middleware?: MiddlewareConfig[]
}

export interface CorsConfig {
  origin?: string | string[] | boolean
  credentials?: boolean
  methods?: string[]
  headers?: string[]
}

export interface MiddlewareConfig {
  name: string
  options?: Record<string, any>
}

export interface PluginConfig {
  name: string
  options?: Record<string, any>
  enabled?: boolean
}

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error'
  format?: 'json' | 'text'
  output?: 'console' | 'file'
}

// Controller and Route Types
export interface RouteHandler {
  (context: Context): Promise<any> | any
}

export interface Context {
  request: Request
  response: Response
  params: Record<string, string>
  query: Record<string, string>
  body: any
  headers: Record<string, string>
  method: string
  url: string
  path: string
}

export interface Request {
  method: string
  url: string
  headers: Record<string, string>
  body: any
  params: Record<string, string>
  query: Record<string, string>
}

export interface Response {
  status: (code: number) => Response
  json: (data: any) => Response
  text: (data: string) => Response
  send: (data: any) => Response
  header: (name: string, value: string) => Response
}

// Decorator Types
export interface ControllerMetadata {
  path: string
  middlewares?: string[]
}

export interface RouteMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  middlewares?: string[]
}

export interface MiddlewareMetadata {
  name: string
  order?: number
}

// Plugin System Types
export interface Plugin {
  name: string
  version: string
  install: (app: MaimaiApp) => Promise<void> | void
  uninstall?: (app: MaimaiApp) => Promise<void> | void
}

export interface MaimaiApp {
  config: MaimaiConfig
  plugins: Map<string, Plugin>
  routes: Map<string, RouteHandler>
  middlewares: Map<string, MiddlewareHandler>
  use: (plugin: Plugin) => void
  route: (method: string, path: string, handler: RouteHandler) => void
  listen: (port?: number) => Promise<void>
}

export interface MiddlewareHandler {
  (context: Context, next: () => Promise<void>): Promise<void> | void
}

// Utility Types
export type Constructor<T = {}> = new (...args: any[]) => T

export type Awaitable<T> = T | Promise<T>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Error Types
export class MaimaiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'MaimaiError'
  }
}

export class ValidationError extends MaimaiError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends MaimaiError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends MaimaiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
} 