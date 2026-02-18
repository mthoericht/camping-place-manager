import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/store';
import {
  receiveBookingFromWebSocket,
  receiveBookingDeletedFromWebSocket,
} from '@/store/bookingsSlice';
import {
  receiveCampingPlaceFromWebSocket,
  receiveCampingPlaceDeletedFromWebSocket,
} from '@/store/campingPlacesSlice';
import {
  receiveCampingItemFromWebSocket,
  receiveCampingItemDeletedFromWebSocket,
} from '@/store/campingItemsSlice';
import type { AppDispatch } from '@/store/store';

export type WebSocketMessage =
  | { type: 'bookings/created' | 'bookings/updated'; payload: import('@/api/types').Booking }
  | { type: 'bookings/deleted'; payload: { id: number } }
  | { type: 'campingPlaces/created' | 'campingPlaces/updated'; payload: import('@/api/types').CampingPlace }
  | { type: 'campingPlaces/deleted'; payload: { id: number } }
  | { type: 'campingItems/created' | 'campingItems/updated'; payload: import('@/api/types').CampingItem }
  | { type: 'campingItems/deleted'; payload: { id: number } }

export function handleWebSocketMessage(msg: WebSocketMessage, dispatch: AppDispatch): void
{
  switch (msg.type)
  {
    case 'bookings/created':
    case 'bookings/updated':
      dispatch(receiveBookingFromWebSocket(msg.payload));
      break;
    case 'bookings/deleted':
      dispatch(receiveBookingDeletedFromWebSocket(msg.payload.id));
      break;
    case 'campingPlaces/created':
    case 'campingPlaces/updated':
      dispatch(receiveCampingPlaceFromWebSocket(msg.payload));
      break;
    case 'campingPlaces/deleted':
      dispatch(receiveCampingPlaceDeletedFromWebSocket(msg.payload.id));
      break;
    case 'campingItems/created':
    case 'campingItems/updated':
      dispatch(receiveCampingItemFromWebSocket(msg.payload));
      break;
    case 'campingItems/deleted':
      dispatch(receiveCampingItemDeletedFromWebSocket(msg.payload.id));
      break;
  }
}

function getWebSocketUrl(): string
{
  if (typeof window === 'undefined') return '';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export function useWebSocketSync()
{
  const dispatch = useAppDispatch();
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() =>
  {
    const url = getWebSocketUrl();
    if (!url) return;

    let webSocketConnection: WebSocket | null = null;
    let closed = false;

    const connect = () =>
    {
      webSocketConnection = new WebSocket(url);

      webSocketConnection.onmessage = (event) =>
      {
        //on strict mode, this will be called twice, so we need to check if the connection is closed
        if (closed) return;
        
        try
        {
          const msg = JSON.parse(event.data) as WebSocketMessage;
          handleWebSocketMessage(msg, dispatch);
        }
        catch
        {
          // ignore invalid messages
        }
      };

      webSocketConnection.onclose = () =>
      {
        webSocketConnection = null;
        if (!closed && typeof window !== 'undefined')
        {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      webSocketConnection.onerror = () =>
      {
        if (!closed) webSocketConnection?.close();
      };
    };

    connect();

    return () =>
    {
      closed = true;
      if (reconnectTimeoutRef.current)
      {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }
      if (webSocketConnection)
      {
        if (webSocketConnection.readyState === WebSocket.CONNECTING)
        {
          const ws = webSocketConnection;
          ws.onopen = () => ws.close();
          ws.onclose = () => {};
          ws.onerror = () => {};
          ws.onmessage = () => {};
        }
        else
        {
          webSocketConnection.close();
        }
      }
    };
  }, [dispatch]);
}
