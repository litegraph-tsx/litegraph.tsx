
/*
 * usage: import { console as X }
 * X.level = 4;
 * X.log?.('Message');
 */
export const console = new Proxy(globalThis.console, {
  set(target, property, value) {
    if (property === 'level') {
      target.error = (value > 0? globalThis.console.error : () => {});
      target.warn = (value > 1? globalThis.console.warn : () => {});
      target.log = (value > 2? globalThis.console.log : () => {});
      target.info = (value > 3? globalThis.console.info : () => {});
      target.debug = (value> 4? globalThis.console.debug : () => {});
      return true;
    } else {
      return Reflect.set(target, property, value);
    }
  },
});
