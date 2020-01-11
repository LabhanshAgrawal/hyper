import type {Server} from './rpc';
import Tab from './win/tab';
import _Session from './session';

declare module 'electron' {
  interface App {
    config: typeof import('./config');
    plugins: typeof import('./plugins');
    getWindows: () => Set<BrowserWindow>;
    getLastFocusedWindow: () => BrowserWindow | null;
    windowCallback?: (win: BrowserWindow) => void;
    createWindow: (
      fn?: (win: BrowserWindow) => void,
      options?: {size?: [number, number]; position?: [number, number]}
    ) => BrowserWindow;
    setVersion: (version: string) => void;
  }

  // type Server = import('./rpc').Server;
  interface BrowserWindow {
    uid: string;
    sessions: Map<string, _Session>;
    focusTime: number;
    clean: () => void;
    rpc: Server;
    tabs: Set<Tab>;
    onDeleteTab: (tab: Tab) => void;
    restoreTabs: (tabs: Tab[]) => void;
    onTab: (opts: any, recorded: any) => void;
    reopenLastSession: () => void;
    record: (fn: any) => void;
  }
}
