import {Immutable, ImmutableArray, ImmutableObject} from 'seamless-immutable';

export type ITermGroup = Immutable<{
  uid: string;
  sessionUid: string | null;
  parentUid: string | null;
  direction: 'HORIZONTAL' | 'VERTICAL' | null;
  sizes: number[] | null;
  children: string[];
}>;

export type ITermGroups = Immutable<Record<string, ITermGroup>>;

export type ITermState = Immutable<{
  termGroups: Mutable<ITermGroups>;
  activeSessions: Record<string, string>;
  activeRootGroup: string | null;
}>;

export type cursorShapes = 'BEAM' | 'UNDERLINE' | 'BLOCK';
import {FontWeight, Terminal} from 'xterm';
import {ColorMap} from './config';

export type uiState = Immutable<{
  _lastUpdate: number | null;
  activeUid: string | null;
  activityMarkers: Record<string, boolean>;
  backgroundColor: string;
  bell: string;
  bellSoundURL: string | null;
  bellSound: string | null;
  borderColor: string;
  colors: ColorMap;
  cols: number | null;
  copyOnSelect: boolean;
  css: string;
  cursorAccentColor: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: cursorShapes;
  cwd?: string;
  disableLigatures: boolean;
  fontFamily: string;
  fontSize: number;
  fontSizeOverride: null | number;
  fontSmoothingOverride: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  fullScreen: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  maximized: boolean;
  messageDismissable: null | boolean;
  messageText: string | null;
  messageURL: string | null;
  modifierKeys: {
    altIsMeta: boolean;
    cmdIsMeta: boolean;
  };
  notifications: {
    font: boolean;
    message: boolean;
    resize: boolean;
    updates: boolean;
  };
  openAt: Record<string, number>;
  padding: string;
  quickEdit: boolean;
  resizeAt: number;
  rows: number | null;
  scrollback: number;
  selectionColor: string;
  showHamburgerMenu: boolean | '';
  showWindowControls: string;
  termCSS: string;
  uiFontFamily: string;
  updateCanInstall: null | boolean;
  updateNotes: string | null;
  updateReleaseUrl: string | null;
  updateVersion: string | null;
  webGLRenderer: boolean;
  webLinksActivationKey: string;
}>;

export type session = {
  cleared: boolean;
  cols: number | null;
  pid: number | null;
  resizeAt?: number;
  rows: number | null;
  search: boolean;
  shell: string | null;
  title: string;
  uid: string;
  url: string | null;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  activeUid?: string;
};
export type sessionState = Immutable<{
  sessions: Record<string, session>;
  activeUid: string | null;
  write?: any;
}>;

export type HyperState = {
  ui: uiState;
  sessions: sessionState;
  termGroups: ITermState;
};

import {UIActions} from './constants/ui';
import {ConfigActions} from './constants/config';
import {SessionActions} from './constants/sessions';
import {NotificationActions} from './constants/notifications';
import {UpdateActions} from './constants/updater';
import {TermGroupActions} from './constants/term-groups';
import {InitActions} from './constants';
import {TabActions} from './constants/tabs';

export type HyperActions = (
  | UIActions
  | ConfigActions
  | SessionActions
  | NotificationActions
  | UpdateActions
  | TermGroupActions
  | InitActions
  | TabActions
) & {effect?: () => void};

import configureStore from '../lib/store/configure-store';
export type HyperDispatch = ReturnType<typeof configureStore>['dispatch'];

import {ReactChild} from 'react';
type extensionProps = Partial<{
  customChildren: ReactChild | ReactChild[];
  customChildrenBefore: ReactChild | ReactChild[];
  customCSS: string;
  customInnerChildren: ReactChild | ReactChild[];
}>;

type HeaderConnectedProps = {
  isMac: boolean;
  tabs: ITab[];
  activeMarkers: ImmutableObject<Record<string, boolean>>;
  borderColor: string;
  backgroundColor: string;
  maximized: boolean;
  fullScreen: boolean;
  showHamburgerMenu: boolean | '';
  showWindowControls: string;
} & {
  onCloseTab: (i: string) => void;
  onChangeTab: (i: string) => void;
  maximize: () => void;
  unmaximize: () => void;
  openHamburgerMenu: (coordinates: {x: number; y: number}) => void;
  minimize: () => void;
  close: () => void;
};
export type HeaderProps = HeaderConnectedProps & extensionProps;

type HyperConnectedProps = {
  isMac: boolean;
  customCSS: string;
  uiFontFamily: string;
  borderColor: string;
  activeSession: string | null;
  backgroundColor: string;
  maximized: boolean;
  fullScreen: boolean;
  lastConfigUpdate: number | null;
} & {
  execCommand: (command: string, fn: (e: any, dispatch: HyperDispatch) => void, e: any) => void;
};
export type HyperProps = HyperConnectedProps & extensionProps;

type NotificationsConnectedProps = Partial<{
  fontShowing: boolean;
  fontSize: number;
  fontText: string;
  resizeShowing: boolean;
  cols: number | null;
  rows: number | null;
  updateShowing: boolean;
  updateVersion: string | null;
  updateNote: string | null;
  updateReleaseUrl: string | null;
  updateCanInstall: boolean | null;
  messageShowing: boolean;
  messageText: string | null;
  messageURL: string | null;
  messageDismissable: boolean | null;
}> & {
  onDismissFont: () => void;
  onDismissResize: () => void;
  onDismissUpdate: () => void;
  onDismissMessage: () => void;
  onUpdateInstall: () => void;
};
export type NotificationsProps = NotificationsConnectedProps & extensionProps;

type Terms = React.Component<TermsProps>;
type TermsConnectedProps = {
  sessions: ImmutableObject<Record<string, session>>;
  cols: number | null;
  rows: number | null;
  scrollback: number;
  termGroups: ImmutableObject<ITermGroup>[];
  activeRootGroup: string | null;
  activeSession: string | null;
  customCSS: string;
  write: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  lineHeight: number;
  letterSpacing: number;
  uiFontFamily: string;
  fontSmoothing: string;
  padding: string;
  cursorColor: string;
  cursorAccentColor: string;
  cursorShape: cursorShapes;
  cursorBlink: boolean;
  borderColor: string;
  selectionColor: string;
  colors: ImmutableObject<ColorMap>;
  foregroundColor: string;
  backgroundColor: string;
  bell: string;
  bellSoundURL: string | null;
  bellSound: string | null;
  copyOnSelect: boolean;
  modifierKeys: ImmutableObject<{altIsMeta: boolean; cmdIsMeta: boolean}>;
  quickEdit: boolean;
  webGLRenderer: boolean;
  webLinksActivationKey: string;
  macOptionSelectionMode: string;
  disableLigatures: boolean;
} & {
  onData(uid: string, data: any): void;
  onTitle(uid: string, title: string): void;
  onResize(uid: string, cols: number, rows: number): void;
  onActive(uid: string): void;
  toggleSearch(uid: string): void;
  onContextMenu(uid: string, selection: any): void;
};
export type TermsProps = TermsConnectedProps & extensionProps & {ref_: (terms: Terms | null) => void};

export type StyleSheetProps = {
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  foregroundColor: string;
} & extensionProps;

export type TabProps = {
  borderColor: string;
  hasActivity: boolean;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onClose: () => void;
  onSelect: () => void;
  text: string;
} & extensionProps;

export type ITab = {
  uid: string;
  title: string;
  isActive: boolean;
  hasActivity: boolean;
};

export type TabsProps = {
  tabs: ITab[];
  borderColor: string;
  onChange: (uid: string) => void;
  onClose: (uid: string) => void;
  fullScreen: boolean;
} & extensionProps;

export type NotificationProps = {
  backgroundColor: string;
  color?: string;
  dismissAfter?: number;
  onDismiss: Function;
  text?: string | null;
  userDismissable?: boolean | null;
  userDismissColor?: string;
} & extensionProps;

export type NotificationState = {
  dismissing: boolean;
};

export type SplitPaneProps = {
  borderColor: string;
  direction: 'horizontal' | 'vertical';
  onResize: Function;
  sizes?: Immutable<number[]> | null;
};

type Term = React.PureComponent<TermProps>;

export type TermGroupOwnProps = {
  cursorAccentColor?: string;
  fontSmoothing?: string;
  parentProps: TermsProps;
  ref_: (uid: string, term: Term | null) => void;
  termGroup: ITermGroup;
  terms: Record<string, Term | null>;
} & Pick<
  TermsProps,
  | 'activeSession'
  | 'backgroundColor'
  | 'bell'
  | 'bellSound'
  | 'bellSoundURL'
  | 'borderColor'
  | 'colors'
  | 'copyOnSelect'
  | 'cursorBlink'
  | 'cursorColor'
  | 'cursorShape'
  | 'disableLigatures'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'fontWeightBold'
  | 'foregroundColor'
  | 'letterSpacing'
  | 'lineHeight'
  | 'macOptionSelectionMode'
  | 'modifierKeys'
  | 'onActive'
  | 'onContextMenu'
  | 'onData'
  | 'onResize'
  | 'onTitle'
  | 'padding'
  | 'quickEdit'
  | 'scrollback'
  | 'selectionColor'
  | 'sessions'
  | 'toggleSearch'
  | 'uiFontFamily'
  | 'webGLRenderer'
  | 'webLinksActivationKey'
>;

type TermGroupConnectedProps = {
  childGroups: ImmutableArray<ImmutableObject<ITermGroup>>;
} & {
  onTermGroupResize(splitSizes: number[]): void;
};
export type TermGroupProps = TermGroupConnectedProps & TermGroupOwnProps;

export type SearchBoxProps = {
  search: (searchTerm: string) => void;
  next: (searchTerm: string) => void;
  prev: (searchTerm: string) => void;
  close: () => void;
};

import {FitAddon} from 'xterm-addon-fit';
import {SearchAddon} from 'xterm-addon-search';
import {Dispatch} from 'redux';
export type TermProps = {
  backgroundColor: string;
  bell: string;
  bellSound: string | null;
  bellSoundURL: string | null;
  borderColor: string;
  cleared: boolean;
  colors: ColorMap;
  cols: number | null;
  copyOnSelect: boolean;
  cursorAccentColor?: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: cursorShapes;
  disableLigatures: boolean;
  fitAddon: FitAddon | null;
  fontFamily: string;
  fontSize: number;
  fontSmoothing?: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  isTermActive: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  modifierKeys: Immutable<{altIsMeta: boolean; cmdIsMeta: boolean}>;
  onActive: () => void;
  onContextMenu: (selection: any) => void;
  onCursorMove?: (cursorFrame: {x: number; y: number; width: number; height: number; col: number; row: number}) => void;
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
  onTitle: (title: string) => void;
  padding: string;
  quickEdit: boolean;
  rows: number | null;
  scrollback: number;
  search: boolean;
  searchAddon: SearchAddon | null;
  selectionColor: string;
  term: Terminal | null;
  toggleSearch: () => void;
  uid: string;
  uiFontFamily: string;
  url: string | null;
  webGLRenderer: boolean;
  webLinksActivationKey: string;
  ref_: (uid: string, term: Term | null) => void;
} & extensionProps;

// Utility types

export type Mutable<T> = T extends Immutable<infer U> ? (Exclude<U, T> extends never ? U : Exclude<U, T>) : T;

export type immutableRecord<T> = {[k in keyof T]: Immutable<T[k]>};

export type Assignable<T, U> = {[k in keyof U]: k extends keyof T ? T[k] : U[k]} & Partial<T>;
