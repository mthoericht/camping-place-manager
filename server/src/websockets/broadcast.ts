import type { WebSocket } from 'ws';

const websocketClients = new Set<WebSocket>();

export function addClient(webSocket: WebSocket)
{
  websocketClients.add(webSocket);
}

export function removeClient(webSocket: WebSocket)
{
  websocketClients.delete(webSocket);
}

export function broadcast(data: object)
{
  const message = JSON.stringify(data);
  for (const webSocket of websocketClients)
  {
    if (webSocket.readyState === 1)
    {
      webSocket.send(message);
    }
  }
}
