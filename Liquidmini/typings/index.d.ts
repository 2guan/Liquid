/**
 * Minimal ambient declarations for the native WeChat mini-program globals this
 * project uses. For full coverage install `miniprogram-api-typings`; this keeps
 * the project compiling offline without an npm step.
 */

declare const wx: any;
declare function App<T = any>(opts: T): void;
declare function Page<T = any>(opts: T): void;
declare function Component<T = any>(opts: T): void;
declare function getApp<T = any>(): T;
declare function getCurrentPages(): any[];
declare function Behavior<T = any>(opts: T): T;
declare function requirePlugin(name: string): any;

interface IAnyObject {
  [key: string]: any;
}

// Timer globals (provided by the mini-program runtime; no DOM lib loaded).
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(handle: number): void;
declare function setInterval(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearInterval(handle: number): void;
declare const console: {
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  info(...args: any[]): void;
};
