import {exec} from 'child_process';
import initSession from '../utils/init-session';
import * as record from './record';
import Session from '../session';
import {BrowserWindow} from 'electron';

export default class Pane {
  rpc: any;
  parent: Pane | undefined;
  childs: Set<Pane>;
  uid!: string;
  session!: Session;
  direction: string | undefined;
  root!: boolean;
  cwd!: string;
  constructor(
    opts: {
      rows: number;
      cols: number;
      cwd: string;
      shell: string;
      shellArgs: string[];
      splitDirection?: string;
      activeUid?: string;
      uid: string;
      parent?: any;
    },
    rpc: any,
    fn: (pane: Pane) => void
  ) {
    this.rpc = rpc;
    this.parent = opts.parent;
    this.childs = new Set([]);

    initSession(opts, (uid: string, session: Session) => {
      this.uid = uid;
      this.session = session;

      if (opts.splitDirection) {
        this.direction = opts.splitDirection;
        rpc.emit('session add', {
          rows: opts.rows,
          cols: opts.cols,
          uid,
          splitDirection: opts.splitDirection,
          shell: session.shell,
          pid: session.pty!.pid,
          activeUid: opts.activeUid
        });
      } else {
        rpc.emit('session add', {
          rows: opts.rows,
          cols: opts.cols,
          uid,
          shell: session.shell,
          pid: session.pty!.pid
        });
      }
      fn(this);
    });
  }

  toRoot() {
    this.direction = undefined;
    this.parent = undefined;
    this.root = true;
  }

  onSplit(opts: any, win: BrowserWindow, recorded: Pane) {
    if (recorded) {
      opts.uid = recorded.uid;
      opts.cwd = recorded.cwd;
    }
    this.childs.add(
      new Pane(opts, this.rpc, pane => {
        win.sessions.set(pane.uid, pane);
        pane.session.on('data', data => {
          this.rpc.emit('session data', {uid: pane.uid, data});
        });

        pane.session.on('exit', () => {
          if (!pane.root) {
            pane.store();
            pane.parent?.childs.delete(pane);
            if (pane.childs.size >= 1) {
              pane.childs.forEach(child => {
                child.parent = pane.parent;
                pane.parent?.childs.add(child);
              });
            }
            win.sessions.delete(pane.uid);
            win.rpc.emit('session exit', {uid: pane.uid});
          }
        });
        if (recorded) {
          recorded.childs.forEach(child => {
            this.rpc.emit('pane restore', {uid: recorded.uid, pane: child});
          });
        }
      })
    );
  }

  lastChild() {
    let cpt = 0;
    let last!: Pane;
    this.childs.forEach(child => {
      cpt++;
      if (cpt === this.childs.size) {
        last = child;
      }
    });
    return last;
  }

  to() {
    const pid = this.session.pty!.pid;
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
      if (err) {
        console.error(err);
      } else {
        cwd = cwd.trim();
        this.cwd = cwd;
      }
    });

    return {
      uid: this.uid,
      cwd: this.cwd,
      type: 'PANE',
      root: this.root,
      direction: this.direction,
      childs: [] as Pane[],
      parent: undefined as any
    };
  }

  store(fn?: Function) {
    const pane = this.to();
    if (!pane.root) {
      pane.parent = {uid: this.parent!.uid};
    }
    if (fn) {
      fn(pane);
    } else {
      record.store(pane);
    }
  }

  record(fn: Function) {
    const pane = this.to();
    this.childs.forEach(child => {
      child.record((state: Pane) => {
        pane.childs.push(state);
      });
    });
    fn(pane);
  }
}
