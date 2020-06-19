import {configOptions} from '../lib/config';
import {BrowserWindow, App} from 'electron';

export type hyperPlugin = {
  extendKeymaps?: any;
  onUnload: (app: App) => void;
  onWindowClass: (win: BrowserWindow) => void;
  onApp: (app: App) => void;
  onWindow: (win: BrowserWindow) => void;
  decorateConfig: (config: configOptions) => configOptions;
} & {
  _name: string;
  _version: string;
} & {
  [k: string]: <T>(arg: T) => T;
};
