import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";
import UnoCSS from "unocss/vite";
import { wrapperEnv } from "./build/getEnv";
import { createProxy } from "./build/proxy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "env");
  const viteEnv = wrapperEnv(env);
  return {
    plugins: [
      uni(),
      // 配置自动导入 vue相关函数, uni-app相关函数。ref, reactive，onLoad等
      AutoImport({
        imports: ["vue", "@vueuse/core", "uni-app"],
        dts: "./typings/auto-imports.d.ts",
      }),
      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      UnoCSS(),
    ],
    envDir: "env",
    server: {
      host: "0.0.0.0",
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      // Load proxy configuration from .env.development
      proxy: createProxy(viteEnv.VITE_PROXY),
    },
  };
});
