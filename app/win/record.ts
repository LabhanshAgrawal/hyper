// Application state fallback upon unexpected quit
import {app, BrowserWindow} from 'electron';
import Config from 'electron-store';
import * as wins from './windowSet';

// local storage
const rec = new Config();
const recordInterval = 2000;
let lastSession: NodeJS.Timeout;

export const save = (windows: Set<BrowserWindow>) => {
  setInterval(() => {
    const states: any[] = [];
    windows.forEach(win => {
      win.record((state: any) => {
        states.push(state);
      });
    });
    rec.set('records', states);
  }, recordInterval);
};

export const store = (payload: any) => {
  clearTimeout(lastSession);
  rec.set('lastSession', payload);
  console.log(rec.get('lastSession'));
  lastSession = setTimeout(() => {
    console.log('delete session completly');
    rec.delete('lastSession');
  }, 10000);
};

export const restore = () => {
  clearTimeout(lastSession);
  const relst = rec.get('lastSession');
  if (relst) {
    rec.delete('lastSession');
  }
  return relst;
};

export const load = () => {
  const records = rec.get('records');
  if (records && records.length > 0) {
    records.forEach((rec2: any) => {
      app.createWindow(
        win => {
          win.restoreTabs(rec2.tabs);
        },
        {position: rec2.position, size: rec2.size, tabs: rec2.tabs}
      );
    });
  } else {
    // when no reccords
    // when opening create a new window
    app.createWindow();
  }
  // start save scheduler
  save(wins.get());
};
