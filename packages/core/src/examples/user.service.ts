import {
  Controller,
  Injectable,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors
} from "../index";

// 示例 DTO 类型
interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// 示例守卫
class AuthGuard {
  canActivate(): boolean {
    return true; // 简化示例
  }
}

// 示例拦截器
class LoggingInterceptor {
  intercept(context: any, next: () => Promise<any>): Promise<any> {
    console.log('请求开始');
    return next().then(result => {
      console.log('请求结束');
      return result;
    });
  }
}

/**
 * 用户服务抽象类
 * 定义用户相关操作的接口
 */
@Injectable()
export abstract class UserService {
  @Get()
  abstract findAll(@Query('page') page?: number, @Query('limit') limit?: number): Promise<User[]>;

  @Get('/:id')
  @UseGuards(AuthGuard)
  abstract findOne(@Param('id') id: string): Promise<User>;

  @Post()
  @UseInterceptors(LoggingInterceptor)
  abstract create(@Body() userData: CreateUserDto): Promise<User>;

  @Put('/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(LoggingInterceptor)
  abstract update(@Param('id') id: string, @Body() userData: UpdateUserDto): Promise<User>;

  @Delete('/:id')
  @UseGuards(AuthGuard)
  abstract remove(@Param('id') id: string): Promise<{ deleted: boolean }>;
}

/**
 * 用户控制器
 * 展示控制器级别的装饰器使用
 */
@Controller('/api/users')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class UserController {
  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return {
      users: [],
      pagination: { page: page || 1, limit: limit || 10 }
    };
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      createdAt: new Date()
    };
  }

  @Post()
  create(@Body() userData: CreateUserDto) {
    return {
      id: 'new-user-id',
      ...userData,
      createdAt: new Date()
    };
  }

  @Put('/:id')
  update(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    return {
      id,
      name: 'Updated Name',
      email: 'updated@example.com',
      age: 25,
      createdAt: new Date(),
      ...userData
    };
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return { deleted: true, id };
  }
} 