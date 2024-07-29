import { console } from './Console';
import { PointerSettings } from './pointer_events';

/**
 * ContextMenu from LiteGUI
 *
 * @class ContextMenu
 * @constructor
 * @param {Array} values (allows object { title: "Nice text", callback: function ... })
 * @param {Object} options [optional] Some options:\
 * - title: title to show on top of the menu
 * - callback: function to call when an option is clicked, it receives the item information
 * - ignore_item_callbacks: ignores the callback inside the item, it just calls the options.callback
 * - event: you can pass a MouseEvent, this way the ContextMenu appears in that position
 */
export class ContextMenu {
  constructor(values, options = {}) {
    this.options = options;
    const that = this;

    // to link a menu with its parent
    if (options.parentMenu) {
      if (options.parentMenu.constructor !== this.constructor) {
        console.error('parentMenu must be of class ContextMenu, ignoring it');
        options.parentMenu = null;
      } else {
        this.parentMenu = options.parentMenu;
        this.parentMenu.lock = true;
        this.parentMenu.current_submenu = this;
      }
    }

    const eventClass = options.event?.constructor.name;
    const validEventClasses = ['MouseEvent', 'CustomEvent', 'PointerEvent'];
    if (!validEventClasses.includes(eventClass)) {
      console.error(`Event passed to ContextMenu is not of type MouseEvent, CustomEvent, or PointerEvent. Ignoring it. (${eventClass})`);
      options.event = null;
    }

    const root = document.createElement('div');
    root.className = 'litegraph litecontextmenu litemenubar-panel';
    if (options.className) {
      root.className += ` ${options.className}`;
    }
    root.style.pointerEvents = 'none';
    setTimeout(() => {
      root.style.pointerEvents = 'auto';
    }, 100); // delay so the mouse up event is not caught by this element

    root.addEventListener(`${PointerSettings.pointerevents_method}up`, (event) => {
      console.log('pointerevents: ContextMenu up root prevent');
      event.preventDefault();
      return true;
    });

    root.addEventListener('contextmenu', (event) => {
      if (event.button !== 2) return;
      event.preventDefault();
    });

    root.addEventListener(`${PointerSettings.pointerevents_method}down`, (event) => {
      console.log('pointerevents: ContextMenu down');
      if (event.button !== 2) return;
      that.close();
      event.preventDefault();
      return true;
    });

    options.scroll_speed ??= 0.1;
    root.addEventListener('wheel', (e) => {
      const pos = parseInt(root.style.top);
      root.style.top = `${(pos + e.deltaY * options.scroll_speed).toFixed()}px`;
      e.preventDefault();
      return true;
    }, true);

    root.addEventListener(`${PointerSettings.pointerevents_method}enter`, (event) => {
      // console.log("pointerevents: ContextMenu enter");
      if (root.closing_timer) {
        clearTimeout(root.closing_timer);
      }
    });

    this.root = root;

    // title
    if (options.title) {
      const element = document.createElement('div');
      element.className = 'litemenu-title';
      element.innerHTML = options.title;
      root.appendChild(element);
    }

    // entries
    let num = 0;
    for (let i = 0; i < values.length; i++) {
      let name = values.constructor == Array ? values[i] : i;
      if (name != null && name.constructor !== String) {
        name = name.content === undefined ? String(name) : name.content;
      }
      const value = values[i];
      this.addItem(name, value, options);
      num++;
    }

    // insert before checking position
    let root_document = document;
    if (options.event) {
      root_document = options.event.target.ownerDocument;
    }

    if (!root_document) {
      root_document = document;
    }

    if (root_document.fullscreenElement) root_document.fullscreenElement.appendChild(root);
    else root_document.body.appendChild(root);

    // compute best position
    let left = options.left || 0;
    let top = options.top || 0;
    if (options.event) {
      left = options.event.clientX - 10;
      top = options.event.clientY - 10;
      if (options.title) {
        top -= 20;
      }

      if (options.parentMenu) {
        const rect = options.parentMenu.root.getBoundingClientRect();
        left = rect.left + rect.width;
      }

      const body_rect = document.body.getBoundingClientRect();
      const root_rect = root.getBoundingClientRect();
      if (body_rect.height == 0) console.error('document.body height is 0. That is dangerous, set html,body { height: 100%; }');

      if (body_rect.width && left > body_rect.width - root_rect.width - 10) {
        left = body_rect.width - root_rect.width - 10;
      }
      if (body_rect.height && top > body_rect.height - root_rect.height - 10) {
        top = body_rect.height - root_rect.height - 10;
      }
    }

    root.style.left = `${left}px`;
    root.style.top = `${top}px`;

    if (options.scale) {
      root.style.transform = `scale(${options.scale})`;
    }
  }

  /**
   * Adds an item to the context menu.
   * @param {string} name - Display name of the menu item.
   * @param {Object|Function|null} value - Value associated with the menu item. Can be an object or a function.
   * @param {Object} options - Options for the item.
   * @returns {HTMLElement} The created menu item element.
   */
  addItem(name, value, options) {
    const that = this;
    options = options || {};

    const element = document.createElement('div');
    element.className = 'litemenu-entry submenu';

    let disabled = false;

    if (value === null) {
      element.classList.add('separator');
      // element.innerHTML = "<hr/>"
      // continue;
    } else {
      element.innerHTML = value && value.title ? value.title : name;
      element.value = value;

      if (value) {
        if (value.disabled) {
          disabled = true;
          element.classList.add('disabled');
        }
        if (value.submenu || value.has_submenu) {
          element.classList.add('has_submenu');
        }
      }

      if (typeof value === 'function') {
        element.dataset.value = name;
        element.onclick_callback = value;
      } else {
        element.dataset.value = value;
      }

      if (value.className) {
        element.className += ` ${value.className}`;
      }
    }

    this.root.appendChild(element);
    if (!disabled) {
      element.addEventListener('click', inner_onclick);
    }
    if (!disabled && options.autoopen) {
      element.addEventListener(`${PointerSettings.pointerevents_method}enter`, (event) => {
        const { value } = this;
        if (!value || !value.has_submenu) {
          return;
        }
        // if it is a submenu, autoopen like the item was clicked
        inner_onclick.call(this, event);
      });
    }

    // menu option clicked
    function inner_onclick(e) {
      const { value } = this;
      let close_parent = true;

      if (that.current_submenu) {
        that.current_submenu.close(e);
      }

      // global callback
      if (options.callback) {
        var r = options.callback.call(
          this,
          value,
          options,
          e,
          that,
          options.node,
        );
        if (r === true) {
          close_parent = false;
        }
      }

      // special cases
      if (value) {
        if (
          value.callback
                        && !options.ignore_item_callbacks
                        && value.disabled !== true
        ) {
          // item callback
          var r = value.callback.call(
            this,
            value,
            options,
            e,
            that,
            options.extra,
          );
          if (r === true) {
            close_parent = false;
          }
        }
        if (value.submenu) {
          if (!value.submenu.options) {
            throw new Error('ContextMenu submenu needs options');
          }
          const submenu = new that.constructor(value.submenu.options, {
            callback: value.submenu.callback,
            event: e,
            parentMenu: that,
            ignore_item_callbacks:
                                value.submenu.ignore_item_callbacks,
            title: value.submenu.title,
            extra: value.submenu.extra,
            autoopen: options.autoopen,
          });
          close_parent = false;
        }
      }

      if (close_parent && !that.lock) {
        that.close();
      }
    }

    return element;
  }

  /**
   * Closes the context menu.
   * @param {Event} e - The event that triggered the menu closure.
   * @param {boolean} ignore_parent_menu - Whether to ignore the parent menu when closing.
   */
  close(event, ignoreParentMenu = false) {
    // Remove the root element from its parent
    this.root.parentNode?.removeChild(this.root);

    // Handle parent menu closure if applicable
    if (this.parentMenu && !ignoreParentMenu) {
      this.parentMenu.lock = false;
      this.parentMenu.current_submenu = null;

      if (event === undefined) {
        this.parentMenu.close();
      } else if (event && !ContextMenu.isCursorOverElement(event, this.parentMenu.root)) {
        ContextMenu.trigger(this.parentMenu.root, `${PointerSettings.pointerevents_method}leave`, event);
      }
    }

    // Close the current submenu if it exists
    this.current_submenu?.close(event, true);

    // Clear any existing closing timer
    if (this.root.closing_timer) {
      clearTimeout(this.root.closing_timer);
    }
  }

  /**
   * Triggers a custom event on an element.
   * @param {HTMLElement} element - The element on which to trigger the event.
   * @param {string} event_name - The name of the custom event.
   * @param {any} params - Parameters to pass to the event.
   * @param {any} origin - The origin of the event.
   * @returns {CustomEvent} The created CustomEvent object.
   */
  static trigger(element, eventName, params, origin) {
    // Create a new CustomEvent
    const evt = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: params,
    });

    // Attach the 'origin' value to the detail object if needed
    evt.detail = { ...params, origin };

    // Dispatch the event
    if (element.dispatchEvent) {
      element.dispatchEvent(evt);
    } else if (element.__events) {
      element.__events.dispatchEvent(evt);
    }
    return evt;
  }

  /**
   * Retrieves the top-level menu.
   * @returns {ContextMenu} The top-level context menu instance.
   */
  getTopMenu() {
    return this.options.parentMenu?.getTopMenu() ?? this;
  }

  /**
   * Retrieves the first event associated with the menu.
   * @returns {MouseEvent} The first MouseEvent associated with the menu.
   */
  getFirstEvent() {
    return this.options.parentMenu?.getFirstEvent() ?? this.options.event;
  }

  /**
   * Checks if the cursor is over a given element.
   * @param {Event} event - The event object.
   * @param {HTMLElement} element - The HTML element to check against.
   * @returns {boolean} True if the cursor is over the element, false otherwise.
   */
  static isCursorOverElement(event, element) {
    const { clientX, clientY } = event;
    const {
      top, right, bottom, left,
    } = element.getBoundingClientRect();

    return (clientX > left && clientX < right && clientY > top && clientY < bottom);
  }

  /**
   * Closes all context menus of class 'litecontextmenu' within a specified window or the global window.
   * @TODO: Obviously belongs with ContextMenu
   * @method closeAll
   * @memberof ContextMenu
   * @param {Window} [refWindow=window] - Reference to the window object containing the context menus.
   */
  static closeAll(refWindow = window) {
    const elements = refWindow.document.querySelectorAll('.litecontextmenu');
    if (!elements.length) return;

    Array.from(elements).forEach((element) => {
      if (typeof element.close === 'function') {
        element.close();
      } else {
        element.parentNode?.removeChild(element);
      }
    });
  }
}
