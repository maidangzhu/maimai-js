import type { 
  MaimaiConfig, 
  MaimaiApp, 
  Plugin, 
  RouteHandler, 
  MiddlewareHandler,
  Context
} from '@maimai/types'

export class Maimai implements MaimaiApp {
  public config: MaimaiConfig
  public plugins: Map<string, Plugin> = new Map()
  public routes: Map<string, RouteHandler> = new Map()
  public middlewares: Map<string, MiddlewareHandler> = new Map()

  constructor(config: MaimaiConfig = {}) {
    this.config = this.mergeConfig(config)
  }

  private mergeConfig(userConfig: MaimaiConfig): MaimaiConfig {
    const defaultConfig: MaimaiConfig = {
      server: {
        port: 3000,
        host: '0.0.0.0',
        cors: {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          headers: ['Content-Type', 'Authorization']
        },
        middleware: []
      },
      plugins: [],
      logger: {
        level: 'info',
        format: 'text',
        output: 'console'
      }
    }

    return {
      ...defaultConfig,
      ...userConfig,
      server: {
        ...defaultConfig.server,
        ...userConfig.server
      },
      logger: {
        ...defaultConfig.logger,
        ...userConfig.logger
      }
    }
  }

  use(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already installed`)
    }
    
    this.plugins.set(plugin.name, plugin)
    plugin.install(this)
  }

  route(method: string, path: string, handler: RouteHandler): void {
    const key = `${method.toUpperCase()}:${path}`
    this.routes.set(key, handler)
  }

  middleware(name: string, handler: MiddlewareHandler): void {
    this.middlewares.set(name, handler)
  }

  async listen(port?: number): Promise<void> {
    const serverPort = port || this.config.server?.port || 3000
    // This will be implemented by the server package
    throw new Error('listen method should be implemented by @maimai/server package')
  }

  // HTTP method helpers
  get(path: string, handler: RouteHandler): void {
    this.route('GET', path, handler)
  }

  post(path: string, handler: RouteHandler): void {
    this.route('POST', path, handler)
  }

  put(path: string, handler: RouteHandler): void {
    this.route('PUT', path, handler)
  }

  delete(path: string, handler: RouteHandler): void {
    this.route('DELETE', path, handler)
  }

  patch(path: string, handler: RouteHandler): void {
    this.route('PATCH', path, handler)
  }
}

// Factory function for creating Maimai instances
export function createApp(config?: MaimaiConfig): Maimai {
  return new Maimai(config)
}

// Export all types from @maimai/types
export * from '@maimai/types'

// Version
export const VERSION = '0.1.0' 