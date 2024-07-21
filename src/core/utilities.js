// timer that works everywhere
function getTimerFunction() {
  if (typeof performance !== 'undefined') {
    return performance.now.bind(performance);
  }
  if (typeof Date !== 'undefined' && Date.now) {
    return Date.now.bind(Date);
  }
  if (typeof process !== 'undefined') {
    return function () {
      const t = process.hrtime();
      return t[0] * 0.001 + t[1] * 1e-6;
    };
  }
  return function getTime() {
    return new Date().getTime();
  };
}
export const getTime = getTimerFunction();

// API *************************************************

export function compareObjects(a, b) {
  for (const i in a) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

export function distance(a, b) {
  return Math.sqrt(
    (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]),
  );
}

export function colorToString(c) {
  return (
    `rgba(${Math.round(c[0] * 255).toFixed()},${Math.round(c[1] * 255).toFixed()},${Math.round(c[2] * 255).toFixed()},${c.length == 4 ? c[3].toFixed(2) : '1.0'})`
  );
}

export function isInsideRectangle(x, y, left, top, width, height) {
  if (left < x && left + width > x && top < y && top + height > y) {
    return true;
  }
  return false;
}
// [minx,miny,maxx,maxy]

export function growBounding(bounding, x, y) {
  if (x < bounding[0]) {
    bounding[0] = x;
  } else if (x > bounding[2]) {
    bounding[2] = x;
  }

  if (y < bounding[1]) {
    bounding[1] = y;
  } else if (y > bounding[3]) {
    bounding[3] = y;
  }
}
// point inside bounding box

export function isInsideBounding(p, bb) {
  if (p[0] < bb[0][0]
    || p[1] < bb[0][1]
    || p[0] > bb[1][0]
    || p[1] > bb[1][1]) {
    return false;
  }
  return true;
}
// bounding overlap, format: [ startx, starty, width, height ]

export function overlapBounding(a, b) {
  const A_end_x = a[0] + a[2];
  const A_end_y = a[1] + a[3];
  const B_end_x = b[0] + b[2];
  const B_end_y = b[1] + b[3];

  if (a[0] > B_end_x
    || a[1] > B_end_y
    || A_end_x < b[0]
    || A_end_y < b[1]) {
    return false;
  }
  return true;
}
// Convert a hex value to its decimal value - the inputted hex must be in the
//    format of a hex triplet - the kind we use for HTML colours. The function
//    will return an array with three values.

export function hex2num(hex) {
  if (hex.charAt(0) == '#') {
    hex = hex.slice(1);
  } // Remove the '#' char - if there is one.
  hex = hex.toUpperCase();
  const hex_alphabets = '0123456789ABCDEF';
  const value = new Array(3);
  let k = 0;
  let int1; let
    int2;
  for (let i = 0; i < 6; i += 2) {
    int1 = hex_alphabets.indexOf(hex.charAt(i));
    int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
    value[k] = int1 * 16 + int2;
    k++;
  }
  return value;
}
// Give a array with three values as the argument and the function will return
//    the corresponding hex triplet.

export function num2hex(triplet) {
  const hex_alphabets = '0123456789ABCDEF';
  let hex = '#';
  let int1; let
    int2;
  for (let i = 0; i < 3; i++) {
    int1 = triplet[i] / 16;
    int2 = triplet[i] % 16;

    hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
  }
  return hex;
}

export function clamp(v, a, b) {
  return a > v ? a : b < v ? b : v;
}

// separated just to improve if it doesn't work
export function cloneObject(obj, target) {
  if (obj == null) {
    return null;
  }
  const r = JSON.parse(JSON.stringify(obj));
  if (!target) {
    return r;
  }

  for (const i in r) {
    target[i] = r[i];
  }
  return target;
}

/*
* https://gist.github.com/jed/982883?permalink_comment_id=852670#gistcomment-852670
*/
export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a) => (a ^ Math.random() * 16 >> a / 4).toString(16));
}

/**
 * Returns if the types of two slots are compatible (taking into account wildcards, etc)
 * @method isValidConnection
 * @param {String} type_a
 * @param {String} type_b
 * @return {Boolean} true if they can be connected
 */
export function isValidConnection(type_a, type_b) {
  if (type_a == '' || type_a === '*') type_a = 0;
  if (type_b == '' || type_b === '*') type_b = 0;
  if (
    !type_a // generic output
              || !type_b // generic input
              || type_a == type_b // same type (is valid for triggers)
              || (type_a == LGraphEvents.EVENT && type_b == LGraphEvents.ACTION)
  ) {
    return true;
  }

  // Enforce string type to handle toLowerCase call (-1 number not ok)
  type_a = String(type_a);
  type_b = String(type_b);
  type_a = type_a.toLowerCase();
  type_b = type_b.toLowerCase();

  // For nodes supporting multiple connection types
  if (type_a.indexOf(',') == -1 && type_b.indexOf(',') == -1) {
    return type_a == type_b;
  }

  // Check all permutations to see if one is valid
  const supported_types_a = type_a.split(',');
  const supported_types_b = type_b.split(',');
  for (let i = 0; i < supported_types_a.length; ++i) {
    for (let j = 0; j < supported_types_b.length; ++j) {
      if (this.isValidConnection(supported_types_a[i], supported_types_b[j])) {
        // if (supported_types_a[i] == supported_types_b[j]) {
        return true;
      }
    }
  }

  return false;
}

// Should this just be Object.setPrototypeOf?
export function extendClass(target, origin) {
  for (var i in origin) {
    // copy class properties
    if (target.hasOwnProperty(i)) {
      continue;
    }
    target[i] = origin[i];
  }

  if (origin.prototype) {
    // copy prototype properties
    for (var i in origin.prototype) {
      // only enumerable
      if (!origin.prototype.hasOwnProperty(i)) {
        continue;
      }

      if (target.prototype.hasOwnProperty(i)) {
        // avoid overwriting existing ones
        continue;
      }

      // copy getters
      if (origin.prototype.__lookupGetter__(i)) {
        target.prototype.__defineGetter__(
          i,
          origin.prototype.__lookupGetter__(i),
        );
      } else {
        target.prototype[i] = origin.prototype[i];
      }

      // and setters
      if (origin.prototype.__lookupSetter__(i)) {
        target.prototype.__defineSetter__(
          i,
          origin.prototype.__lookupSetter__(i),
        );
      }
    }
  }
}

/* LiteGraph GUI elements used for canvas editing ************************************ */
export function closeAllContextMenus(ref_window) {
  ref_window = ref_window || window;

  const elements = ref_window.document.querySelectorAll('.litecontextmenu');
  if (!elements.length) {
    return;
  }

  const result = [];
  for (var i = 0; i < elements.length; i++) {
    result.push(elements[i]);
  }

  for (var i = 0; i < result.length; i++) {
    if (result[i].close) {
      result[i].close();
    } else if (result[i].parentNode) {
      result[i].parentNode.removeChild(result[i]);
    }
  }
}

// used to create nodes from wrapping functions
export function getParameterNames(func) {
  return (`${func}`)
    .replace(/[/][/].*$/gm, '') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  /**/
    .split('){', 1)[0]
    .replace(/^[^(]*[(]/, '') // extract the parameters
    .replace(/=[^,]+/g, '') // strip any ES6 defaults
    .split(',')
    .filter(Boolean); // split & filter [""]
}