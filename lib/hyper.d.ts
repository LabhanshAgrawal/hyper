import Client from './utils/rpc';

declare global {
  interface Window {
    __rpcId: string;
    rpc: Client;
    focusActiveTerm: (uid?: string) => void;
  }
}
