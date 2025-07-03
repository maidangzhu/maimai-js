// 导入 reflect-metadata
import "reflect-metadata";

// 导出所有装饰器
export * from "./decorators";

// 导出接口和类型
export * from "./interfaces";

// 导出常量
export * from "./constants";

// 导出元数据管理
export { MetadataStorage } from "./metadata/metadata";

// 导出工具类
export { ReflectionUtils } from "./utils/reflection";

// 导出类型工具（用于类型推断）
export type {
  HttpMethod,
  ParamType,
  RouteMetadata,
  ParamMetadata,
  ControllerMetadata,
  HttpContext,
  ServiceInterface,
  Injectable,
  RouteOptions,
  ControllerOptions,
  MiddlewareInterface,
  GuardInterface,
  InterceptorInterface,
  PipeInterface,
} from "./interfaces";
