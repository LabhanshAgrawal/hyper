import uuid from 'uuid';
import Session from '../session';
import {decorateSessionOptions, decorateSessionClass} from '../plugins';

export default (opts: any, fn: Function) => {
  const uid = opts.uid || uuid.v4();

  const defaultOptions = Object.assign(
    {
      cwd: opts.cwd,
      splitDirection: undefined,
      shell: opts.shell,
      shellArgs: opts.shellArgs && Array.from(opts.shellArgs)
    },
    opts,
    {uid}
  );
  const options = decorateSessionOptions(defaultOptions);
  const DecoratedSession = decorateSessionClass(Session);
  const session = new DecoratedSession(options);
  // sessions.set(uid, session);

  fn(uid, session);
};
