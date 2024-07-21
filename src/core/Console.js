/**
 * This modification defines a Proxy for console which masks logging methods based on a specified logging level.
 * @Usage:
 * import { console } from <here>; // overrides default console
 * import { console as whatever } from <here> // doesn't
 * console.log(thing);
 *
 * @typedef {Object} Console
 * @property {number} level - The logging level (0-5) where:
 *   0: Error messages only
 *   1: Errors and warnings
 *   2: Errors, warnings, and regular logs
 *   3: Errors, warnings, regular logs, and info messages
 *   4: Errors, warnings, regular logs, info messages, and debug messages
 *   5: Errors, warnings, regular logs, info messages, debug messages, and verbose debug messages
 */
export const console = new Proxy(globalThis.console, {
  set(target, property, value) {
    if (property === 'level') {
      target.error = (value > 0 ? globalThis.console.error : () => {});
      target.warn = (value > 1 ? globalThis.console.warn : () => {});
      target.log = (value > 2 ? globalThis.console.log : () => {});
      target.info = (value > 3 ? globalThis.console.info : () => {});
      target.debug = (value > 4 ? globalThis.console.debug : () => {});
      target.verbose = (value > 5 ? globalThis.console.debug : () => {});
      return true;
    }
    return Reflect.set(target, property, value);
  },
});
