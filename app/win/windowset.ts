import {BrowserWindow} from 'electron';

const windowSet = new Set<BrowserWindow>([]);

const gets = () => {
  return new Set([...windowSet]); // return a clone
};

// function to retrieve the last focused window in windowSet;
// added to app object in order to expose it to plugins.
const lastFocused = () => {
  if (!windowSet.size) {
    return null;
  }
  return Array.from(windowSet).reduce((lastWindow, win) => {
    return win.focusTime > lastWindow.focusTime ? win : lastWindow;
  });
};

const add = (win: BrowserWindow) => {
  windowSet.add(win);
};

const remove = (win: BrowserWindow) => {
  windowSet.delete(win);
};

const size = () => {
  return windowSet.size;
};

const get = () => {
  return windowSet;
};

export {gets, lastFocused, add, remove as delete, size, get};
