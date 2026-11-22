import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processInterrogation } from './src/server/interrogateLogic.ts';
import type { InterrogateApiRequest } from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/interrogate', async (req, res) => {
    const body = (req.body || {}) as Partial<InterrogateApiRequest>;
    const result = await processInterrogation(body);
    res.status(result.status).json(result.body);
  });

  // Ensure unknown /api/* routes always return JSON instead of falling through to index.html
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API marşrutu tapılmadı.' });
  });

  // Ensure Express body-parser or unexpected middleware errors always return JSON
  app.use(
    (err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api')) {
        const message = err instanceof Error ? err.message : 'Server daxili xətası.';
        res.status(500).json({ error: message });
        return;
      }
      next(err);
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bakı Nuarı server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
