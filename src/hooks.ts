import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

export const useWebsocket = (
  server: string,
  onMessage: (message: Record<string, unknown>) => void
) => {
  const socket = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (!server) {
      return;
    }
    setConnected(false);

    const ws = new WebSocket(`ws://${server}/websocket`);
    socket.current = ws;
    ws.onopen = () => {
      setConnected(true);
    };
    ws.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
    ws.onerror = (event) => {
      if (event.message) {
        console.warn(
          `[react-native-mockups] Failed to connect to WebSocket server. Please make sure that you've ran "react-native-mockups server".
Error: `,
          event
        );
      }
    };
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server]);

  return {
    socket,
    connected,
  };
};

/** Uses global navigation ref instead of relative navigation ref */
export function useHandleBack(callback: () => boolean) {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', callback);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', callback);
    };
  }, [callback]);
}
