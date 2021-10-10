import type { ComponentType, ReactNode } from 'react';

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
  renderMockup?: (params: {
    title: string;
    Component: ComponentType<any>;
    navigate: (path: keyof T) => void;
  }) => ReactNode;
}
