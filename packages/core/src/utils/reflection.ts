import "reflect-metadata";
import { MetadataStorage } from "../metadata/metadata";
import type {
  RouteMetadata,
  ParamMetadata,
  ControllerMetadata,
} from "../interfaces";

/**
 * 反射工具类
 * 提供装饰器元数据的查询和分析功能
 */
export class ReflectionUtils {
  /**
   * 获取类的设计类型信息
   */
  static getDesignType(target: any, propertyKey?: string | symbol): any {
    if (propertyKey) {
      return (Reflect as any).getMetadata("design:type", target, propertyKey);
    }
    return (Reflect as any).getMetadata("design:type", target);
  }

  /**
   * 获取方法的参数类型
   */
  static getParameterTypes(target: any, propertyKey: string | symbol): any[] {
    return (
      (Reflect as any).getMetadata("design:paramtypes", target, propertyKey) ||
      []
    );
  }

  /**
   * 获取方法的返回类型
   */
  static getReturnType(target: any, propertyKey: string | symbol): any {
    return (Reflect as any).getMetadata(
      "design:returntype",
      target,
      propertyKey
    );
  }

  /**
   * 检查类是否为控制器
   */
  static isController(target: any): boolean {
    return MetadataStorage.hasMetadata(Symbol("maimai:route-prefix"), target);
  }

  /**
   * 检查类是否为服务
   */
  static isService(target: any): boolean {
    return MetadataStorage.isInjectable(target);
  }

  /**
   * 检查方法是否为路由处理器
   */
  static isRouteHandler(target: any, propertyKey: string | symbol): boolean {
    const routes = MetadataStorage.getRoutesMetadata(target);
    return routes?.some((route) => route.handler === propertyKey) || false;
  }

  /**
   * 获取控制器的所有路由信息
   */
  static getControllerRoutes(target: any): {
    controller: ControllerMetadata;
    routes: RouteMetadata[];
    fullRoutes: Array<RouteMetadata & { fullPath: string }>;
  } {
    const controller = MetadataStorage.getControllerMetadata(target);
    const routes = MetadataStorage.getRoutesMetadata(target) || [];
    const fullRoutes = MetadataStorage.getFullRouteMetadata(target);

    return {
      controller: controller || {},
      routes,
      fullRoutes,
    };
  }

  /**
   * 获取方法的完整元数据信息
   */
  static getMethodMetadata(
    target: any,
    propertyKey: string | symbol
  ): {
    route?: RouteMetadata;
    params: ParamMetadata[];
    guards: any[];
    interceptors: any[];
    pipes: any[];
    parameterTypes: any[];
    returnType: any;
  } {
    const routes = MetadataStorage.getRoutesMetadata(target) || [];
    const route = routes.find((r) => r.handler === propertyKey);
    const params = MetadataStorage.getParamMetadata(target, propertyKey) || [];
    const guards = MetadataStorage.getGuards(target, propertyKey);
    const interceptors = MetadataStorage.getInterceptors(target, propertyKey);
    const pipes = MetadataStorage.getPipes(target, propertyKey);
    const parameterTypes = this.getParameterTypes(target, propertyKey);
    const returnType = this.getReturnType(target, propertyKey);

    return {
      route,
      params,
      guards,
      interceptors,
      pipes,
      parameterTypes,
      returnType,
    };
  }

  /**
   * 获取类的完整元数据信息
   */
  static getClassMetadata(target: any): {
    isController: boolean;
    isService: boolean;
    controller?: ControllerMetadata;
    guards: any[];
    interceptors: any[];
    pipes: any[];
    middleware: any[];
    routes: RouteMetadata[];
    methods: Array<{
      name: string;
      metadata: ReturnType<typeof ReflectionUtils.getMethodMetadata>;
    }>;
  } {
    const isController = this.isController(target);
    const isService = this.isService(target);
    const controller = isController
      ? MetadataStorage.getControllerMetadata(target)
      : undefined;
    const guards = MetadataStorage.getGuards(target);
    const interceptors = MetadataStorage.getInterceptors(target);
    const pipes = MetadataStorage.getPipes(target);
    const middleware = MetadataStorage.getMiddleware(target);
    const routes = MetadataStorage.getRoutesMetadata(target) || [];

    const methodNames = MetadataStorage.getMethodNames(target);
    const methods = methodNames.map((name) => ({
      name,
      metadata: this.getMethodMetadata(target, name),
    }));

    return {
      isController,
      isService,
      controller,
      guards,
      interceptors,
      pipes,
      middleware,
      routes,
      methods,
    };
  }

  /**
   * 分析参数装饰器的类型映射
   */
  static analyzeParameterMapping(
    target: any,
    propertyKey: string | symbol
  ): Array<{
    index: number;
    type: string;
    key?: string;
    parameterType: any;
    decorator: ParamMetadata;
  }> {
    const params = MetadataStorage.getParamMetadata(target, propertyKey) || [];
    const parameterTypes = this.getParameterTypes(target, propertyKey);

    return params.map((param) => ({
      index: param.index,
      type: param.type,
      key: param.key,
      parameterType: parameterTypes[param.index],
      decorator: param,
    }));
  }

  /**
   * 验证装饰器配置的有效性
   */
  static validateDecorators(target: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查控制器
    if (this.isController(target)) {
      const routes = MetadataStorage.getRoutesMetadata(target) || [];
      const methodNames = MetadataStorage.getMethodNames(target);

      // 检查是否有路由方法
      if (routes.length === 0) {
        warnings.push("控制器没有定义任何路由方法");
      }

      // 检查路由方法是否存在
      routes.forEach((route) => {
        if (!methodNames.includes(route.handler as string)) {
          errors.push(`路由处理器方法 '${String(route.handler)}' 不存在`);
        }
      });

      // 检查参数装饰器
      routes.forEach((route) => {
        const params = MetadataStorage.getParamMetadata(target, route.handler);
        const paramTypes = this.getParameterTypes(target, route.handler);

        if (params && params.length > paramTypes.length) {
          errors.push(
            `方法 '${String(route.handler)}' 的参数装饰器数量超过实际参数数量`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 获取继承链中的所有元数据
   */
  static getInheritedMetadata(target: any): {
    ownMetadata: ReturnType<typeof ReflectionUtils.getClassMetadata>;
    inheritedMetadata: Array<{
      class: any;
      metadata: ReturnType<typeof ReflectionUtils.getClassMetadata>;
    }>;
  } {
    const ownMetadata = this.getClassMetadata(target);
    const inheritedMetadata: Array<{
      class: any;
      metadata: ReturnType<typeof ReflectionUtils.getClassMetadata>;
    }> = [];

    let currentClass = Object.getPrototypeOf(target);
    while (currentClass && currentClass !== Object.prototype) {
      const metadata = this.getClassMetadata(currentClass);
      if (
        metadata.isController ||
        metadata.isService ||
        metadata.routes.length > 0
      ) {
        inheritedMetadata.push({
          class: currentClass,
          metadata,
        });
      }
      currentClass = Object.getPrototypeOf(currentClass);
    }

    return {
      ownMetadata,
      inheritedMetadata,
    };
  }
}
