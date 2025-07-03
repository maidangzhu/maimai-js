/**
 * 元数据键常量
 */
export const METADATA_KEYS = {
  INJECTABLE: Symbol("maimai:injectable"),
  ROUTE_PREFIX: Symbol("maimai:route-prefix"),
  ROUTES: Symbol("maimai:routes"),
  PARAMS: Symbol("maimai:params"),
  GUARDS: Symbol("maimai:guards"),
  INTERCEPTORS: Symbol("maimai:interceptors"),
  PIPES: Symbol("maimai:pipes"),
  MIDDLEWARE: Symbol("maimai:middleware"),
} as const;

/**
 * HTTP 方法常量
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const;

/**
 * 参数类型常量
 */
export const PARAM_TYPES = {
  BODY: "body",
  QUERY: "query",
  PARAM: "param",
  HEADER: "header",
  CONTEXT: "context",
  REQUEST: "request",
  RESPONSE: "response",
} as const;

/**
 * 依赖注入标识
 */
export const INJECTION_TOKENS = {
  HTTP_CONTEXT: Symbol("maimai:http-context"),
  REQUEST: Symbol("maimai:request"),
  RESPONSE: Symbol("maimai:response"),
} as const;
