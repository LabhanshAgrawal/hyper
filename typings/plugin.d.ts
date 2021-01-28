import {ITermState, uiState, sessionState, HyperActions} from './hyper';

export type ITermGroupReducer = Reducer<ITermState, HyperActions>;

export type IUiReducer = Reducer<uiState, HyperActions>;

export type ISessionReducer = Reducer<sessionState, HyperActions>;

import {configOptions} from './config';
import {BrowserWindow, App} from 'electron';

import {Middleware, Reducer} from 'redux';

export type hyperPlugin = {
  getTabProps: any;
  getTabsProps: any;
  getTermGroupProps: any;
  getTermProps: any;
  mapHeaderDispatch: any;
  mapHyperDispatch: any;
  mapHyperTermDispatch: any;
  mapNotificationsDispatch: any;
  mapTermsDispatch: any;
  mapHeaderState: any;
  mapHyperState: any;
  mapHyperTermState: any;
  mapNotificationsState: any;
  mapTermsState: any;
  middleware: Middleware;
  onRendererUnload: any;
  onRendererWindow: any;
  reduceSessions: ISessionReducer;
  reduceTermGroups: ITermGroupReducer;
  reduceUI: IUiReducer;
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
  [k: string]: (<T>(arg: T, libs?: any) => T) & {_pluginName: string; _pluginVersion: string};
};
