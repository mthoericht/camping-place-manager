import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { verifyToken } from './services/auth.service';
import { addClient, removeClient } from './ws/broadcast';

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req: http.IncomingMessage) =>
{
  const token = new URL(req.url ?? '', 'http://localhost').searchParams.get('token');

  if (!token)
  {
    ws.close(4001, 'Authentifizierung erforderlich.');
    return;
  }

  try
  {
    verifyToken(token);
  }
  catch
  {
    ws.close(4001, 'Ungültiges Token.');
    return;
  }

  addClient(ws);
  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () =>
{
  console.log(`API server running on http://localhost:${port}`);
  console.log(`WebSocket server on path /ws`);
});
