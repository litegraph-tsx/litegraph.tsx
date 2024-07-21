import { console } from './Console';
import { PointerSettings, pointerListenerAdd } from './pointer_events';

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
  constructor(values, options) {
    options = options || {};
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

    let eventClass = null;
    if (options.event) // use strings because comparing classes between windows doesnt work
    { eventClass = options.event.constructor.name; }
    if (eventClass !== 'MouseEvent'
                && eventClass !== 'CustomEvent'
                && eventClass !== 'PointerEvent'
    ) {
      console.error(`Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. (${eventClass})`);
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

    // this prevents the default context browser menu to open in case this menu was created when pressing right button
    pointerListenerAdd(
      root,
      'up',
      (e) => {
        console.log('pointerevents: ContextMenu up root prevent');
        e.preventDefault();
        return true;
      },
      true,
    );
    root.addEventListener(
      'contextmenu',
      (e) => {
        if (e.button != 2) {
          // right button
          return false;
        }
        e.preventDefault();
        return false;
      },
      true,
    );

    pointerListenerAdd(
      root,
      'down',
      (e) => {
        console.log('pointerevents: ContextMenu down');
        if (e.button == 2) {
          that.close();
          e.preventDefault();
          return true;
        }
      },
      true,
    );

    function on_mouse_wheel(e) {
      const pos = parseInt(root.style.top);
      root.style.top = `${(pos + e.deltaY * options.scroll_speed).toFixed()}px`;
      e.preventDefault();
      return true;
    }

    if (!options.scroll_speed) {
      options.scroll_speed = 0.1;
    }

    root.addEventListener('wheel', on_mouse_wheel, true);
    root.addEventListener('mousewheel', on_mouse_wheel, true);

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

    // close on leave? touch enabled devices won't work TODO use a global device detector and condition on that
    /* pointerListenerAdd(root,"leave", function(e) {
                  console.log("pointerevents: ContextMenu leave");
                if (that.lock) {
                    return;
                }
                if (root.closing_timer) {
                    clearTimeout(root.closing_timer);
                }
                root.closing_timer = setTimeout(that.close.bind(that, e), 500);
                //that.close(e);
            }); */

    pointerListenerAdd(root, 'enter', (e) => {
      // console.log("pointerevents: ContextMenu enter");
      if (root.closing_timer) {
        clearTimeout(root.closing_timer);
      }
    });

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
      pointerListenerAdd(element, 'enter', inner_over);
    }

    function inner_over(e) {
      const { value } = this;
      if (!value || !value.has_submenu) {
        return;
      }
      // if it is a submenu, autoopen like the item was clicked
      inner_onclick.call(this, e);
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
            throw 'ContextMenu submenu needs options';
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
  close(e, ignore_parent_menu) {
    if (this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    if (this.parentMenu && !ignore_parent_menu) {
      this.parentMenu.lock = false;
      this.parentMenu.current_submenu = null;
      if (e === undefined) {
        this.parentMenu.close();
      } else if (
        e
                    && !ContextMenu.isCursorOverElement(e, this.parentMenu.root)
      ) {
        ContextMenu.trigger(this.parentMenu.root, `${PointerSettings.pointerevents_method}leave`, e);
      }
    }
    if (this.current_submenu) {
      this.current_submenu.close(e, true);
    }

    if (this.root.closing_timer) {
      clearTimeout(this.root.closing_timer);
    }

    // TODO implement : LiteGraph.contextMenuClosed(); :: keep track of opened / closed / current ContextMenu
    // on key press, allow filtering/selecting the context menu elements
  }

  /**
   * Triggers a custom event on an element.
   * @param {HTMLElement} element - The element on which to trigger the event.
   * @param {string} event_name - The name of the custom event.
   * @param {any} params - Parameters to pass to the event.
   * @param {any} origin - The origin of the event.
   * @returns {CustomEvent} The created CustomEvent object.
   */
  static trigger(element, event_name, params, origin) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event_name, true, true, params); // canBubble, cancelable, detail
    evt.srcElement = origin;
    if (element.dispatchEvent) {
      element.dispatchEvent(evt);
    } else if (element.__events) {
      element.__events.dispatchEvent(evt);
    }
    // else nothing seems binded here so nothing to do
    return evt;
  }

  /**
   * Retrieves the top-level menu.
   * @returns {ContextMenu} The top-level context menu instance.
   */
  getTopMenu() {
    if (this.options.parentMenu) {
      return this.options.parentMenu.getTopMenu();
    }
    return this;
  }

  /**
   * Retrieves the first event associated with the menu.
   * @returns {MouseEvent} The first MouseEvent associated with the menu.
   */
  getFirstEvent() {
    if (this.options.parentMenu) {
      return this.options.parentMenu.getFirstEvent();
    }
    return this.options.event;
  }

  /**
   * Checks if the cursor is over a given element.
   * @param {Event} event - The event object.
   * @param {HTMLElement} element - The HTML element to check against.
   * @returns {boolean} True if the cursor is over the element, false otherwise.
   */
  static isCursorOverElement(event, element) {
    const left = event.clientX;
    const top = event.clientY;
    const rect = element.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    if (
      top > rect.top
                && top < rect.top + rect.height
                && left > rect.left
                && left < rect.left + rect.width
    ) {
      return true;
    }
    return false;
  }
}
