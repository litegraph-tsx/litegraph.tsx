
/*
 * usage: import { console as X }
 * X.level = 4;
 * X.log?.('Message');
 */
export const console = new Proxy(window.console, {
  set(target, property, value) {
    if (property === 'level') {
      target.error = (value > 0? Reflect.get(target, 'error') : () => {});
      target.warn = (value > 1? Reflect.get(target, 'warn') : () => {});
      target.log = (value > 2? Reflect.get(target, 'log') : () => {});
      target.info = (value > 3? Reflect.get(target, 'info') : () => {});
      target.debug = (value> 4? Reflect.get(target, 'debug') : () => {});
      return true;
    } else {
      return Reflect.set(target, property, value);
    }
  },
});
