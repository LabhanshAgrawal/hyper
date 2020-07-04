import {FontWeight} from 'xterm';

export type ColorMap = {
  black: string;
  blue: string;
  cyan: string;
  green: string;
  lightBlack: string;
  lightBlue: string;
  lightCyan: string;
  lightGreen: string;
  lightMagenta: string;
  lightRed: string;
  lightWhite: string;
  lightYellow: string;
  magenta: string;
  red: string;
  white: string;
  yellow: string;
};

/** for advanced config flags please refer to https://hyper.is/#cfg */
export type configOptions = {
  autoUpdatePlugins: boolean | string;
  /**
   * terminal background color
   *
   * opacity is only supported on macOS
   */
  backgroundColor: string;
  /**
   * Supported Options:
   * 1. 'SOUND' -> Enables the bell as a sound
   * 2. false: turns off the bell
   */
  bell: string;
  bellSound: string | null;
  /** An absolute file path to a sound file on the machine. */
  bellSoundURL: string | null;
  /** border color (window, tabs) */
  borderColor: string;
  /**
   * the full list. if you're going to provide the full color palette,
   * including the 6 x 6 color cubes and the grayscale map, just provide
   * an array here instead of a color map object
   */
  colors: ColorMap;
  /** if `true` (without backticks and without quotes), selected text will automatically be copied to the clipboard */
  copyOnSelect: boolean;
  /** custom CSS to embed in the main window */
  css: string;
  /** terminal text color under BLOCK cursor */
  cursorAccentColor: string;
  /** set to `true` (without backticks and without quotes) for blinking cursor */
  cursorBlink: boolean;
  /** terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk) */
  cursorColor: string;
  /** `'BEAM'` for |, `'UNDERLINE'` for _, `'BLOCK'` for █ */
  cursorShape: 'BEAM' | 'UNDERLINE' | 'BLOCK';
  /** if `true` (without backticks and without quotes), hyper will be set as the default protocol client for SSH */
  defaultSSHApp: boolean;
  /** if `false` (without backticks and without quotes), Hyper will use ligatures provided by some fonts */
  disableLigatures: boolean;
  /** for environment variables */
  env: {[k: string]: string};
  /** font family with optional fallbacks */
  fontFamily: string;
  /** default font size in pixels for all tabs */
  fontSize: number;
  /** default font weight: 'normal' or 'bold' */
  fontWeight: FontWeight;
  /** font weight for bold characters: 'normal' or 'bold' */
  fontWeightBold: FontWeight;
  /** color of the text */
  foregroundColor: string;
  /** letter spacing as a relative unit */
  letterSpacing: number;
  /** line height as a relative unit */
  lineHeight: number;
  /**
   * choose either `'vertical'`, if you want the column mode when Option key is hold during selection (Default)
   * or `'force'`, if you want to force selection regardless of whether the terminal is in mouse events mode
   * (inside tmux or vim with mouse mode enabled for example).
   */
  macOptionSelectionMode: string;
  modifierKeys: {
    altIsMeta: boolean;
    cmdIsMeta: boolean;
  };
  /** custom padding (CSS format, i.e.: `top right bottom left`) */
  padding: string;
  /**
   * if `true` (without backticks and without quotes), on right click selected text will be copied or pasted if no
   * selection is present (`true` by default on Windows and disables the context menu feature)
   */
  quickEdit: boolean;
  scrollback: number;
  /** terminal selection color */
  selectionColor: string;
  /**
   * the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
   * if left empty, your system's login shell will be used by default
   *
   * Windows
   * - Make sure to use a full path if the binary name doesn't work
   * - Remove `--login` in shellArgs
   *
   * Windows Subsystem for Linux (WSL) - previously Bash on Windows
   * - Example: `C:\\Windows\\System32\\wsl.exe`
   *
   * Git-bash on Windows
   * - Example: `C:\\Program Files\\Git\\bin\\bash.exe`
   *
   * PowerShell on Windows
   * - Example: `C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
   *
   * Cygwin
   * - Example: `C:\\cygwin64\\bin\\bash.exe`
   *
   * Git Bash
   * - Example: `C:\\Program Files\\Git\\git-cmd.exe`
   * Then Add `--command=usr/bin/bash.exe` to shellArgs
   */
  shell: string;
  /**
   * for setting shell arguments (i.e. for using interactive shellArgs: `['-i']`)
   * by default `['--login']` will be used
   */
  shellArgs: string[];
  /**
   * if you're using a Linux setup which show native menus, set to false
   *
   * default: `true` on Linux, `true` on Windows, ignored on macOS
   */
  showHamburgerMenu: boolean | '';
  /**
   * set to `false` (without backticks and without quotes) if you want to hide the minimize, maximize and close buttons
   *
   * additionally, set to `'left'` if you want them on the left, like in Ubuntu
   *
   * default: `true` (without backticks and without quotes) on Windows and Linux, ignored on macOS
   */
  showWindowControls: string;
  /** custom CSS to embed in the terminal window */
  termCSS: string;
  uiFontFamily: string;
  /** choose either `'stable'` for receiving highly polished, or `'canary'` for less polished but more frequent updates */
  updateChannel: 'stable' | 'canary';
  useConpty: boolean;
  /**
   * Whether to use the WebGL renderer. Set it to false to use canvas-based
   * rendering (slower, but supports transparent backgrounds)
   */
  webGLRenderer: boolean;
  /**
   * keypress required for weblink activation: [ctrl | alt | meta | shift]
   * todo: does not pick up config changes automatically, need to restart terminal :/
   */
  webLinksActivationKey: 'ctrl' | 'alt' | 'meta' | 'shift';
  windowSize: [number, number];
  /** set custom startup directory (must be an absolute path) */
  workingDirectory: string;
};

export type rawConfig = {
  config?: configOptions;
  plugins?: string[];
  localPlugins?: string[];
  keymaps?: Record<string, string | string[]>;
};

export type parsedConfig = {
  config: configOptions;
  /**
   * a list of plugins to fetch and install from npm
   * format: [@org/]project[#version]
   * examples:
   *   `hyperpower`
   *   `@company/project`
   *   `project#1.0.1`
   */
  plugins: string[];
  /**
   * in development, you can create a directory under
   * `~/.hyper_plugins/local/` and include it here
   * to load it and avoid it being `npm install`ed
   */
  localPlugins: string[];
  /**
   * Example
   * 'window:devtools': 'cmd+alt+o',
   */
  keymaps: {[k: string]: string[]};
};
