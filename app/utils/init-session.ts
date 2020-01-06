import uuid from 'uuid';
import Session from '../session';

export default (opts, fn) => {
  if (opts.uid) {
    fn(opts.uid, new Session(opts));
  } else {
    fn(uuid.v4(), new Session(opts));
  }
};
