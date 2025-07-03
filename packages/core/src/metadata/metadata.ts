import "reflect-metadata";
import { METADATA_KEYS } from "../constants";
import type {
  RouteMetadata,
  ParamMetadata,
  ControllerMetadata,
} from "../interfaces";

/**
 * 元数据存储和管理类
 */
export class MetadataStorage {
  /**
   * 设置类的元数据
   */
  static setClassMetadata<T = any>(
    metadataKey: symbol,
    metadataValue: T,
    target: any
  ): void {
    Reflect.defineMetadata(metadataKey, metadataValue, target);
  }

  /**
   * 获取类的元数据
   */
  static getClassMetadata<T = any>(
    metadataKey: symbol,
    target: any
  ): T | undefined {
    return Reflect.getMetadata(metadataKey, target);
  }

  /**
   * 设置方法的元数据
   */
  static setMethodMetadata<T = any>(
    metadataKey: symbol,
    metadataValue: T,
    target: any,
    propertyKey: string | symbol
  ): void {
    Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
  }

  /**
   * 获取方法的元数据
   */
  static getMethodMetadata<T = any>(
    metadataKey: symbol,
    target: any,
    propertyKey: string | symbol
  ): T | undefined {
    return Reflect.getMetadata(metadataKey, target, propertyKey);
  }

  /**
   * 设置参数元数据
   */
  static setParamMetadata(
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
    metadata: ParamMetadata
  ): void {
    const existingMetadata = this.getParamMetadata(target, propertyKey) || [];
    existingMetadata[parameterIndex] = metadata;
    this.setMethodMetadata(
      METADATA_KEYS.PARAMS,
      existingMetadata,
      target,
      propertyKey
    );
  }

  /**
   * 获取参数元数据
   */
  static getParamMetadata(
    target: any,
    propertyKey: string | symbol
  ): ParamMetadata[] | undefined {
    return this.getMethodMetadata(METADATA_KEYS.PARAMS, target, propertyKey);
  }

  /**
   * 设置路由元数据
   */
  static setRouteMetadata(
    target: any,
    propertyKey: string | symbol,
    metadata: RouteMetadata
  ): void {
    const existingRoutes = this.getRoutesMetadata(target) || [];
    const routeMetadata = { ...metadata, handler: propertyKey };
    existingRoutes.push(routeMetadata);
    this.setClassMetadata(METADATA_KEYS.ROUTES, existingRoutes, target);
  }

  /**
   * 获取所有路由元数据
   */
  static getRoutesMetadata(target: any): RouteMetadata[] | undefined {
    return this.getClassMetadata(METADATA_KEYS.ROUTES, target);
  }

  /**
   * 设置控制器元数据
   */
  static setControllerMetadata(
    target: any,
    metadata: ControllerMetadata
  ): void {
    this.setClassMetadata(METADATA_KEYS.ROUTE_PREFIX, metadata, target);
  }

  /**
   * 获取控制器元数据
   */
  static getControllerMetadata(target: any): ControllerMetadata | undefined {
    return this.getClassMetadata(METADATA_KEYS.ROUTE_PREFIX, target);
  }

  /**
   * 标记类为可注入
   */
  static markAsInjectable(target: any): void {
    this.setClassMetadata(METADATA_KEYS.INJECTABLE, true, target);
  }

  /**
   * 检查类是否可注入
   */
  static isInjectable(target: any): boolean {
    return this.getClassMetadata(METADATA_KEYS.INJECTABLE, target) === true;
  }

  /**
   * 获取所有方法名
   */
  static getMethodNames(target: any): string[] {
    const prototype = target.prototype || target;
    return Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== "constructor" && typeof prototype[name] === "function"
    );
  }

  /**
   * 合并元数据（用于继承）
   */
  static mergeMetadata<T>(
    metadataKey: symbol,
    baseMetadata: T,
    derivedMetadata: T
  ): T {
    if (Array.isArray(baseMetadata) && Array.isArray(derivedMetadata)) {
      return [...baseMetadata, ...derivedMetadata] as T;
    }
    if (
      typeof baseMetadata === "object" &&
      typeof derivedMetadata === "object"
    ) {
      return { ...baseMetadata, ...derivedMetadata } as T;
    }
    return derivedMetadata || baseMetadata;
  }

  /**
   * 获取守卫元数据
   */
  static getGuards(target: any, propertyKey?: string | symbol): any[] {
    if (propertyKey) {
      return (
        this.getMethodMetadata(METADATA_KEYS.GUARDS, target, propertyKey) || []
      );
    }
    return this.getClassMetadata(METADATA_KEYS.GUARDS, target) || [];
  }

  /**
   * 获取拦截器元数据
   */
  static getInterceptors(target: any, propertyKey?: string | symbol): any[] {
    if (propertyKey) {
      return (
        this.getMethodMetadata(
          METADATA_KEYS.INTERCEPTORS,
          target,
          propertyKey
        ) || []
      );
    }
    return this.getClassMetadata(METADATA_KEYS.INTERCEPTORS, target) || [];
  }

  /**
   * 获取管道元数据
   */
  static getPipes(target: any, propertyKey?: string | symbol): any[] {
    if (propertyKey) {
      return (
        this.getMethodMetadata(METADATA_KEYS.PIPES, target, propertyKey) || []
      );
    }
    return this.getClassMetadata(METADATA_KEYS.PIPES, target) || [];
  }

  /**
   * 获取中间件元数据
   */
  static getMiddleware(target: any): any[] {
    return this.getClassMetadata(METADATA_KEYS.MIDDLEWARE, target) || [];
  }

  /**
   * 获取完整的路由信息（包含控制器前缀）
   */
  static getFullRouteMetadata(
    target: any
  ): Array<RouteMetadata & { fullPath: string }> {
    const routes = this.getRoutesMetadata(target) || [];
    const controller = this.getControllerMetadata(target);
    const prefix = controller?.prefix || "";

    return routes.map((route) => ({
      ...route,
      fullPath: this.joinPaths(prefix, route.path),
    }));
  }

  /**
   * 路径拼接工具
   */
  private static joinPaths(prefix: string, path: string): string {
    const cleanPrefix = prefix.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");

    if (!cleanPrefix) return `/${cleanPath}`;
    if (!cleanPath) return cleanPrefix;

    return `${cleanPrefix}/${cleanPath}`;
  }

  /**
   * 检查是否有指定的元数据
   */
  static hasMetadata(
    metadataKey: symbol,
    target: any,
    propertyKey?: string | symbol
  ): boolean {
    if (propertyKey) {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.hasMetadata(metadataKey, target);
  }

  /**
   * 删除元数据
   */
  static deleteMetadata(
    metadataKey: symbol,
    target: any,
    propertyKey?: string | symbol
  ): boolean {
    if (propertyKey) {
      return Reflect.deleteMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.deleteMetadata(metadataKey, target);
  }

  /**
   * 获取所有元数据键
   */
  static getMetadataKeys(target: any, propertyKey?: string | symbol): symbol[] {
    if (propertyKey) {
      return Reflect.getMetadataKeys(target, propertyKey) as symbol[];
    }
    return Reflect.getMetadataKeys(target) as symbol[];
  }

  /**
   * 克隆元数据到新的目标
   */
  static cloneMetadata(
    source: any,
    target: any,
    sourcePropertyKey?: string | symbol,
    targetPropertyKey?: string | symbol
  ): void {
    const keys = this.getMetadataKeys(source, sourcePropertyKey);

    keys.forEach((key) => {
      const metadata = sourcePropertyKey
        ? this.getMethodMetadata(key, source, sourcePropertyKey)
        : this.getClassMetadata(key, source);

      if (targetPropertyKey) {
        this.setMethodMetadata(key, metadata, target, targetPropertyKey);
      } else {
        this.setClassMetadata(key, metadata, target);
      }
    });
  }
}
