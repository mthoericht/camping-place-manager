import 'dotenv/config';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { addClient, removeClient } from './ws/broadcast';

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) =>
{
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
