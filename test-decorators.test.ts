import { describe, it, expect, beforeAll } from "vitest";
import {
  Controller,
  Injectable,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  Header,
  Context,
  Request,
  Response,
  UseGuards,
  UseInterceptors,
  UsePipes,
  UseMiddleware,
  MetadataStorage,
  ReflectionUtils,
  HttpMethod,
  HttpContext,
  RouteMetadata,
  ParamMetadata,
} from "./packages/core/src/index.js";

// 演示基础服务类
@Injectable()
class UserService {
  private users = [
    { id: 1, name: "张三", email: "zhangsan@example.com" },
    { id: 2, name: "李四", email: "lisi@example.com" },
  ];

  findAll() {
    console.log("🔍 UserService: 查找所有用户");
    return this.users;
  }

  findById(id: number) {
    console.log(`🔍 UserService: 查找用户 ID=${id}`);
    return this.users.find((user) => user.id === id);
  }

  create(userData: any) {
    console.log("✨ UserService: 创建新用户", userData);
    const newUser = { id: Date.now(), ...userData };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, userData: any) {
    console.log(`📝 UserService: 更新用户 ID=${id}`, userData);
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      return this.users[userIndex];
    }
    return null;
  }

  delete(id: number) {
    console.log(`🗑️ UserService: 删除用户 ID=${id}`);
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      return this.users.splice(userIndex, 1)[0];
    }
    return null;
  }
}

// 演示守卫、拦截器、管道等类
class AuthGuard {
  canActivate(context: any): boolean {
    console.log("🛡️ AuthGuard: 检查用户认证状态");
    return true;
  }
}

class RoleGuard {
  canActivate(context: any): boolean {
    console.log("🛡️ RoleGuard: 检查用户角色权限");
    return true;
  }
}

class LoggingInterceptor {
  intercept(context: any, next: any) {
    console.log("📝 LoggingInterceptor: 请求开始");
    const result = next();
    console.log("📝 LoggingInterceptor: 请求结束");
    return result;
  }
}

class TransformInterceptor {
  intercept(context: any, next: any) {
    console.log("🔄 TransformInterceptor: 转换响应数据");
    return next();
  }
}

class ValidationPipe {
  transform(value: any, metadata: any) {
    console.log("✅ ValidationPipe: 验证数据", { value, metadata });
    return value;
  }
}

class ParseIntPipe {
  transform(value: any, metadata: any) {
    console.log("🔢 ParseIntPipe: 转换为整数", { value, metadata });
    return parseInt(value, 10);
  }
}

class CorsMiddleware {
  use(req: any, res: any, next: any) {
    console.log("🌍 CorsMiddleware: 处理跨域请求");
    next();
  }
}

class LoggingMiddleware {
  use(req: any, res: any, next: any) {
    console.log("📋 LoggingMiddleware: 记录请求日志");
    next();
  }
}

// 演示控制器类
@Controller("api/users")
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@UsePipes(ValidationPipe)
@UseMiddleware(CorsMiddleware, LoggingMiddleware)
class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseInterceptors(TransformInterceptor)
  findAll(@Query() query: any, @Header("user-agent") userAgent: string) {
    console.log("🎯 UserController.findAll 被调用");
    console.log("📊 查询参数:", query);
    console.log("🌐 用户代理:", userAgent);
    return this.userService.findAll();
  }

  @Get("/:id")
  @UseGuards(RoleGuard)
  findOne(@Param("id", ParseIntPipe) id: number, @Context() ctx: HttpContext) {
    console.log("🎯 UserController.findOne 被调用");
    console.log("🆔 用户ID:", id);
    console.log("📄 上下文:", ctx);
    return this.userService.findById(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() userData: any, @Request() req: any) {
    console.log("🎯 UserController.create 被调用");
    console.log("📦 用户数据:", userData);
    console.log("📨 请求对象:", req);
    return this.userService.create(userData);
  }

  @Put("/:id")
  @UseGuards(AuthGuard, RoleGuard)
  update(@Param("id") id: string, @Body() userData: any, @Response() res: any) {
    console.log("🎯 UserController.update 被调用");
    console.log("🆔 用户ID:", id);
    console.log("📦 更新数据:", userData);
    console.log("📤 响应对象:", res);
    return this.userService.update(parseInt(id), userData);
  }

  @Patch("/:id")
  partialUpdate(@Param("id") id: string, @Body() partialData: any) {
    console.log("🎯 UserController.partialUpdate 被调用");
    console.log("🆔 用户ID:", id);
    console.log("📦 部分数据:", partialData);
    return this.userService.update(parseInt(id), partialData);
  }

  @Delete("/:id")
  @UseGuards(AuthGuard)
  remove(@Param("id") id: string) {
    console.log("🎯 UserController.remove 被调用");
    console.log("🆔 用户ID:", id);
    return this.userService.delete(parseInt(id));
  }

  @Get("/search")
  search(
    @Query("keyword") keyword: string,
    @Query("limit", ParseIntPipe) limit: number,
    @Header() headers: Record<string, string>
  ) {
    console.log("🎯 UserController.search 被调用");
    console.log("🔍 关键词:", keyword);
    console.log("📏 限制数量:", limit);
    console.log("📋 所有请求头:", headers);
    return this.userService
      .findAll()
      .filter((user) => user.name.includes(keyword));
  }
}

describe("Maimai Core 装饰器测试", () => {
  let userService: UserService;
  let userController: UserController;

  beforeAll(() => {
    console.log("🚀 ===== Maimai Core 装饰器学习测试 =====");
    console.log("📚 这个测试将展示 @/core 包中所有装饰器的使用方法\n");

    userService = new UserService();
    userController = new UserController(userService);
  });

  describe("装饰器元数据分析", () => {
    it("应该正确识别 Injectable 服务", () => {
      console.log("\n🔍 ===== 装饰器元数据分析 =====\n");
      console.log("1️⃣ 分析 UserService 类:");

      const isInjectable = ReflectionUtils.isInjectable(UserService);
      const isController = ReflectionUtils.isController(UserService);
      const constructorParams =
        ReflectionUtils.getConstructorParameterTypes(UserService);

      console.log("   是否可注入:", isInjectable);
      console.log("   是否控制器:", isController);
      console.log("   构造函数参数类型:", constructorParams);

      expect(isInjectable).toBe(true);
      expect(isController).toBe(false);
    });

    it("应该正确识别 Controller 控制器", () => {
      console.log("\n2️⃣ 分析 UserController 类:");

      const isInjectable = ReflectionUtils.isInjectable(UserController);
      const isController = ReflectionUtils.isController(UserController);

      console.log("   是否可注入:", isInjectable);
      console.log("   是否控制器:", isController);

      expect(isInjectable).toBe(true);
      expect(isController).toBe(true);
    });

    it("应该正确获取控制器元数据", () => {
      const controllerMetadata =
        MetadataStorage.getControllerMetadata(UserController);
      console.log("   控制器元数据:", controllerMetadata);

      expect(controllerMetadata).toBeDefined();
      expect(controllerMetadata?.prefix).toBe("api/users");
    });

    it("应该正确获取路由元数据", () => {
      const routesMetadata = MetadataStorage.getRoutesMetadata(UserController);
      console.log("   路由数量:", routesMetadata?.length || 0);

      expect(routesMetadata).toBeDefined();
      expect(routesMetadata!.length).toBeGreaterThan(0);

      if (routesMetadata) {
        routesMetadata.forEach((route: RouteMetadata, index: number) => {
          console.log(`   路由 ${index + 1}:`, {
            方法: route.method,
            路径: route.path,
            处理器: route.handler,
            守卫: route.guards,
            拦截器: route.interceptors,
            管道: route.pipes,
          });

          // 获取参数元数据
          const paramsMetadata = MetadataStorage.getParamMetadata(
            UserController,
            route.handler
          );
          if (paramsMetadata && paramsMetadata.length > 0) {
            console.log(`     参数装饰器 (${paramsMetadata.length} 个):`);
            paramsMetadata.forEach(
              (param: ParamMetadata, paramIndex: number) => {
                console.log(`       参数 ${paramIndex + 1}:`, {
                  索引: param.index,
                  类型: param.type,
                  键: param.key,
                  管道: param.pipe?.name || param.pipe,
                });
              }
            );
          }
        });
      }
    });

    it("应该正确验证装饰器配置", () => {
      console.log("\n4️⃣ 装饰器配置验证:");
      const validation = ReflectionUtils.validateDecorators(UserController);

      console.log("   配置有效:", validation.isValid);
      if (validation.errors.length > 0) {
        console.log("   错误:", validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.log("   警告:", validation.warnings);
      }

      expect(validation.isValid).toBe(true);
    });

    it("应该正确获取方法信息", () => {
      console.log("\n5️⃣ 控制器方法:");
      const methodNames = ReflectionUtils.getMethodNames(UserController);
      console.log("   方法列表:", methodNames);

      expect(methodNames.length).toBeGreaterThan(0);

      methodNames.forEach((methodName) => {
        const paramTypes = ReflectionUtils.getParameterTypes(
          UserController,
          methodName
        );
        console.log(
          `   ${methodName} 参数类型:`,
          paramTypes.map((t) => t?.name || "unknown")
        );
      });
    });
  });

  describe("模拟 HTTP 请求测试", () => {
    const mockContext: Partial<HttpContext> = {
      request: {
        method: "GET" as HttpMethod,
        url: "/api/users",
        headers: { "user-agent": "Mozilla/5.0" },
        body: {},
        query: { limit: "10", page: "1" },
        params: {},
      },
      response: {
        status: 200,
        headers: {},
        body: null,
      },
    };

    it("应该正确处理 GET /api/users", () => {
      console.log("\n🌐 ===== 模拟 HTTP 请求测试 =====\n");
      console.log("1️⃣ 测试 GET /api/users");

      const result = userController.findAll(
        { limit: "10", page: "1" },
        "Mozilla/5.0 (Test Browser)"
      );

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("应该正确处理 GET /api/users/:id", () => {
      console.log("\n2️⃣ 测试 GET /api/users/1");

      const result = userController.findOne(1, mockContext as HttpContext);

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
    });

    it("应该正确处理 POST /api/users", () => {
      console.log("\n3️⃣ 测试 POST /api/users");

      const newUser = { name: "王五", email: "wangwu@example.com" };
      const result = userController.create(newUser, mockContext.request);

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(result.name).toBe("王五");
    });

    it("应该正确处理 PUT /api/users/:id", () => {
      console.log("\n4️⃣ 测试 PUT /api/users/1");

      const updateData = { name: "张三三", email: "zhangsan3@example.com" };
      const result = userController.update(
        "1",
        updateData,
        mockContext.response
      );

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(result!.name).toBe("张三三");
    });

    it("应该正确处理 DELETE /api/users/:id", () => {
      console.log("\n5️⃣ 测试 DELETE /api/users/2");

      const result = userController.remove("2");

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(result!.id).toBe(2);
    });

    it("应该正确处理搜索请求", () => {
      console.log("\n6️⃣ 测试搜索 GET /api/users/search");

      const result = userController.search("张", 5, {
        "content-type": "application/json",
        authorization: "Bearer token123",
      });

      console.log("   响应:", result);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("装饰器工作原理演示", () => {
    it("应该展示装饰器的工作原理", () => {
      console.log("\n⚙️ ===== 装饰器工作原理演示 =====\n");
      console.log("1️⃣ 装饰器执行时机:");
      console.log("   装饰器在类定义时就会执行，不是在实例化时");
      console.log("\n2️⃣ 元数据存储方式:");
      console.log("   装饰器将信息存储在类的元数据中");
      console.log("   使用 Symbol 作为键来避免冲突");
      console.log("\n3️⃣ 反射机制:");
      console.log("   通过 reflect-metadata 库获取类型信息");
      console.log("   可以在运行时分析类的结构");
      console.log("\n4️⃣ 装饰器组合:");
      console.log("   多个装饰器可以组合使用");
      console.log("   执行顺序是从下到上，从右到左");

      // 演示自定义装饰器
      function CustomLog(message: string) {
        return function (
          target: any,
          propertyKey: string,
          descriptor: PropertyDescriptor
        ) {
          console.log(
            `   自定义装饰器 @CustomLog("${message}") 被应用到 ${propertyKey} 方法`
          );
          const originalMethod = descriptor.value;

          descriptor.value = function (...args: any[]) {
            console.log(`   📝 ${message}: 方法 ${propertyKey} 开始执行`);
            const result = originalMethod.apply(this, args);
            console.log(`   📝 ${message}: 方法 ${propertyKey} 执行完成`);
            return result;
          };

          return descriptor;
        };
      }

      // 应用自定义装饰器
      class TestClass {
        @CustomLog("测试日志")
        testMethod() {
          console.log("   ✨ testMethod 内部逻辑执行");
          return "测试结果";
        }
      }

      console.log("\n5️⃣ 自定义装饰器测试:");
      const testInstance = new TestClass();
      const result = testInstance.testMethod();
      console.log("   最终结果:", result);

      expect(result).toBe("测试结果");
    });
  });

  it("总结学习内容", () => {
    console.log("\n✅ ===== 测试完成 =====");
    console.log("📖 通过这个测试，你应该了解了:");
    console.log("   • @Controller - 标记控制器类并设置路由前缀");
    console.log("   • @Injectable - 标记可注入的服务类");
    console.log("   • @Get/@Post/@Put/@Delete/@Patch - HTTP 方法装饰器");
    console.log(
      "   • @Body/@Query/@Param/@Header/@Context/@Request/@Response - 参数装饰器"
    );
    console.log(
      "   • @UseGuards/@UseInterceptors/@UsePipes/@UseMiddleware - 功能装饰器"
    );
    console.log("   • MetadataStorage - 元数据存储和获取");
    console.log("   • ReflectionUtils - 反射工具类");
    console.log("\n🎓 现在你可以开始使用这些装饰器构建你的应用了！");
  });
});
