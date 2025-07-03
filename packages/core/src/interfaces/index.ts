import { HTTP_METHODS, PARAM_TYPES } from '../constants'

/**
 * HTTP 方法类型
 */
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS]

/**
 * 参数类型
 */
export type ParamType = typeof PARAM_TYPES[keyof typeof PARAM_TYPES]

/**
 * 路由元数据
 */
export interface RouteMetadata {
  path: string
  method: HttpMethod
  handler: string | symbol
  guards?: any[]
  interceptors?: any[]
  pipes?: any[]
}

/**
 * 参数元数据
 */
export interface ParamMetadata {
  index: number
  type: ParamType
  key?: string
  pipe?: any
  validator?: any
}

/**
 * 控制器元数据
 */
export interface ControllerMetadata {
  prefix?: string
  guards?: any[]
  interceptors?: any[]
  middleware?: any[]
}

/**
 * HTTP 上下文接口
 */
export interface HttpContext {
  request: any
  response: any
  params: Record<string, any>
  query: Record<string, any>
  body: any
  headers: Record<string, string>
}

/**
 * 服务接口抽象类
 */
export abstract class ServiceInterface {
  abstract [key: string]: any
}

/**
 * 可注入的类构造函数
 */
export interface Injectable<T = any> {
  new (...args: any[]): T
}

/**
 * 路由定义选项
 */
export interface RouteOptions {
  path?: string
  guards?: any[]
  interceptors?: any[]
  pipes?: any[]
}

/**
 * 控制器选项
 */
export interface ControllerOptions {
  prefix?: string
  guards?: any[]
  interceptors?: any[]
  middleware?: any[]
}

/**
 * 中间件接口
 */
export interface MiddlewareInterface {
  use(context: HttpContext, next: () => Promise<void>): Promise<void>
}

/**
 * 守卫接口
 */
export interface GuardInterface {
  canActivate(context: HttpContext): boolean | Promise<boolean>
}

/**
 * 拦截器接口
 */
export interface InterceptorInterface {
  intercept(context: HttpContext, next: () => Promise<any>): Promise<any>
}

/**
 * 管道接口
 */
export interface PipeInterface<T = any, R = any> {
  transform(value: T, metadata?: any): R | Promise<R>
} 