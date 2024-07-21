import { wrapFunctionAsNode, registerNodeType } from '../core/LGraphNode';

// basic nodes

function toString(a) {
  if (a && a.constructor === Object) {
    try {
      return JSON.stringify(a);
    } catch (err) {
      return String(a);
    }
  }
  return String(a);
}

wrapFunctionAsNode('string/toString', toString, [''], 'string');

function compare(a, b) {
  return a == b;
}

wrapFunctionAsNode(
  'string/compare',
  compare,
  ['string', 'string'],
  'boolean',
);

function concatenate(a, b) {
  if (a === undefined) {
    return b;
  }
  if (b === undefined) {
    return a;
  }
  return a + b;
}

wrapFunctionAsNode(
  'string/concatenate',
  concatenate,
  ['string', 'string'],
  'string',
);

function contains(a, b) {
  if (a === undefined || b === undefined) {
    return false;
  }
  return a.indexOf(b) != -1;
}

wrapFunctionAsNode(
  'string/contains',
  contains,
  ['string', 'string'],
  'boolean',
);

function toUpperCase(a) {
  if (a != null && a.constructor === String) {
    return a.toUpperCase();
  }
  return a;
}

wrapFunctionAsNode(
  'string/toUpperCase',
  toUpperCase,
  ['string'],
  'string',
);

function split(str, separator) {
  if (separator == null) { separator = this.properties.separator; }
  if (str == null) { return []; }
  if (str.constructor === String) { return str.split(separator || ' '); }
  if (str.constructor === Array) {
    const r = [];
    for (let i = 0; i < str.length; ++i) {
      if (typeof str[i] === 'string') { r[i] = str[i].split(separator || ' '); }
    }
    return r;
  }
  return null;
}

wrapFunctionAsNode(
  'string/split',
  split,
  ['string,array', 'string'],
  'array',
  { separator: ',' },
);

function toFixed(a) {
  if (a != null && a.constructor === Number) {
    return a.toFixed(this.properties.precision);
  }
  return a;
}

wrapFunctionAsNode(
  'string/toFixed',
  toFixed,
  ['number'],
  'string',
  { precision: 0 },
);

class StringToTable {
  constructor() {
    this.addInput('', 'string');
    this.addOutput('table', 'table');
    this.addOutput('rows', 'number');
    this.addProperty('value', '');
    this.addProperty('separator', ',');
    this._table = null;
  }

  onExecute() {
    const input = this.getInputData(0);
    if (!input) { return; }
    const separator = this.properties.separator || ',';
    if (input != this._str || separator != this._last_separator) {
      this._last_separator = separator;
      this._str = input;
      this._table = input.split('\n').map((a) => a.trim().split(separator));
    }
    this.setOutputData(0, this._table);
    this.setOutputData(1, this._table ? this._table.length : 0);
  }

  static title = 'toTable';

  static desc = 'Splits a string to table';
}
registerNodeType('string/toTable', StringToTable);
