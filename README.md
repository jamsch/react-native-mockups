# @jamsch/react-native-mockups

[![npm version](https://badge.fury.io/js/@jamsch%2Freact-native-mockups.svg)](https://badge.fury.io/js/@jamsch%2Freact-native-mockups)

react-native-mockups is a lean (no runtime dependencies) alternative to Storybook that provides a similar API with CLI & IDE tooling for React & React Native to develop your components in isolation. It's primary goal is to be easily integrated in to your web & native projects (as a regular component) without requiring any custom build tools.

![preview](https://i.imgur.com/ZwRJOd8.gif)

## Installation

```sh
npm install -S @jamsch/react-native-mockups
```

## CLI

This library makes heavy use of a `mockups.js` file to load your components. The spec of a `mockups.js` file is the following:

```js
// mockups.js
export default {
  './path/to/mockup.js': require('./path/to/mockup.js'),
  // etc...
};
```

This package includes a CLI tool that finds all `*.mockup.js/ts/tsx` files in your project to generate a `mockups.js` file. You can configure it as a CLI argument or through `package.json`

### Configuring through `package.json`

1. Add a `config` key with the following options:

```json
// package.json
{
  "scripts": {
    "mockup:generate": "react-native-mockups generate"
  },
  "config": {
    "react-native-mockups": {
      "searchDir": ["./src"],
      "pattern": "**/*.mockup.tsx",
      "outputFile": "./src/mockups.ts",
      // (optional) Server options
      "port": "1337",
      "host": "127.0.0.1"
    }
  }
}
```

2. Run `npm run mockup:generate` to generate the `mockups.ts` file.

### CLI arguments

Alternatively, you can call the CLI directly in case you'd like to generate multiple mockup files for various parts of your app.

```sh
react-native-mockups [options]

Commands:
  react-native-mockups server [-p 1337]  Start the server
  react-native-mockups generate          Generate the mockups file

Options:
  --version     Show version number                                       [boolean]
  --help        Show help                                                 [boolean]
```

```sh
react-native-mockups generate

Generate the mockups file

Options:
  --searchDir    The directory or directories, relative to the project root, to
                 search for files in.                                    [array]
  --pattern      Pattern to search the search directories with. Note: if pattern
                 contains '**/*' it must be escaped with quotes         [string]
  --outputFile   Path to the output file.                               [string]
  --startServer  Starts the server                                     [boolean]
  --debug        Sets log level to debug                               [boolean]
  --silent       Silences all logging                                  [boolean]
```

```sh
react-native-mockups server [-p 1337]

Start the server

Options:
  -p, --port     Port to listen on                      [number] [default: 1337]
  -h, --host     Hostname                        [string] [default: "127.0.0.1"]
```

## Basic Usage

1. Create a file in your project, ending in **\*.mockup.jsx/tsx**

```tsx
// Button.mockup.jsx
import React from 'react';
import { Button, View } from 'react-native';

export default {
  // What will be displayed on the root view
  title: 'Buttons',
  // What will be rendered when selected
  component: () => {
    return (
      <View>
        <Button title="Red button" style={{ backgroundColor: 'red' }} />
        <Button title="Blue button" style={{ backgroundColor: 'blue' }} />
      </View>
    );
  },
};
```

2. Run the CLI to generate your `mockups` file (or create one yourself using the spec above)
3. Create a component that imports `MockupRoot` and provide it the list of `mockups`

```jsx
// MockupApp.jsx
import React from 'react';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups'; // your generated file

export default function MockupApp() {
  return <MockupRoot mockups={mockups} />;
}
```

4. Render the component anywhere in your app.

> Tip: For react-native projects you can conditionally load your Mockup view as the app root using `babel-plugin-transform-inline-environment-variables`, for example:

```js
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['transform-inline-environment-variables'],
};
```

```json
// package.json
"scripts": {
  "start": "react-native start",
  "mockup": "cross-env MOCKUP=true npm start",
  "premockup": "react-native-mockups"
}
```

```js
// index.js
import App from './src/App';

if (process.env.MOCKUP) {
  const MockupApp = require('./src/MockupApp').default;
  AppRegistry.registerComponent('RnDiffApp', () => MockupApp);
} else {
  AppRegistry.registerComponent('RnDiffApp', () => App);
}
```

## TypeScript usage

You can import `Meta` to help assist typechecking exports on `*.mockup.tsx` files

```tsx
// Button.mockup.tsx
import React from 'react';
import { Button, View } from 'react-native';
import type { Meta } from '@jamsch/react-native-mockups';

export default {
  // What will be displayed on the root view
  title: 'Buttons',
  // What will be rendered when selected
  component: () => {
    return (
      <View>
        <Button title="Red button" style={{ backgroundColor: 'red' }} />
        <Button title="Blue button" style={{ backgroundColor: 'blue' }} />
      </View>
    );
  },
} as Meta;
```

## Persisting last viewed mockup across refreshes

In case you'd like to persist the same mockup view across refreshes, you'd probably want to use a package like `@react-native-async-storage/async-storage` to store the path. Here's a quick recipe.

```jsx
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups'; // your generated file

const STORAGE_KEY = 'MOCKUP_INITIAL_PATH';

export default function MockupApp() {
  const [initialPath, setInitialPath] = useState(null);

  // Load from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((path) => {
        setInitialPath(path || '');
      })
      .catch(() => setInitialPath(''));
  }, []);

  // Wait till we've tried to fetch from AsyncStorage
  if (typeof initialPath !== 'string') {
    return null;
  }

  // Render the view
  return (
    <MockupRoot
      mockups={mockups}
      // When a navigation occurs, store the path in AsyncStorage
      onNavigate={(path) => {
        if (path) {
          AsyncStorage.setItem(STORAGE_KEY, path);
        } else {
          // The user may navigate back to the root
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }}
      // Initial component to render
      initialPath={initialPath}
    />
  );
}
```

## Configuring Mockup Item layout

```jsx
// MockupApp.jsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups'; // your generated file

export default function MockupApp() {
  return (
    <MockupRoot
      mockups={mockups}
      // Customise the item to render
      renderItem={({ path, navigate, title }) => {
        return (
          <Pressable
            key={path}
            onPress={() => navigate(path)}
            android_ripple={{ borderless: false }}
          >
            <Text>Mockup: {title}</Text>
          </Pressable>
        );
      }}
    />
  );
}
```

## MockupRoot props

```ts
{
 /** Initial path when mounting */
  initialPath?: string;
  /** List of mockups */
  mockups: Record<string, NodeRequire>;
  /** When a navigation occurs */
  onNavigate?: (path: string | null) => void;
  /** Customise item rendering */
  renderItem?: (params: {
    path: string;
    title: string;
    navigate: (path: string) => void;
  }) => React.ReactNode;
  /** Wrapper component to render a mockup component. Tip: call `navigate(null)` to navigate back to the root */
  Wrapper?: FunctionComponent<{
    title: string;
    path: string;
    Component: ComponentType<any>;
    navigate: (path: string | null) => void;
  }>;
  /** Path to websocket server */
  server?: string;
}
```

## Running the preview server

`react-native-mockups` includes a tiny Node.js http & websocket server to allow for integration with IDE tooling (VS code extensions) & web apps.

Preview:

![mockup-server-preview](https://i.imgur.com/D9TCc4D.gif)

1. Run `react-native-mockups server` (or `npm run mockups:server` as shown below) to start the server

```json
// package.json
{
  "scripts": {
    "mockups:server": "react-native-mockups server",
    // alternatively, run server & your app using the same command
    "dev": "npm-run-all --parallel mockups:server start"
  }
}
```

2. Add `server="[host]:[port]"` to `MockupRoot`

```tsx
import React from 'react';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups';

export default function App() {
  return (
    <MockupRoot
      mockups={mockups}
      server="localhost:1337" // path to your server
    />
  );
}
```

> Note: for Android devices, you'll likely need to run the following command in order to connect to the websocket server.

```sh
adb reverse tcp:1337 tcp:1337
```

## VS Code extension

You can install the following VS Code extension if you'd like to navigate between mockup files in your local codebase and on your app. You'll need to be running the Mockup server (`react-native-mockups server`) to use this extension.

- Repository: https://github.com/jamsch/react-native-mockups-explorer-vscode
- Visual Studio Marketplace: https://marketplace.visualstudio.com/items?itemName=jamsch.react-native-mockups-explorer-vscode

## The websocket server API

If you'd like to create your own IDE tooling, here's a quick starter.

```ts
/*
type Mockup = {
  title: string;
  path: string;
  children?: Mockup[];
};
*/

let state = {
  /** Whether the server has synced with any app client */
  has_synced: false,
  /** {string|null} Current mockup by full path */
  path: null,
  /** {Mockup[]} List of all mockups */
  mockups: [];
}

function createWebsocket() {
  // Connect to websocket server
  const websocket = new WebSocket('ws://localhost:1337/websocket');

  websocket.onopen = () => {
    // Ping the server to get the initial state
    websocket.send(JSON.stringify({ type: 'PING' }));
  };

  websocket.onclose = () => {
    // Notify user that they've lost connection to the mockup server
    // call reconnect() once confirming with the user
  };

  websocket.onerror = (error) => {
    // Notify user that they've failed to connect to the server
    // call reconnect() once confirming with the user
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      // Once an app client has connected, you'll get a "SYNC_STATE" message
      case 'SYNC_STATE': {
        state = message.payload;
        /* {
            type: "SYNC_STATE",
            payload: {
              has_synced: boolean,
              path: string; // Current path
              mockups: Mockup[];
            }>
          }*/
        break;
      }
      case 'NAVIGATE': {
        // { type: "NAVIGATE", payload: "/path/to/components/ui/Button.tsx" }
        state.path = message.payload;
        break;
      }
    }
  };

  return websocket;
}

// create a websocket in some context (preferably in a class)
global.websocket = createWebsocket();

const reconnect = () => {
    // Reset event listeners to avoid duplicate messages
    global.websocket.onclose = () => {};
    global.websocket.close();
    global.websocket = createWebsocket();
    // Re-render your UI
    // render()
  }
}

const onButtonPress = (mockup) => {
  // Navigate to a mockup. This will be broadcasted to all clients
  // mockup: { title: 'Button', path: './components/ui/Button.tsx' }
  const message = { type: 'NAVIGATE', payload: mockup.path };
  ws.send(JSON.stringify(message));
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
