import {ipcRenderer} from 'electron';
import {pluginsMain} from '../hyper';

export async function getConfig() {
  return (await ipcRenderer.invoke('getDecoratedConfig')) as ReturnType<pluginsMain['getDecoratedConfig']>;
}

export function subscribe(fn: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
