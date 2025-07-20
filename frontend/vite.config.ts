import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://3.34.159.207:8080",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxy request:', req.method, req.url, '-> ', proxyReq.path);
            
            // 문제가 될 수 있는 브라우저 헤더들 제거
            proxyReq.removeHeader('sec-fetch-site');
            proxyReq.removeHeader('sec-fetch-mode');
            proxyReq.removeHeader('sec-fetch-dest');
            proxyReq.removeHeader('sec-ch-ua');
            proxyReq.removeHeader('sec-ch-ua-mobile');
            proxyReq.removeHeader('sec-ch-ua-platform');
            
            // Origin 헤더를 서버 주소로 변경
            proxyReq.setHeader('origin', 'http://3.34.159.207:8080');
            proxyReq.removeHeader('referer');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, req.url);
            console.log('📥 Proxy response:', proxyRes);
          });
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
          });
        },
      },
    },
  },
})
