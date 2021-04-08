/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {ipcRenderer} from 'electron';

import {connect as reduxConnect, Options} from 'react-redux';
import {basename} from 'path';

// patching Module._load
// so plugins can `require` them without needing their own version
// https://github.com/vercel/hyper/issues/619
import React, {PureComponent, useState} from 'react';
import ReactDOM from 'react-dom';
import Notification from '../components/notification';
import notify from './notify';
import {
  hyperPlugin,
  IUiReducer,
  ISessionReducer,
  ITermGroupReducer,
  HyperState,
  HyperDispatch,
  TabProps,
  TabsProps,
  TermGroupOwnProps,
  TermProps,
  Assignable,
  pluginsMain
} from '../hyper';
import {Middleware} from 'redux';
import {ObjectTypedKeys, emptyArrays} from './object';

// `require`d modules
const modules: hyperPlugin[] = [];
const loadedPluginNames: string[] = [];

// cache of decorated components
const decorated: Record<string, React.FC<any>> = {};
const decoratedClasses: Record<string, React.ComponentClass<any>> = {};

// various caches extracted of the plugin methods
const connectors: {
  Terms: {state: any[]; dispatch: any[]};
  Header: {state: any[]; dispatch: any[]};
  Hyper: {state: any[]; dispatch: any[]};
  Notifications: {state: any[]; dispatch: any[]};
} = {
  Terms: {state: [], dispatch: []},
  Header: {state: [], dispatch: []},
  Hyper: {state: [], dispatch: []},
  Notifications: {state: [], dispatch: []}
};
const middlewares: Middleware[] = [];
const propsDecorators = {
  getTermProps: [] as any[],
  getTabProps: [] as any[],
  getTabsProps: [] as any[],
  getTermGroupProps: [] as any[]
};
const reducersDecorators = {
  reduceUI: [] as IUiReducer[],
  reduceSessions: [] as ISessionReducer[],
  reduceTermGroups: [] as ITermGroupReducer[]
};

// expose decorated component instance to the higher-order components
function exposeDecorated<P extends Record<string, any>>(
  Component_: React.ComponentType<P>
): React.ComponentClass<P, unknown> {
  return class DecoratedComponent extends React.Component<P> {
    constructor(props: P, context: any) {
      super(props, context);
    }
    onRef = (decorated_: any) => {
      if (this.props.onDecorated) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          this.props.onDecorated(decorated_);
        } catch (e) {
          notify('Plugin error', `Error occurred. Check Developer Tools for details`, {error: e});
        }
      }
    };
    render() {
      return React.createElement(Component_, Object.assign({}, this.props, {ref: this.onRef}));
    }
  };
}

function getDecorated<P>(parent: React.ComponentType<P>, name: string): React.FC<P> {
  if (!decorated[name]) {
    const class_ = exposeDecorated(parent);
    (class_ as any).displayName = `_exposeDecorated(${name})`;

    const Comp = (props: P) => {
      const [loadedPlugins, setLoadedPlugins] = useState('');
      const [firstLoad, setFirstLoad] = useState(true);
      const pluginNames = loadedPluginNames.join(',');
      if (firstLoad || loadedPlugins !== pluginNames) {
        setFirstLoad(false);
        let class__ = class_;
        modules.forEach((mod: any) => {
          const method = 'decorate' + name;
          const fn = mod[method];

          if (fn) {
            let class___;

            try {
              class___ = fn(class__, {React, PureComponent, Notification, notify});
              class___.displayName = `${fn._pluginName}(${name})`;
            } catch (err) {
              notify(
                'Plugin error',
                `${fn._pluginName}: Error occurred in \`${method}\`. Check Developer Tools for details`,
                {error: err}
              );
              return;
            }

            if (!class___ || typeof class___.prototype.render !== 'function') {
              notify(
                'Plugin error',
                `${fn._pluginName}: Invalid return value of \`${method}\`. No \`render\` method found. Please return a \`React.Component\`.`
              );
              return;
            }

            class__ = class___;
          }
        });
        decoratedClasses[name] = class__;
        setLoadedPlugins(pluginNames);
      }

      return React.createElement(decoratedClasses[name], props);
    };

    decorated[name] = Comp;
  }

  return decorated[name];
}

// for each component, we return a higher-order component
// that wraps with the higher-order components
// exposed by plugins
export function decorate<P>(
  Component_: React.ComponentType<P>,
  name: string
): React.ComponentClass<P, {hasError: boolean}> {
  return class DecoratedComponent extends React.Component<P, {hasError: boolean}> {
    constructor(props: P) {
      super(props);
      this.state = {hasError: false};
    }
    componentDidCatch() {
      this.setState({hasError: true});
      // No need to detail this error because React print these information.
      notify(
        'Plugin error',
        `Plugins decorating ${name} has been disabled because of a plugin crash. Check Developer Tools for details.`
      );
    }
    render() {
      const Sub = this.state.hasError ? Component_ : getDecorated(Component_, name);
      return React.createElement(Sub, this.props);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module') as typeof import('module') & {_load: Function};
const originalLoad = Module._load;
Module._load = function _load(path: string) {
  // PLEASE NOTE: Code changes here, also need to be changed in
  // app/plugins.js
  switch (path) {
    case 'react':
      console.warn('DEPRECATED: If your plugin requires `react`, it must bundle it as a dependency');
      return React;
    case 'react-dom':
      console.warn('DEPRECATED: If your plugin requires `react-dom`, it must bundle it as a dependency');
      return ReactDOM;
    case 'hyper/component':
      console.warn(
        'DEPRECATED: If your plugin requires `hyper/component`, it must requires `react.PureComponent` instead and bundle `react` as a dependency'
      );
      return PureComponent;
    case 'hyper/notify':
      return notify;
    case 'hyper/Notification':
      return Notification;
    case 'hyper/decorate':
      return decorate;
    default:
      // eslint-disable-next-line prefer-rest-params
      return originalLoad.apply(this, arguments);
  }
};

const clearModulesCache = async () => {
  // the fs locations where user plugins are stored
  const {path, localPath} = await ipcRenderer.invoke('getBasePaths');

  // trigger unload hooks
  modules.forEach((mod) => {
    if (mod.onRendererUnload) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      mod.onRendererUnload(window);
    }
  });

  // clear require cache
  for (const entry in window.require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      // `require` is webpacks', `window.require` is electron's
      delete window.require.cache[entry];
    }
  }
};

const pathModule = window.require('path') as typeof import('path');

const getPluginName = (path: string) => pathModule.basename(path);

const getPluginVersion = (path: string): string | null => {
  let version = null;
  try {
    version = window.require(pathModule.resolve(path, 'package.json')).version as string;
  } catch (err) {
    console.warn(`No package.json found in ${path}`);
  }
  return version;
};

const loadModules = async () => {
  console.log('(re)loading renderer plugins');
  const paths = await ipcRenderer.invoke('getPaths');

  // initialize cache that we populate with extension methods
  emptyArrays(middlewares);
  emptyArrays(connectors);
  emptyArrays(reducersDecorators);
  emptyArrays(propsDecorators);

  const loadedPlugins = (await ipcRenderer.invoke('getLoadedPluginVersions')).map((plugin) => plugin.name);
  emptyArrays(modules);
  emptyArrays(loadedPluginNames);
  const loadedPluginNames_: string[] = [];
  const modules_ = paths.plugins
    .concat(paths.localPlugins)
    .filter((plugin) => loadedPlugins.indexOf(basename(plugin)) !== -1)
    .map((path) => {
      let mod: hyperPlugin;
      const pluginName = getPluginName(path);
      const pluginVersion = getPluginVersion(path);

      // window.require allows us to ensure this doesn't get
      // in the way of our build
      try {
        mod = window.require(path);
      } catch (err) {
        notify(
          'Plugin load error',
          `"${pluginName}" failed to load in the renderer process. Check Developer Tools for details.`,
          {error: err}
        );
        return undefined;
      }

      loadedPluginNames_.push(path);

      ObjectTypedKeys(mod).forEach((i) => {
        if (Object.hasOwnProperty.call(mod, i)) {
          mod[i]._pluginName = pluginName;
          mod[i]._pluginVersion = pluginVersion;
        }
      });

      // mapHyperTermState mapping for backwards compatibility with hyperterm
      if (mod.mapHyperTermState) {
        mod.mapHyperState = mod.mapHyperTermState;
        console.error('mapHyperTermState is deprecated. Use mapHyperState instead.');
      }

      // mapHyperTermDispatch mapping for backwards compatibility with hyperterm
      if (mod.mapHyperTermDispatch) {
        mod.mapHyperDispatch = mod.mapHyperTermDispatch;
        console.error('mapHyperTermDispatch is deprecated. Use mapHyperDispatch instead.');
      }

      if (mod.middleware) {
        middlewares.push(mod.middleware);
      }

      if (mod.reduceUI) {
        reducersDecorators.reduceUI.push(mod.reduceUI);
      }

      if (mod.reduceSessions) {
        reducersDecorators.reduceSessions.push(mod.reduceSessions);
      }

      if (mod.reduceTermGroups) {
        reducersDecorators.reduceTermGroups.push(mod.reduceTermGroups);
      }

      if (mod.mapTermsState) {
        connectors.Terms.state.push(mod.mapTermsState);
      }

      if (mod.mapTermsDispatch) {
        connectors.Terms.dispatch.push(mod.mapTermsDispatch);
      }

      if (mod.mapHeaderState) {
        connectors.Header.state.push(mod.mapHeaderState);
      }

      if (mod.mapHeaderDispatch) {
        connectors.Header.dispatch.push(mod.mapHeaderDispatch);
      }

      if (mod.mapHyperState) {
        connectors.Hyper.state.push(mod.mapHyperState);
      }

      if (mod.mapHyperDispatch) {
        connectors.Hyper.dispatch.push(mod.mapHyperDispatch);
      }

      if (mod.mapNotificationsState) {
        connectors.Notifications.state.push(mod.mapNotificationsState);
      }

      if (mod.mapNotificationsDispatch) {
        connectors.Notifications.dispatch.push(mod.mapNotificationsDispatch);
      }

      if (mod.getTermGroupProps) {
        propsDecorators.getTermGroupProps.push(mod.getTermGroupProps);
      }

      if (mod.getTermProps) {
        propsDecorators.getTermProps.push(mod.getTermProps);
      }

      if (mod.getTabProps) {
        propsDecorators.getTabProps.push(mod.getTabProps);
      }

      if (mod.getTabsProps) {
        propsDecorators.getTabsProps.push(mod.getTabsProps);
      }

      if (mod.onRendererWindow) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        mod.onRendererWindow(window);
      }
      console.log(`Plugin ${pluginName} (${pluginVersion}) loaded.`);

      return mod;
    })
    .filter((mod): mod is hyperPlugin => Boolean(mod));
  modules.push(...modules_);
  loadedPluginNames.push(...loadedPluginNames_);

  const deprecatedPlugins = await ipcRenderer.invoke('getDeprecatedConfig');
  Object.keys(deprecatedPlugins).forEach((name) => {
    const {css} = deprecatedPlugins[name];
    if (css.length > 0) {
      console.warn(`Warning: "${name}" plugin uses some deprecated CSS classes (${css.join(', ')}).`);
    }
  });
};

// load modules for initial decoration
loadModules();

export async function reload() {
  await clearModulesCache();
  await loadModules();
  // trigger re-decoration when components
  // get re-rendered
  Object.keys(decorated).forEach((key) => delete decorated[key]);
}

function getProps(name: keyof typeof propsDecorators, props: any, ...fnArgs: any[]) {
  const decorators = propsDecorators[name];
  let props_: typeof props;

  decorators.forEach((fn) => {
    let ret_;

    if (!props_) {
      props_ = Object.assign({}, props);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ret_ = fn(...fnArgs, props_);
    } catch (err) {
      notify('Plugin error', `${fn._pluginName}: Error occurred in \`${name}\`. Check Developer Tools for details.`, {
        error: err
      });
      return;
    }

    if (!ret_ || typeof ret_ !== 'object') {
      notify('Plugin error', `${fn._pluginName}: Invalid return value of \`${name}\` (object expected).`);
      return;
    }

    props_ = ret_;
  });

  return props_ || props;
}

export function getTermGroupProps<T extends Assignable<TermGroupOwnProps, T>>(
  uid: string,
  parentProps: any,
  props: T
): T {
  return getProps('getTermGroupProps', props, uid, parentProps);
}

export function getTermProps<T extends Assignable<TermProps, T>>(uid: string, parentProps: any, props: T): T {
  return getProps('getTermProps', props, uid, parentProps);
}

export function getTabsProps<T extends Assignable<TabsProps, T>>(parentProps: any, props: T): T {
  return getProps('getTabsProps', props, parentProps);
}

export function getTabProps<T extends Assignable<TabProps, T>>(tab: any, parentProps: any, props: T): T {
  return getProps('getTabProps', props, tab, parentProps);
}

// connects + decorates a class
// plugins can override mapToState, dispatchToProps
// and the class gets decorated (proxied)
export function connect<stateProps, dispatchProps>(
  stateFn: (state: HyperState) => stateProps,
  dispatchFn: (dispatch: HyperDispatch) => dispatchProps,
  c: any,
  d: Options = {}
) {
  return (Class: any, name: keyof typeof connectors) => {
    return reduxConnect<stateProps, dispatchProps, any, HyperState>(
      (state) => {
        let ret = stateFn(state);
        connectors[name].state.forEach((fn) => {
          let ret_;

          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            ret_ = fn(state, ret);
          } catch (err) {
            notify(
              'Plugin error',
              `${fn._pluginName}: Error occurred in \`map${name}State\`. Check Developer Tools for details.`,
              {error: err}
            );
            return;
          }

          if (!ret_ || typeof ret_ !== 'object') {
            notify('Plugin error', `${fn._pluginName}: Invalid return value of \`map${name}State\` (object expected).`);
            return;
          }

          ret = ret_;
        });
        return ret;
      },
      (dispatch) => {
        let ret = dispatchFn(dispatch);
        connectors[name].dispatch.forEach((fn) => {
          let ret_;

          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            ret_ = fn(dispatch, ret);
          } catch (err) {
            notify(
              'Plugin error',
              `${fn._pluginName}: Error occurred in \`map${name}Dispatch\`. Check Developer Tools for details.`,
              {error: err}
            );
            return;
          }

          if (!ret_ || typeof ret_ !== 'object') {
            notify(
              'Plugin error',
              `${fn._pluginName}: Invalid return value of \`map${name}Dispatch\` (object expected).`
            );
            return;
          }

          ret = ret_;
        });
        return ret;
      },
      c,
      d
    )(decorate(Class, name));
  };
}

const decorateReducer: {
  (name: 'reduceUI', fn: IUiReducer): IUiReducer;
  (name: 'reduceSessions', fn: ISessionReducer): ISessionReducer;
  (name: 'reduceTermGroups', fn: ITermGroupReducer): ITermGroupReducer;
} = <T extends keyof typeof reducersDecorators>(name: T, fn: any) => {
  const reducers = reducersDecorators[name];
  return (state: any, action: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    let state_ = fn(state, action);

    reducers.forEach((pluginReducer: any) => {
      let state__;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        state__ = pluginReducer(state_, action);
      } catch (err) {
        notify('Plugin error', `${fn._pluginName}: Error occurred in \`${name}\`. Check Developer Tools for details.`, {
          error: err
        });
        return;
      }

      if (!state__ || typeof state__ !== 'object') {
        notify('Plugin error', `${fn._pluginName}: Invalid return value of \`${name}\`.`);
        return;
      }

      state_ = state__;
    });

    return state_;
  };
};

export function decorateTermGroupsReducer(fn: ITermGroupReducer) {
  return decorateReducer('reduceTermGroups', fn);
}

export function decorateUIReducer(fn: IUiReducer) {
  return decorateReducer('reduceUI', fn);
}

export function decorateSessionsReducer(fn: ISessionReducer) {
  return decorateReducer('reduceSessions', fn);
}

// redux middleware generator
export const middleware: Middleware = (store) => (next) => (action) => {
  const nextMiddleware = (remaining: Middleware[]) => (action_: any) =>
    remaining.length ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action_) : next(action_);
  nextMiddleware(middlewares)(action);
};
