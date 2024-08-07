/**
 * Class representing a curve editor used by widgets to render and interact with curves.
 * @constructor
 * @param {Array.<Array.<number>>} points - Array of control points defining the curve.
 */
export class CurveEditor {
  constructor(points) {
    this.points = points;
    this.selected = -1;
    this.nearest = -1;
    this.size = null; // stores last size used
    this.must_update = true;
    this.margin = 5;
  }

  /**
   * Sample a curve at a given point using linear interpolation between control points.
   * @static
   * @param {number} f - The input value where the curve is sampled.
   * @param {Array.<Array.<number>>} points - Array of control points defining the curve.
   * @returns {number} The interpolated value on the curve at point 'f'.
   */
  static sampleCurve(f, points) {
    if (!points) return;
    for (let i = 0; i < points.length - 1; ++i) {
      const p = points[i];
      const pn = points[i + 1];
      if (pn[0] < f) continue;
      const r = (pn[0] - p[0]);
      if (Math.abs(r) < 0.00001) return p[1];
      const local_f = (f - p[0]) / r;
      return p[1] * (1.0 - local_f) + pn[1] * local_f;
    }
    return 0;
  }

  /**
   * Draw the curve editor on a canvas context.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
   * @param {Array.<number>} size - The size of the canvas [width, height].
   * @param {object} graphcanvas - Object containing properties related to the canvas.
   * @param {string} [background_color] - Optional background color for the editor.
   * @param {string} [line_color] - Color of the curve line.
   * @param {boolean} [inactive] - Flag indicating if the editor is inactive.
   */
  draw(ctx, size, graphcanvas, background_color, line_color, inactive) {
    const { points } = this;
    if (!points) return;
    this.size = size;
    const w = size[0] - this.margin * 2;
    const h = size[1] - this.margin * 2;

    line_color = line_color || '#666';

    ctx.save();
    ctx.translate(this.margin, this.margin);

    if (background_color) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#222';
      ctx.fillRect(w * 0.5, 0, 1, h);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(0, 0, w, h);
    }
    ctx.strokeStyle = line_color;
    if (inactive) ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (var i = 0; i < points.length; ++i) {
      var p = points[i];
      ctx.lineTo(p[0] * w, (1.0 - p[1]) * h);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (!inactive) {
      for (var i = 0; i < points.length; ++i) {
        var p = points[i];
        ctx.fillStyle = this.selected == i ? '#FFF' : (this.nearest == i ? '#DDD' : '#AAA');
        ctx.beginPath();
        ctx.arc(p[0] * w, (1.0 - p[1]) * h, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Handle mouse down event within the curve editor.
   * @param {Array.<number>} localpos - Mouse position relative to the curve editor.  is mouse in curve editor space
   * @param {object} graphcanvas - Object containing properties related to the canvas.
   * @returns {boolean} True if the event was handled, false otherwise.
   */
  onMouseDown(localpos, graphcanvas) {
    const { points } = this;
    if (!points) return;
    if (localpos[1] < 0) return;

    // this.captureInput(true);
    const w = this.size[0] - this.margin * 2;
    const h = this.size[1] - this.margin * 2;
    const x = localpos[0] - this.margin;
    const y = localpos[1] - this.margin;
    const pos = [x, y];
    const max_dist = 30 / graphcanvas.ds.scale;
    // search closer one
    this.selected = this.getCloserPoint(pos, max_dist);
    // create one
    if (this.selected == -1) {
      const point = [x / w, 1 - y / h];
      points.push(point);
      points.sort((a, b) => a[0] - b[0]);
      this.selected = points.indexOf(point);
      this.must_update = true;
    }
    if (this.selected != -1) return true;
  }

  /**
   * Handle mouse move event within the curve editor.
   * @param {Array.<number>} localpos - Mouse position relative to the curve editor.
   * @param {object} graphcanvas - Object containing properties related to the canvas.
   */
  onMouseMove(localpos, graphcanvas) {
    const { points } = this;
    if (!points) return;
    const s = this.selected;
    if (s < 0) return;
    const x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2);
    const y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2);
    const curvepos = [(localpos[0] - this.margin), (localpos[1] - this.margin)];
    const max_dist = 30 / graphcanvas.ds.scale;
    this._nearest = this.getCloserPoint(curvepos, max_dist);
    const point = points[s];
    if (point) {
      const is_edge_point = s == 0 || s == points.length - 1;
      if (!is_edge_point && (localpos[0] < -10 || localpos[0] > this.size[0] + 10 || localpos[1] < -10 || localpos[1] > this.size[1] + 10)) {
        points.splice(s, 1);
        this.selected = -1;
        return;
      }
      if (!is_edge_point) // not edges
      { point[0] = clamp(x, 0, 1); } else point[0] = s == 0 ? 0 : 1;
      point[1] = 1.0 - clamp(y, 0, 1);
      points.sort((a, b) => a[0] - b[0]);
      this.selected = points.indexOf(point);
      this.must_update = true;
    }
  }

  /**
   * Handle mouse up event within the curve editor.
   * @param {Array.<number>} localpos - Mouse position relative to the curve editor.
   * @param {object} graphcanvas - Object containing properties related to the canvas.
   * @returns {boolean} Always returns false.
   */
  onMouseUp(localpos, graphcanvas) {
    this.selected = -1;
    return false;
  }

  /**
   * Find the index of the closest control point to a given position within a maximum distance.
   * @param {Array.<number>} pos - Position to find the closest point to.
   * @param {number} [max_dist] - Maximum distance to consider for proximity.
   * @returns {number} Index of the closest control point, or -1 if no points are found.
   */
  getCloserPoint(pos, max_dist) {
    const { points } = this;
    if (!points) return -1;
    max_dist = max_dist || 30;
    const w = (this.size[0] - this.margin * 2);
    const h = (this.size[1] - this.margin * 2);
    const num = points.length;
    const p2 = [0, 0];
    let min_dist = 1000000;
    let closest = -1;
    let last_valid = -1;
    for (let i = 0; i < num; ++i) {
      const p = points[i];
      p2[0] = p[0] * w;
      p2[1] = (1.0 - p[1]) * h;
      if (p2[0] < pos[0]) last_valid = i;
      const dist = vec2.distance(pos, p2);
      if (dist > min_dist || dist > max_dist) continue;
      closest = i;
      min_dist = dist;
    }
    return closest;
  }
}
