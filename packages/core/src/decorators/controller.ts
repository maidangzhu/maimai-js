import { MetadataStorage } from "../metadata/metadata";
import { ControllerOptions } from "../interfaces";

/**
 * 控制器装饰器
 * 标记类为控制器，并设置路由前缀
 *
 * @param prefix 路由前缀，可选
 * @param options 控制器选项
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   findAll() {
 *     return []
 *   }
 * }
 *
 * @Controller({
 *   prefix: 'api/v1/users',
 *   guards: [AuthGuard]
 * })
 * export class UserController {
 *   // ...
 * }
 * ```
 */
export function Controller(prefix?: string): ClassDecorator;
export function Controller(options?: ControllerOptions): ClassDecorator;
export function Controller(
  prefixOrOptions?: string | ControllerOptions
): ClassDecorator {
  return function <T extends Function>(target: T): T {
    let options: ControllerOptions = {};

    if (typeof prefixOrOptions === "string") {
      options.prefix = prefixOrOptions;
    } else if (prefixOrOptions) {
      options = prefixOrOptions;
    }

    // 标记为可注入（控制器也是服务）
    MetadataStorage.markAsInjectable(target);

    // 设置控制器元数据
    MetadataStorage.setControllerMetadata(target, options);

    return target;
  };
}
