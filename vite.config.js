import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  root: 'src',
  base: command === 'build' ? '/skillWorkBenchDemo/' : '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
}))
