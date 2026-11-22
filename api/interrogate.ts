import { processInterrogation } from '../src/server/interrogateLogic';
import type { InterrogateApiRequest } from '../src/types/game';

interface ServerlessReq {
  method?: string;
  body?: unknown;
}

interface ServerlessRes {
  status: (code: number) => ServerlessRes;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: ServerlessReq, res: ServerlessRes) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Yalnız POST sorğusu qəbul edilir.' });
    return;
  }

  let body: Partial<InterrogateApiRequest> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body) as Partial<InterrogateApiRequest>;
    } catch {
      res.status(400).json({ error: 'Sorğu gövdəsi etibarlı JSON deyil.' });
      return;
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body as Partial<InterrogateApiRequest>;
  }

  const result = await processInterrogation(body);
  res.status(result.status).json(result.body);
}
