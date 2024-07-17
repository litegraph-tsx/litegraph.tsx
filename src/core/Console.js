
/*
 * usage: import { console as X }
 * X.level = 4;
 * X.log?.('Message');
 */
export const console = new Proxy(window.console, {
  set(target, property, value) {
    if (property === 'level') {
      target.error = (value > 0? window.console.error : () => {});
      target.warn = (value > 1? window.console.warn : () => {});
      target.log = (value > 2? window.console.log : () => {});
      target.info = (value > 3? window.console.info : () => {});
      target.debug = (value> 4? window.console.debug : () => {});
      return true;
    } else {
      return Reflect.set(target, property, value);
    }
  },
});
