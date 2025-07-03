import { MetadataStorage } from "../metadata/metadata";
import { METADATA_KEYS } from "../constants";

/**
 * 守卫装饰器
 * 用于保护路由，控制访问权限
 *
 * @param guards 守卫类数组
 * @returns 类或方法装饰器
 *
 * @example
 * ```typescript
 * // 在控制器级别使用
 * @Controller('users')
 * @UseGuards(AuthGuard, RoleGuard)
 * export class UserController {
 *   @Get()
 *   findAll() {
 *     return []
 *   }
 * }
 *
 * // 在方法级别使用
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   @UseGuards(AuthGuard)
 *   findAll() {
 *     return []
 *   }
 * }
 * ```
 */
export function UseGuards(...guards: any[]): ClassDecorator & MethodDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      // 方法装饰器 - 为特定路由添加守卫
      const existingGuards =
        MetadataStorage.getMethodMetadata(
          METADATA_KEYS.GUARDS,
          target,
          propertyKey
        ) || [];

      MetadataStorage.setMethodMetadata(
        METADATA_KEYS.GUARDS,
        [...existingGuards, ...guards],
        target,
        propertyKey
      );
    } else {
      // 类装饰器 - 为整个控制器添加守卫
      const existingGuards =
        MetadataStorage.getClassMetadata(METADATA_KEYS.GUARDS, target) || [];

      MetadataStorage.setClassMetadata(
        METADATA_KEYS.GUARDS,
        [...existingGuards, ...guards],
        target
      );
    }

    return descriptor || target;
  };
}

/**
 * 拦截器装饰器
 * 用于拦截和转换请求/响应
 *
 * @param interceptors 拦截器类数组
 * @returns 类或方法装饰器
 *
 * @example
 * ```typescript
 * // 在控制器级别使用
 * @Controller('users')
 * @UseInterceptors(LoggingInterceptor, TransformInterceptor)
 * export class UserController {
 *   @Get()
 *   findAll() {
 *     return []
 *   }
 * }
 *
 * // 在方法级别使用
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   @UseInterceptors(CacheInterceptor)
 *   findAll() {
 *     return []
 *   }
 * }
 * ```
 */
export function UseInterceptors(
  ...interceptors: any[]
): ClassDecorator & MethodDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      // 方法装饰器
      const existingInterceptors =
        MetadataStorage.getMethodMetadata(
          METADATA_KEYS.INTERCEPTORS,
          target,
          propertyKey
        ) || [];

      MetadataStorage.setMethodMetadata(
        METADATA_KEYS.INTERCEPTORS,
        [...existingInterceptors, ...interceptors],
        target,
        propertyKey
      );
    } else {
      // 类装饰器
      const existingInterceptors =
        MetadataStorage.getClassMetadata(METADATA_KEYS.INTERCEPTORS, target) ||
        [];

      MetadataStorage.setClassMetadata(
        METADATA_KEYS.INTERCEPTORS,
        [...existingInterceptors, ...interceptors],
        target
      );
    }

    return descriptor || target;
  };
}

/**
 * 管道装饰器
 * 用于数据转换和验证
 *
 * @param pipes 管道类数组
 * @returns 类或方法装饰器
 *
 * @example
 * ```typescript
 * // 在控制器级别使用
 * @Controller('users')
 * @UsePipes(ValidationPipe, TransformPipe)
 * export class UserController {
 *   @Post()
 *   create(@Body() data: CreateUserDto) {
 *     return data
 *   }
 * }
 *
 * // 在方法级别使用
 * @Controller('users')
 * export class UserController {
 *   @Post()
 *   @UsePipes(ValidationPipe)
 *   create(@Body() data: CreateUserDto) {
 *     return data
 *   }
 * }
 * ```
 */
export function UsePipes(...pipes: any[]): ClassDecorator & MethodDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      // 方法装饰器
      const existingPipes =
        MetadataStorage.getMethodMetadata(
          METADATA_KEYS.PIPES,
          target,
          propertyKey
        ) || [];

      MetadataStorage.setMethodMetadata(
        METADATA_KEYS.PIPES,
        [...existingPipes, ...pipes],
        target,
        propertyKey
      );
    } else {
      // 类装饰器
      const existingPipes =
        MetadataStorage.getClassMetadata(METADATA_KEYS.PIPES, target) || [];

      MetadataStorage.setClassMetadata(
        METADATA_KEYS.PIPES,
        [...existingPipes, ...pipes],
        target
      );
    }

    return descriptor || target;
  };
}

/**
 * 中间件装饰器
 * 用于为控制器添加中间件
 *
 * @param middleware 中间件函数或类数组
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @UseMiddleware(CorsMiddleware, LoggingMiddleware)
 * export class UserController {
 *   @Get()
 *   findAll() {
 *     return []
 *   }
 * }
 * ```
 */
export function UseMiddleware(...middleware: any[]): ClassDecorator {
  return function (target: any) {
    const existingMiddleware =
      MetadataStorage.getClassMetadata(METADATA_KEYS.MIDDLEWARE, target) || [];

    MetadataStorage.setClassMetadata(
      METADATA_KEYS.MIDDLEWARE,
      [...existingMiddleware, ...middleware],
      target
    );

    return target;
  };
}
