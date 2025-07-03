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
} from "./packages/core/src";

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

// 演示守卫类
class AuthGuard {
  canActivate(context: any): boolean {
    console.log("🛡️ AuthGuard: 检查用户认证状态");
    return true; // 简化演示，总是返回 true
  }
}

class RoleGuard {
  canActivate(context: any): boolean {
    console.log("🛡️ RoleGuard: 检查用户角色权限");
    return true; // 简化演示，总是返回 true
  }
}

// 演示拦截器类
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

// 演示管道类
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

// 演示中间件类
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

// 演示控制器类 - 使用所有装饰器
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

// 测试函数 - 分析装饰器元数据
function analyzeDecoratorMetadata() {
  console.log("\n🔍 ===== 装饰器元数据分析 =====\n");

  // 1. 分析 UserService
  console.log("1️⃣ 分析 UserService 类:");
  console.log("   是否可注入:", ReflectionUtils.isInjectable(UserService));
  console.log("   是否控制器:", ReflectionUtils.isController(UserService));
  console.log(
    "   构造函数参数类型:",
    ReflectionUtils.getConstructorParameterTypes(UserService)
  );

  // 2. 分析 UserController
  console.log("\n2️⃣ 分析 UserController 类:");
  console.log("   是否可注入:", ReflectionUtils.isInjectable(UserController));
  console.log("   是否控制器:", ReflectionUtils.isController(UserController));

  // 获取控制器元数据
  const controllerMetadata =
    MetadataStorage.getControllerMetadata(UserController);
  console.log("   控制器元数据:", controllerMetadata);

  // 获取路由元数据
  const routesMetadata = MetadataStorage.getRoutesMetadata(UserController);
  console.log("   路由数量:", routesMetadata?.length || 0);

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
        paramsMetadata.forEach((param: ParamMetadata, paramIndex: number) => {
          console.log(`       参数 ${paramIndex + 1}:`, {
            索引: param.index,
            类型: param.type,
            键: param.key,
            管道: param.pipe?.name || param.pipe,
          });
        });
      }
    });
  }

  // 3. 获取类级别的装饰器
  console.log("\n3️⃣ 类级别装饰器:");
  const classGuards = MetadataStorage.getClassMetadata(
    Symbol("maimai:guards"),
    UserController
  );
  const classInterceptors = MetadataStorage.getClassMetadata(
    Symbol("maimai:interceptors"),
    UserController
  );
  const classPipes = MetadataStorage.getClassMetadata(
    Symbol("maimai:pipes"),
    UserController
  );
  const classMiddleware = MetadataStorage.getClassMetadata(
    Symbol("maimai:middleware"),
    UserController
  );

  console.log("   类守卫:", classGuards?.map((g: any) => g.name) || []);
  console.log("   类拦截器:", classInterceptors?.map((i: any) => i.name) || []);
  console.log("   类管道:", classPipes?.map((p: any) => p.name) || []);
  console.log("   类中间件:", classMiddleware?.map((m: any) => m.name) || []);

  // 4. 验证装饰器配置
  console.log("\n4️⃣ 装饰器配置验证:");
  const validation = ReflectionUtils.validateDecorators(UserController);
  console.log("   配置有效:", validation.isValid);
  if (validation.errors.length > 0) {
    console.log("   错误:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.log("   警告:", validation.warnings);
  }

  // 5. 获取方法名列表
  console.log("\n5️⃣ 控制器方法:");
  const methodNames = ReflectionUtils.getMethodNames(UserController);
  console.log("   方法列表:", methodNames);

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

  // 6. 展示完整的元数据结构
  console.log("\n6️⃣ 完整元数据结构:");
  const allMetadata = ReflectionUtils.getAllMetadata(UserController);
  console.log("   所有元数据键:", Object.keys(allMetadata));

  Object.entries(allMetadata).forEach(([key, value]) => {
    if (key.includes("maimai")) {
      console.log(`   ${key}:`, value);
    }
  });
}

// 模拟 HTTP 请求测试
function simulateHttpRequests() {
  console.log("\n🌐 ===== 模拟 HTTP 请求测试 =====\n");

  const userService = new UserService();
  const userController = new UserController(userService);

  // 模拟请求上下文
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

  console.log("1️⃣ 测试 GET /api/users");
  try {
    const result1 = userController.findAll(
      { limit: "10", page: "1" },
      "Mozilla/5.0 (Test Browser)"
    );
    console.log("   响应:", result1);
  } catch (error) {
    console.log("   错误:", error);
  }

  console.log("\n2️⃣ 测试 GET /api/users/1");
  try {
    const result2 = userController.findOne(1, mockContext as HttpContext);
    console.log("   响应:", result2);
  } catch (error) {
    console.log("   错误:", error);
  }

  console.log("\n3️⃣ 测试 POST /api/users");
  try {
    const newUser = { name: "王五", email: "wangwu@example.com" };
    const result3 = userController.create(newUser, mockContext.request);
    console.log("   响应:", result3);
  } catch (error) {
    console.log("   错误:", error);
  }

  console.log("\n4️⃣ 测试 PUT /api/users/1");
  try {
    const updateData = { name: "张三三", email: "zhangsan3@example.com" };
    const result4 = userController.update(
      "1",
      updateData,
      mockContext.response
    );
    console.log("   响应:", result4);
  } catch (error) {
    console.log("   错误:", error);
  }

  console.log("\n5️⃣ 测试 DELETE /api/users/2");
  try {
    const result5 = userController.remove("2");
    console.log("   响应:", result5);
  } catch (error) {
    console.log("   错误:", error);
  }

  console.log("\n6️⃣ 测试搜索 GET /api/users/search");
  try {
    const result6 = userController.search("张", 5, {
      "content-type": "application/json",
      authorization: "Bearer token123",
    });
    console.log("   响应:", result6);
  } catch (error) {
    console.log("   错误:", error);
  }
}

// 装饰器工作原理演示
function demonstrateDecoratorWorkings() {
  console.log("\n⚙️ ===== 装饰器工作原理演示 =====\n");

  // 展示装饰器如何修改类和方法
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
}

// 主测试函数
function runAllTests() {
  console.log("🚀 ===== Maimai Core 装饰器学习测试 =====");
  console.log("📚 这个测试将展示 @/core 包中所有装饰器的使用方法\n");

  try {
    // 1. 分析装饰器元数据
    analyzeDecoratorMetadata();

    // 2. 模拟 HTTP 请求
    simulateHttpRequests();

    // 3. 演示装饰器工作原理
    demonstrateDecoratorWorkings();

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
  } catch (error) {
    console.error("❌ 测试过程中出现错误:", error);
  }
}

// 导出测试函数
export { runAllTests };

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runAllTests();
}
