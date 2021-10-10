import { useEffect, useMemo, useRef, useState } from 'react';

export const formatMockupName = (path: string) => {
  // get file name from path
  const fileName = path.split('/').pop();
  return fileName;
};

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

export const useSortedMockups = (mockups: Record<string, NodeRequire>) => {
  return useMemo(
    () =>
      Object.keys(mockups)
        .map((mockup) => ({
          key: mockup,
          value: mockups[mockup],
          // @ts-ignore
          sortKey: mockups[mockup].title || formatMockupName(mockup),
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey)),
    [mockups]
  );
};