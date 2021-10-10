import type { ComponentType, FunctionComponent } from 'react';

export type FileMap = Record<string, NodeRequire>;

export interface MockupBaseProps<T extends FileMap> {
  /** Initial path when mounting */
  initialPath?: keyof T;
  /** List of mockups */
  mockups: T;
  /** When a navigation occurs */
  onNavigate?: (path: keyof T | null) => void;
  /** Websocket server path (e.g. "localhost:1337") */
  server?: string;
  /** Wrapper component to render a mockup component */
  Wrapper?: MockupWrapperComponent<T>;
}

export type MockupWrapperComponent<T extends FileMap> = FunctionComponent<{
  title: string;
  path: keyof T;
  Component: ComponentType<any>;
  navigate: (path: keyof T | null) => void;
}>;
