import { MetadataStorage } from "../metadata/metadata";

/**
 * Injectable 装饰器选项
 */
export interface InjectableOptions {
  /**
   * 服务作用域
   */
  scope?: "singleton" | "transient" | "request";

  /**
   * 自定义标识符
   */
  token?: string | symbol;
}

/**
 * 标记类为可注入的服务
 *
 * @param options 注入选项
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   getUsers() {
 *     return []
 *   }
 * }
 *
 * @Injectable({ scope: 'transient' })
 * export class LogService {
 *   log(message: string) {
 *     console.log(message)
 *   }
 * }
 * ```
 */
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // 标记为可注入
    MetadataStorage.markAsInjectable(target);

    // 存储注入选项
    if (options.scope || options.token) {
      MetadataStorage.setClassMetadata(
        Symbol("maimai:injectable-options"),
        options,
        target
      );
    }

    return target;
  };
}

/**
 * 获取注入选项
 */
export function getInjectableOptions(
  target: any
): InjectableOptions | undefined {
  return MetadataStorage.getClassMetadata(
    Symbol("maimai:injectable-options"),
    target
  );
}
