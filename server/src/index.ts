import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { verifyToken } from './services/auth.service';
import { addClient, removeClient } from './websockets/broadcast';

const app = createApp();
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ server, path: '/ws' });

const defaultPort = Number(process.env.PORT ?? 3001);
const defaultHost = process.env.HOST ?? 'localhost';

webSocketServer.on('connection', (webSocket, req: http.IncomingMessage) =>
{
  const host = req.headers.host ?? `${defaultHost}:${defaultPort}`;
  const token = new URL(req.url ?? '', `http://${host}`).searchParams.get('token');

  if (!token)
  {
    webSocket.close(4001, 'Authentifizierung erforderlich.');
    return;
  }

  try
  {
    verifyToken(token);
  }
  catch
  {
    webSocket.close(4001, 'Ungültiges Token.');
    return;
  }

  addClient(webSocket);
  webSocket.on('close', () => removeClient(webSocket));
  webSocket.on('error', () => removeClient(webSocket));
});

server.listen(defaultPort, () =>
{
  console.log(`API server running on http://${defaultHost}:${defaultPort}`);
  console.log(`WebSocket server on path /ws`);
});
