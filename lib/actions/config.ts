import {CONFIG_LOAD, CONFIG_RELOAD} from '../../typings/constants/config';
import {HyperActions} from '../../typings/hyper';
import {configOptions} from '../../typings/config';

export function loadConfig(config: configOptions): HyperActions {
  return {
    type: CONFIG_LOAD,
    config
  };
}

export function reloadConfig(config: configOptions): HyperActions {
  const now = Date.now();
  return {
    type: CONFIG_RELOAD,
    config,
    now
  };
}
