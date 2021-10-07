import logger from './logger';
import { Server, WebSocket } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

type Mockups = Array<{
  title: string;
  path: string;
  children?: Mockups;
}>;

type AppState = {
  has_synced: boolean;
  path: string | null;
  mockups: Mockups[];
};

export default function server(hostname = '127.0.0.1', port = 1337) {
  const wss = new Server({ noServer: true, path: '/websocket' });

  const httpServer = http.createServer();

  httpServer.on('upgrade', (req, socket, head) => {
    // @ts-ignore
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  httpServer.on('request', (_req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    const file = fs.readFileSync(
      path.resolve(__dirname, './server.html'),
      'utf8'
    );
    res.write(
      file
        .replace('{{state}}', JSON.stringify(state.app))
        .replace('{{host}}', hostname.toString())
        .replace('{{port}}', port.toString())
    );
    res.end();
  });

  httpServer.listen(port, hostname, () => {
    logger.info(`Mockup server running at http://${hostname}:${port}/`);
  });

  const state = {
    clients: [] as WebSocket[],
    app: {
      path: '',
      has_synced: false,
      mockups: [],
    } as AppState,
  };

  wss.on('connection', (ws) => {
    state.clients.push(ws);

    // Remove the client from the list of connected clients
    ws.on('close', () => {
      state.clients = state.clients.filter((client) => client !== ws);
    });

    ws.on('message', (message) => {
      if (typeof message !== 'string') {
        return;
      }

      const data = JSON.parse(message);

      switch (data.type) {
        // When IDE clients try to connect to the server, send back app state
        case 'PING': {
          if (state.app.has_synced) {
            ws.send(JSON.stringify({ type: 'SYNC_STATE', payload: state.app }));
          }
          break;
        }
        // When the app client connects, store the current state & update IDE clients
        case 'UPDATE_STATE': {
          state.app = {
            ...(data.payload as AppState),
            has_synced: true,
          };
          // Update clients
          for (const client of state.clients.filter((c) => c !== ws)) {
            client.send(
              JSON.stringify({ type: 'SYNC_STATE', payload: state.app })
            );
          }
          break;
        }
        case 'NAVIGATE': {
          state.app.path = data.payload as string;
          // Update both IDE & app clients (except the one that sent the message)
          for (const client of state.clients.filter((c) => c !== ws)) {
            client.send(
              JSON.stringify({ type: 'NAVIGATE', payload: state.app.path })
            );
          }
          break;
        }
      }
    });
  });
}
