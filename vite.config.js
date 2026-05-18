import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/anixinwo.project/' : '/',
  plugins: [
    react(),
    svgr(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd() , 'src/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  css:{
    preprocessorOptions:{
      scss:{
        quietDeps:true,
        silenceDeprecations:[
          'import',
          'global-builtin',
          'if-function',
          'color-functions'
        ]
      }
    }
  }
});