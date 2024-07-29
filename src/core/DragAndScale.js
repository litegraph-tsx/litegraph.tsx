import { console } from './Console';
import { PointerSettings } from './pointer_events';

/**
 * Class for managing scaling and offset operations on an element, with support for dragging and zooming.
 * @constructor
 * @param {HTMLElement} element - The HTML element to bind events to.
 * @param {boolean} [skip_events] - Whether to skip binding events initially.
 */
export class DragAndScale {
  constructor(element, skip_events) {
    this.offset = new Float32Array([0, 0]);
    this.scale = 1;
    this.max_scale = 10;
    this.min_scale = 0.1;
    this.onredraw = null;
    this.enabled = true;
    this.last_mouse = [0, 0];
    this.element = null;
    this.visible_area = new Float32Array(4);

    if (element) {
      this.element = element;
      if (!skip_events) {
        this.bindEvents(element);
      }
    }
  }

  /**
   * Binds mouse and wheel events to the provided element for interaction handling.
   * @param {HTMLElement} element - The HTML element to bind events to.
   */
  bindEvents(element) {
    this.last_mouse = new Float32Array(2);

    element.addEventListener(`${PointerSettings.pointerevents_method}down`, this.onMouse);
    element.addEventListener(`${PointerSettings.pointerevents_method}move`, this.onMouse);
    element.addEventListener(`${PointerSettings.pointerevents_method}up`, this.onMouse);
    element.addEventListener('wheel', this.onMouse, false);
  }

  /**
   * Computes the visible area based on current offset, scale, and optionally a viewport.
   * @param {Array.<number>} [viewport] - Optional viewport dimensions [x, y, width, height].
   */
  computeVisibleArea(viewport) {
    if (!this.element) {
      this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
      return;
    }
    let { width } = this.element;
    let { height } = this.element;
    let startx = -this.offset[0];
    let starty = -this.offset[1];
    if (viewport) {
      startx += viewport[0] / this.scale;
      starty += viewport[1] / this.scale;
      width = viewport[2];
      height = viewport[3];
    }
    const endx = startx + width / this.scale;
    const endy = starty + height / this.scale;
    this.visible_area[0] = startx;
    this.visible_area[1] = starty;
    this.visible_area[2] = endx - startx;
    this.visible_area[3] = endy - starty;
  }

  /**
   * Handles mouse events for dragging and scaling operations.
   * @param {Event} e - The mouse event object.
   * @returns {boolean} Indicates if the event was handled or ignored.
   */
  onMouse(e) {
    if (!this.enabled) {
      return;
    }

    const canvas = this.element;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.canvasx = x;
    e.canvasy = y;
    e.dragging = this.dragging;

    const is_inside = !this.viewport || (this.viewport && x >= this.viewport[0] && x < (this.viewport[0] + this.viewport[2]) && y >= this.viewport[1] && y < (this.viewport[1] + this.viewport[3]));

    console.log(`pointerevents: DragAndScale onMouse ${e.type} ${is_inside}`);

    let ignore = false;
    if (this.onmouse) {
      ignore = this.onmouse(e);
    }

    if (e.type == `${PointerSettings.pointerevents_method}down` && is_inside) {
      this.dragging = true;
      canvas.removeEventListener(`${PointerSettings.pointerevents_method}move`, this._binded_mouse_callback);
      document.addEventListener(`${PointerSettings.pointerevents_method}move`, this._binded_mouse_callback);
      document.addEventListener(`${PointerSettings.pointerevents_method}down`, this._binded_mouse_callback);
    } else if (e.type == `${PointerSettings.pointerevents_method}move`) {
      if (!ignore) {
        const deltax = x - this.last_mouse[0];
        const deltay = y - this.last_mouse[1];
        if (this.dragging) {
          this.mouseDrag(deltax, deltay);
        }
      }
    } else if (e.type == `${PointerSettings.pointerevents_method}up`) {
      this.dragging = false;
      document.addEventListener(`${PointerSettings.pointerevents_method}move`, this._binded_mouse_callback);
      document.addEventListener(`${PointerSettings.pointerevents_method}up`, this._binded_mouse_callback);
      canvas.addEventListener(`${PointerSettings.pointerevents_method}move`, this._binded_mouse_callback);
    } else if (is_inside
                && (e.type == 'mousewheel'
                || e.type == 'wheel'
                || e.type == 'DOMMouseScroll')
    ) {
      e.eventType = 'mousewheel';
      if (e.type == 'wheel') {
        e.wheel = -e.deltaY;
      } else {
        e.wheel = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;
      }

      // from stack overflow
      e.delta = e.wheelDelta
        ? e.wheelDelta / 40
        : e.deltaY
          ? -e.deltaY / 3
          : 0;
      this.changeDeltaScale(1.0 + e.delta * 0.05);
    }

    this.last_mouse[0] = x;
    this.last_mouse[1] = y;

    if (is_inside) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  /**
   * Applies the current scale and offset transformations to a canvas context.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to apply transformations to.
   */
  toCanvasContext(ctx) {
    ctx.scale(this.scale, this.scale);
    ctx.translate(this.offset[0], this.offset[1]);
  }

  convertOffsetToCanvas(pos) {
    // return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
    return [
      (pos[0] + this.offset[0]) * this.scale,
      (pos[1] + this.offset[1]) * this.scale,
    ];
  }

  /**
   * Applies the current scale and offset transformations to a canvas context.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to apply transformations to.
   */
  convertCanvasToOffset(pos, out) {
    out = out || [0, 0];
    out[0] = pos[0] / this.scale - this.offset[0];
    out[1] = pos[1] / this.scale - this.offset[1];
    return out;
  }

  /**
   * Converts an offset position to canvas coordinates based on current scale and offset.
   * @param {Array.<number>} pos - Offset position [x, y].
   * @returns {Array.<number>} Converted canvas coordinates [x, y].
   */
  mouseDrag(x, y) {
    this.offset[0] += x / this.scale;
    this.offset[1] += y / this.scale;

    if (this.onredraw) {
      this.onredraw(this);
    }
  }

  /**
   * Changes the current scale value, centered around a specific point.
   * @param {number} value - The new scale value to apply.
   * @param {Array.<number>} [zooming_center] - Optional center point for scaling [x, y].
   */
  changeScale(value, zooming_center) {
    if (value < this.min_scale) {
      value = this.min_scale;
    } else if (value > this.max_scale) {
      value = this.max_scale;
    }

    if (value == this.scale) {
      return;
    }

    if (!this.element) {
      return;
    }

    const rect = this.element.getBoundingClientRect();
    if (!rect) {
      return;
    }

    zooming_center = zooming_center || [
      rect.width * 0.5,
      rect.height * 0.5,
    ];
    const center = this.convertCanvasToOffset(zooming_center);
    this.scale = value;
    if (Math.abs(this.scale - 1) < 0.01) {
      this.scale = 1;
    }

    const new_center = this.convertCanvasToOffset(zooming_center);
    const delta_offset = [
      new_center[0] - center[0],
      new_center[1] - center[1],
    ];

    this.offset[0] += delta_offset[0];
    this.offset[1] += delta_offset[1];

    if (this.onredraw) {
      this.onredraw(this);
    }
  }

  /**
   * Changes the scale by a delta value relative to the current scale, centered around a specific point.
   * @param {number} value - The delta scale value to apply.
   * @param {Array.<number>} [zooming_center] - Optional center point for scaling [x, y].
   */
  changeDeltaScale(value, zooming_center) {
    this.changeScale(this.scale * value, zooming_center);
  }

  /**
   * Resets the scale and offset to their default values (scale of 1 and offset of [0, 0]).
   */
  reset() {
    this.scale = 1;
    this.offset[0] = 0;
    this.offset[1] = 0;
  }
}
