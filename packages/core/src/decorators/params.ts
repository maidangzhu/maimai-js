import { MetadataStorage } from "../metadata/metadata";
import { PARAM_TYPES } from "../constants";
import { ParamType } from "../interfaces";

/**
 * 创建参数装饰器的工厂函数
 */
function createParamDecorator(type: ParamType) {
  return function (key?: string, pipe?: any): ParameterDecorator {
    return function (
      target: any,
      propertyKey: string | symbol | undefined,
      parameterIndex: number
    ) {
      if (!propertyKey) {
        throw new Error(
          "Parameter decorator must be used on method parameters"
        );
      }

      MetadataStorage.setParamMetadata(target, propertyKey, parameterIndex, {
        index: parameterIndex,
        type,
        key,
        pipe,
      });
    };
  };
}

/**
 * 请求体装饰器
 * 获取 HTTP 请求的 body 内容
 *
 * @param key 可选的键名，用于获取 body 中的特定字段
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Post()
 * create(@Body() data: CreateUserDto) {
 *   return data
 * }
 *
 * @Post()
 * createWithEmail(@Body('email') email: string) {
 *   return { email }
 * }
 *
 * @Post()
 * createWithValidation(@Body(ValidationPipe) data: CreateUserDto) {
 *   return data
 * }
 * ```
 */
export const Body = createParamDecorator(PARAM_TYPES.BODY);

/**
 * 查询参数装饰器
 * 获取 URL 查询参数
 *
 * @param key 可选的查询参数名
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Query() query: any) {
 *   return query
 * }
 *
 * @Get()
 * findWithLimit(@Query('limit') limit: number) {
 *   return { limit }
 * }
 *
 * @Get()
 * findWithPagination(@Query('page', ParseIntPipe) page: number) {
 *   return { page }
 * }
 * ```
 */
export const Query = createParamDecorator(PARAM_TYPES.QUERY);

/**
 * 路径参数装饰器
 * 获取 URL 路径中的参数
 *
 * @param key 可选的路径参数名
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get('/:id')
 * findOne(@Param('id') id: string) {
 *   return { id }
 * }
 *
 * @Get('/:id')
 * findOneWithValidation(@Param('id', ParseIntPipe) id: number) {
 *   return { id }
 * }
 *
 * @Get('/:userId/posts/:postId')
 * findUserPost(@Param() params: { userId: string; postId: string }) {
 *   return params
 * }
 * ```
 */
export const Param = createParamDecorator(PARAM_TYPES.PARAM);

/**
 * 请求头装饰器
 * 获取 HTTP 请求头
 *
 * @param key 可选的请求头名称
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * getUserAgent(@Header('user-agent') userAgent: string) {
 *   return { userAgent }
 * }
 *
 * @Get()
 * getAllHeaders(@Header() headers: Record<string, string>) {
 *   return headers
 * }
 *
 * @Get()
 * getAuthToken(@Header('authorization') token: string) {
 *   return { token }
 * }
 * ```
 */
export const Header = createParamDecorator(PARAM_TYPES.HEADER);

/**
 * 上下文装饰器
 * 获取完整的 HTTP 上下文对象
 *
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * getContext(@Context() ctx: HttpContext) {
 *   return {
 *     method: ctx.request.method,
 *     url: ctx.request.url,
 *     headers: ctx.headers
 *   }
 * }
 * ```
 */
export const Context = createParamDecorator(PARAM_TYPES.CONTEXT);

/**
 * 请求对象装饰器
 * 获取原始的请求对象
 *
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * getRawRequest(@Request() req: any) {
 *   return {
 *     method: req.method,
 *     url: req.url,
 *     headers: req.headers
 *   }
 * }
 * ```
 */
export const Request = createParamDecorator(PARAM_TYPES.REQUEST);

/**
 * 响应对象装饰器
 * 获取原始的响应对象
 *
 * @param pipe 可选的管道，用于数据转换或验证
 * @returns 参数装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * customResponse(@Response() res: any) {
 *   res.status(201);
 *   return { message: 'Custom response' }
 * }
 * ```
 */
export const Response = createParamDecorator(PARAM_TYPES.RESPONSE);
