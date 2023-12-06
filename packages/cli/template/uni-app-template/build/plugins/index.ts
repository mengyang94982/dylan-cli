import uni from '@dcloudio/vite-plugin-uni'

import UnoCSS from 'unocss/vite'
import unplugin from './unplugin'

export function setupVitePlugins(viteEnv) {
  const plugins = [uni(), UnoCSS(), ...unplugin(viteEnv)]

  return plugins
}
