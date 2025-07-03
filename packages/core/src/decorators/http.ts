import { MetadataStorage } from "../metadata/metadata";
import { HTTP_METHODS } from "../constants";
import type { RouteOptions, HttpMethod } from "../interfaces";

/**
 * 创建 HTTP 方法装饰器的工厂函数
 */
function createHttpMethodDecorator(method: HttpMethod) {
  function decorator(path?: string): MethodDecorator;
  function decorator(options?: RouteOptions): MethodDecorator;
  function decorator(pathOrOptions?: string | RouteOptions): MethodDecorator {
    return function (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      let path = "";
      let options: RouteOptions = {};

      if (typeof pathOrOptions === "string") {
        path = pathOrOptions;
      } else if (pathOrOptions) {
        path = pathOrOptions.path || "";
        options = pathOrOptions;
      }

      // 设置路由元数据
      MetadataStorage.setRouteMetadata(target, propertyKey, {
        path,
        method,
        handler: propertyKey,
        guards: options.guards,
        interceptors: options.interceptors,
        pipes: options.pipes,
      });

      return descriptor;
    };
  }

  return decorator;
}

/**
 * GET 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * findAll() {
 *   return []
 * }
 *
 * @Get('/:id')
 * findOne() {
 *   return {}
 * }
 *
 * @Get({ path: '/:id', guards: [AuthGuard] })
 * findOne() {
 *   return {}
 * }
 * ```
 */
export const Get = createHttpMethodDecorator(HTTP_METHODS.GET);

/**
 * POST 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Post()
 * create(@Body() data: CreateDto) {
 *   return data
 * }
 *
 * @Post('/batch')
 * createBatch(@Body() data: CreateDto[]) {
 *   return data
 * }
 * ```
 */
export const Post = createHttpMethodDecorator(HTTP_METHODS.POST);

/**
 * PUT 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Put('/:id')
 * update(@Param('id') id: string, @Body() data: UpdateDto) {
 *   return { id, ...data }
 * }
 * ```
 */
export const Put = createHttpMethodDecorator(HTTP_METHODS.PUT);

/**
 * DELETE 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Delete('/:id')
 * remove(@Param('id') id: string) {
 *   return { deleted: true }
 * }
 * ```
 */
export const Delete = createHttpMethodDecorator(HTTP_METHODS.DELETE);

/**
 * PATCH 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Patch('/:id')
 * partialUpdate(@Param('id') id: string, @Body() data: Partial<UpdateDto>) {
 *   return { id, ...data }
 * }
 * ```
 */
export const Patch = createHttpMethodDecorator(HTTP_METHODS.PATCH);

/**
 * HEAD 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Head('/:id')
 * checkExists(@Param('id') id: string) {
 *   // 检查资源是否存在
 * }
 * ```
 */
export const Head = createHttpMethodDecorator(HTTP_METHODS.HEAD);

/**
 * OPTIONS 请求装饰器
 *
 * @param path 路由路径，可选
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * @Options()
 * getOptions() {
 *   return { allow: ['GET', 'POST', 'PUT', 'DELETE'] }
 * }
 * ```
 */
export const Options = createHttpMethodDecorator(HTTP_METHODS.OPTIONS);
