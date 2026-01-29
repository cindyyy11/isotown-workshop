import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT) || 5175;
  const serverPort = Number(env.SERVER_PORT) || 5176;

  return {
    plugins: [react()],
    server: {
      port,
      open: true,
      proxy: {
        '/server': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
