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
  Wrapper?: MockupWrapperComponent;
}

export type MockupWrapperProps = {
  title: string;
  path: string;
  Component: ComponentType<any>;
  navigate: (path: string | null) => void;
};

export type MockupWrapperComponent = FunctionComponent<MockupWrapperProps>;
