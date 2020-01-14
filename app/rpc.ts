// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {EventEmitter} from 'events';
import {ipcMain, BrowserWindow} from 'electron';
import {v4 as uuidv4} from 'uuid';

type ServerEvents =
  | 'init'
  | 'new'
  | 'exit'
  | 'maximize'
  | 'unmaximize'
  | 'minimize'
  | 'resize'
  | 'data'
  | 'info renderer'
  | 'open external'
  | 'open context menu'
  | 'open hamburger menu'
  | 'close'
  | 'command'
  | 'open file'
  | 'open ssh'
  | 'termgroup add req'
  | 'split request vertical'
  | 'split request horizontal'
  | 'termgroup close req'
  | 'session clear req'
  | 'term selectAll'
  | 'reload'
  | 'reset fontSize req'
  | 'increase fontSize req'
  | 'decrease fontSize req'
  | 'move left req'
  | 'move right req'
  | 'prev pane req'
  | 'next pane req'
  | 'session move word left req'
  | 'session move word right req'
  | 'session move line beginning req'
  | 'session move line end req'
  | 'session del word left req'
  | 'session del word right req'
  | 'session del line beginning req'
  | 'session del line end req'
  | 'session break req'
  | 'session search'
  | 'session search close'
  | 'move jump req'
  | 'add notification'
  | 'session add'
  | 'session data'
  | 'session exit'
  | 'leave full screen'
  | 'windowGeometry change'
  | 'enter full screen'
  | 'move'
  | 'session data send'
  | 'update available'
  | 'session stop req'
  | 'session quit req'
  | 'session tmux req';

export declare interface Server {
  emit(event: 'init', data: any): boolean;
  on(event: 'init', listener: (...args: any[]) => void): this;

  emit(event: 'new', data: any): boolean;
  on(event: 'new', listener: (...args: any[]) => void): this;

  emit(event: 'exit', data: any): boolean;
  on(event: 'exit', listener: (...args: any[]) => void): this;

  emit(event: 'maximize', data: any): boolean;
  on(event: 'maximize', listener: (...args: any[]) => void): this;

  emit(event: 'unmaximize', data: any): boolean;
  on(event: 'unmaximize', listener: (...args: any[]) => void): this;

  emit(event: 'minimize', data: any): boolean;
  on(event: 'minimize', listener: (...args: any[]) => void): this;

  emit(event: 'resize', data: any): boolean;
  on(event: 'resize', listener: (...args: any[]) => void): this;

  emit(event: 'data', data: any): boolean;
  on(event: 'data', listener: (...args: any[]) => void): this;

  emit(event: 'info renderer', data: any): boolean;
  on(event: 'info renderer', listener: (...args: any[]) => void): this;

  emit(event: 'open external', data: {url: string}): boolean;
  on(event: 'open external', listener: (arg0: {url: string}) => void): this;

  emit(event: 'open context menu', data: any): boolean;
  on(event: 'open context menu', listener: (...args: any[]) => void): this;

  emit(event: 'open hamburger menu', data: any): boolean;
  on(event: 'open hamburger menu', listener: (...args: any[]) => void): this;

  emit(event: 'close', data: any): boolean;
  on(event: 'close', listener: (...args: any[]) => void): this;

  emit(event: 'command', data: any): boolean;
  on(event: 'command', listener: (...args: any[]) => void): this;

  emit(event: 'open file', data: any): boolean;

  emit(event: 'open ssh', data: any): boolean;

  emit(ch: ServerEvents, data?: any): void;
  // emit(event: string, ...args: any[]): boolean;
  // on(event: string, listener: (...args: any[]) => void): this;
}

export class Server extends EventEmitter {
  destroyed = false;
  win: BrowserWindow;
  id!: string;
  constructor(win: BrowserWindow) {
    super();
    this.win = win;
    this.ipcListener = this.ipcListener.bind(this);

    if (this.destroyed) {
      return;
    }

    const uid = uuidv4();
    this.id = uid;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    ipcMain.on(uid, this.ipcListener);

    // we intentionally subscribe to `on` instead of `once`
    // to support reloading the window and re-initializing
    // the channel
    this.wc.on('did-finish-load', () => {
      this.wc.send('init', uid);
    });
  }

  get wc() {
    return this.win.webContents;
  }

  ipcListener(event: any, {ev, data}: {ev: ServerEvents; data: any}) {
    this.emit(ev, data);
  }

  emit(ch: ServerEvents, data?: any): any {
    // This check is needed because data-batching can cause extra data to be
    // emitted after the window has already closed
    if (!this.win.isDestroyed()) {
      this.wc.send(this.id, {ch, data: data || {}});
    }
  }

  destroy() {
    this.removeAllListeners();
    this.wc.removeAllListeners();
    if (this.id) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ipcMain.removeListener(this.id, this.ipcListener);
    } else {
      // mark for `genUid` in constructor
      this.destroyed = true;
    }
  }
}

export default (win: BrowserWindow) => {
  return new Server(win);
};
