import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

import AutoImport from 'unplugin-auto-import/vite'

import { getSrcPath } from '../utils'

export default function unplugin(viteEnv) {
  const { VITE_ICON_PREFIX = 'icon', VITE_ICON_LOCAL_PREFIX = 'icon-local' } = viteEnv
  const srcPath = getSrcPath()
  const localIconPath = `${srcPath}/assets/svg-icon`

  /** 本地svg图标集合名称 */
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, '')
  return [
    // 配置自动导入 vue相关函数, uni-app相关函数。ref, reactive，onLoad等
    AutoImport({
      imports: ['vue', '@vueuse/core', 'uni-app'],
      dts: 'src/typings/auto-imports.d.ts',
    }),
    Icons({
      compiler: 'vue3',
      customCollections: {
        [collectionName]: FileSystemIconLoader(localIconPath, svg =>
          svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')),
      },
      scale: 1,
      defaultClass: 'inline-block',
    }),
    Components({
      resolvers: [
        IconsResolver({
          customCollections: [collectionName],
          componentPrefix: VITE_ICON_PREFIX,
        }),
      ],
    }),
    createSvgIconsPlugin({
      iconDirs: [localIconPath],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: 'body-last',
      customDomId: '__SVG_ICON_LOCAL__',
    }),
  ]
}
