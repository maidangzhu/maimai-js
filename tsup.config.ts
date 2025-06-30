import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  minify: false,
  external: [
    // 排除所有workspace依赖
    /^@maimai\//
  ]
}) 