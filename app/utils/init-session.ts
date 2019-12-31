import uuid from 'uuid';
import Session from '../session';

export default (opts: any, fn: Function) => {
  fn(opts.uid || uuid.v4(), new Session(opts));
};
