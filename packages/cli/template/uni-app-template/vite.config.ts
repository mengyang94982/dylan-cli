import { defineConfig, loadEnv } from 'vite'
import { setupVitePlugins } from './build'

// import { wrapperEnv, createProxy } from './build'

// https://vitejs.dev/config/
export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, `${process.cwd()}/env`)
  return {
    plugins: setupVitePlugins(viteEnv),
    envDir: 'env',
    server: {
      host: '0.0.0.0',
      port: 3300,
      open: true
    }
  }
})
