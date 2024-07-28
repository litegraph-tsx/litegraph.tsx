import { LGraphNode } from './LGraphNode'; // only used to inherit two methods at the end of file

/**
 * LGraphGroup class represents a group in a LiteGraph graph.
 *
 * @class LGraphGroup
 * @constructor
 * @param {string} title - The title of the group.
 */
export class LGraphGroup {
  /**
   * Constructs an instance of LGraphGroup.
   * @param {string} title - The title of the group.
   */
  constructor(title) {
    this._ctor(title);
  }

  // @TODO: deprecate separate _ctor method
  _ctor(title) {
    this.title = title || 'Group';
    this.font_size = 24;
    this.color = '#3f789e'; // !! DUPLICATE from LGraphCanvas.js
    this._bounding = new Float32Array([10, 10, 140, 80]);
    this._pos = this._bounding.subarray(0, 2);
    this._size = this._bounding.subarray(2, 4);
    this._nodes = [];
    this.graph = null;
  }

  set pos(v) {
    if (!v || v.length < 2) {
      return;
    }
    this._pos[0] = v[0];
    this._pos[1] = v[1];
  }

  get pos() {
    this._pos ??= new Float32Array(10, 10);
    return this._pos;
  }

  set size(v) {
    if (!v || v.length < 2) {
      return;
    }
    this._size[0] = Math.max(140, v[0]);
    this._size[1] = Math.max(80, v[1]);
  }

  get size() {
    return this._size;
  }

  /**
   * Configures the group with provided options.
   * @param {object} o - Configuration options.
   */
  configure(o) {
    this.title = o.title;
    this._bounding.set(o.bounding);
    this.color = o.color;
    if (o.font_size) {
      this.font_size = o.font_size;
    }
  }

  /**
   * Serializes the group to a JSON-compatible object.
   * @returns {object} Serialized representation of the group.
   */
  serialize() {
    const b = this._bounding;
    return {
      title: this.title,
      bounding: [
        Math.round(b[0]),
        Math.round(b[1]),
        Math.round(b[2]),
        Math.round(b[3]),
      ],
      color: this.color,
      font_size: this.font_size,
    };
  }

  /**
   * Moves the group by a specified delta.
   * @param {number} deltax - Delta movement along the X-axis.
   * @param {number} deltay - Delta movement along the Y-axis.
   * @param {boolean} ignore_nodes - Whether to ignore moving child nodes.
   */
  move(deltax, deltay, ignore_nodes) {
    this._pos[0] += deltax;
    this._pos[1] += deltay;
    if (ignore_nodes) {
      return;
    }
    for (let i = 0; i < this._nodes.length; ++i) {
      const node = this._nodes[i];
      node.pos[0] += deltax;
      node.pos[1] += deltay;
    }
  }

  /**
   * Recomputes the list of nodes inside the group based on the current graph state.
   */
  recomputeInsideNodes() {
    this._nodes.length = 0;
    const nodes = this.graph._nodes;
    const node_bounding = new Float32Array(4);

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      node.getBounding(node_bounding);
      if (!this.overlapBounding(this._bounding, node_bounding)) {
        continue;
      } // out of the visible area
      this._nodes.push(node);
    }
  }

  /**
   * Checks if a point is inside the bounding area of the group.
   * @method isPointInside
   * @memberof LGraphGroup.prototype
   * @param {object} event - The event object containing coordinates.
   * @returns {boolean} True if the point is inside the group, false otherwise.
   */
  isPointInside = LGraphNode.prototype.isPointInside;

  /**
   * Marks the canvas as dirty, triggering a redraw.
   * @method setDirtyCanvas
   * @memberof LGraphGroup.prototype
   * @param {boolean} force - Whether to force the canvas to redraw immediately.
   */
  setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;

  /**
   * !! DUPLICATE from LiteGraph.js !!
   * Checks if two bounding boxes overlap.
   * The bounding boxes are defined by their coordinates [startx, starty, width, height].
   * @method overlapBounding
   * @memberof LGraph
   * @param {number[]} a - Coordinates of the first bounding box [startx, starty, width, height].
   * @param {number[]} b - Coordinates of the second bounding box [startx, starty, width, height].
   * @returns {boolean} `true` if the bounding boxes `a` and `b` overlap, otherwise `false`.
   */
  overlapBounding(a, b) {
    const A_end_x = a[0] + a[2];
    const A_end_y = a[1] + a[3];
    const B_end_x = b[0] + b[2];
    const B_end_y = b[1] + b[3];

    if (
      a[0] > B_end_x
              || a[1] > B_end_y
              || A_end_x < b[0]
              || A_end_y < b[1]
    ) {
      return false;
    }
    return true;
  }
}
