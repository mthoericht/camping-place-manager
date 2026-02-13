import type { WebSocket } from 'ws'

const clients = new Set<WebSocket>()

export function addClient(ws: WebSocket)
{
  clients.add(ws)
}

export function removeClient(ws: WebSocket)
{
  clients.delete(ws)
}

export function broadcast(data: object)
{
  const message = JSON.stringify(data)
  for (const ws of clients)
  {
    if (ws.readyState === 1)
      ws.send(message)
  }
}
