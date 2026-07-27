import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  let apiTarget = env.VITE_API_URL || 'https://cdpawn-production.up.railway.app';

  // Tự động chuyển HTTP -> HTTPS cho server Production trên Railway để tránh 301 Redirect gây lỗi CORS
  if (apiTarget.startsWith('http://') && apiTarget.includes('railway.app')) {
    apiTarget = apiTarget.replace('http://', 'https://');
  }

  // Tự động cập nhật file vercel.json để rewrite route /api/* theo đúng VITE_API_URL từ .env
  const cleanApiTarget = apiTarget.replace(/\/+$/, '');
  try {
    const vercelJsonPath = path.resolve(__dirname, 'vercel.json');
    const vercelConfig = {
      rewrites: [
        {
          source: "/api/:path*",
          destination: `${cleanApiTarget}/api/:path*`
        },
        {
          source: "/(.*)",
          destination: "/index.html"
        }
      ]
    };
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2) + '\n');
  } catch (err) {
    console.warn('Could not update vercel.json automatically:', err);
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})

