import { LGraphEvents } from './events';
import { LGraphNode } from './LGraphNode';
import { LGraphSettings } from './settings';
import { getParameterNames } from './utilities';

export const LGraphNodeRegistry = {
  registered_node_types: {}, // nodetypes by string
  node_types_by_file_extension: {}, // used for dropping files in the canvas
  Nodes: {}, // node types by classname
  Globals: {},
  searchbox_extras: {},

  // set these values if not using auto_load_slot_types
  registered_slot_in_types: {}, // slot types for nodeclass
  registered_slot_out_types: {}, // slot types for nodeclass
  slot_types_in: [], // slot types IN
  slot_types_out: [], // slot types OUT
  slot_types_default_in: [], // specify for each IN slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  slot_types_default_out: [], // specify for each OUT slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search

};


/**
 * Returns a registered node type with a given name
 * @method getNodeType
 * @param {String} type full name of the node class. p.e. "math/sin"
 * @return {Class} the node class
 */
export function getNodeType(type) {
  return LGraphNodeRegistry.registered_node_types[type];
}

/**
 * Returns a list of node types matching one category
 * @method getNodeType
 * @param {String} category category name
 * @return {Array} array with all the node classes
 */
export function getNodeTypesInCategory(category, filter) {
  const r = [];
  for (const i in LGraphNodeRegistry.registered_node_types) {
    const type = LGraphNodeRegistry.registered_node_types[i];
    if (type.filter != filter) {
      continue;
    }

    if (category == '') {
      if (type.category == null) {
        r.push(type);
      }
    } else if (type.category == category) {
      r.push(type);
    }
  }

  if (LGraphSettings.auto_sort_node_types) {
    r.sort((a, b) => a.title.localeCompare(b.title));
  }

  return r;
}

/**
 * Returns a list with all the node type categories
 * @method getNodeTypesCategories
 * @param {String} filter only nodes with ctor.filter equal can be shown
 * @return {Array} array with all the names of the categories
 */
export function getNodeTypesCategories(filter) {
  const categories = { '': 1 };
  for (var i in LGraphNodeRegistry.registered_node_types) {
    const type = LGraphNodeRegistry.registered_node_types[i];
    if (type.category && !type.skip_list) {
      if (type.filter != filter) continue;
      categories[type.category] = 1;
    }
  }
  const result = [];
  for (var i in categories) {
    result.push(i);
  }
  return LGraphSettings.auto_sort_node_types ? result.sort() : result;
}

/**
 * Register a node class so it can be listed when the user wants to create a new one
 * @method registerNodeType
 * @param {String} type name of the node and path
 * @param {Class} base_class class containing the structure of a node
 */
export function registerNodeType(type, base_class) {
  if (!base_class.prototype) {
    throw 'Cannot register a simple object, it must be a class with a prototype';
  }
  base_class.type = type;

  if (LGraphSettings.debug) {
    console.log(`Node registered: ${type}`);
  }

  const classname = base_class.name;

  const pos = type.lastIndexOf('/');
  base_class.category = type.substring(0, pos);

  if (!base_class.title) {
    base_class.title = classname;
  }

  // extend class
  const propertyDescriptors = Object.getOwnPropertyDescriptors(LGraphNode.prototype);
  Object.keys(propertyDescriptors).forEach((propertyName) => {
    if (!base_class.prototype.hasOwnProperty(propertyName)) {
      Object.defineProperty(base_class.prototype, propertyName, propertyDescriptors[propertyName]);
    }
  });

  const prev = LGraphNodeRegistry.registered_node_types[type];
  if (prev) {
    console.log(`replacing node type: ${type}`);
  }
  if (!Object.prototype.hasOwnProperty.call(base_class.prototype, 'shape')) {
    Object.defineProperty(base_class.prototype, 'shape', {
      set(v) {
        switch (v) {
          case 'default':
            delete this._shape;
            break;
          case 'box':
            this._shape = LGraphStyles.BOX_SHAPE;
            break;
          case 'round':
            this._shape = LGraphStyles.ROUND_SHAPE;
            break;
          case 'circle':
            this._shape = LGraphStyles.CIRCLE_SHAPE;
            break;
          case 'card':
            this._shape = LGraphStyles.CARD_SHAPE;
            break;
          default:
            this._shape = v;
        }
      },
      get() {
        return this._shape;
      },
      enumerable: true,
      configurable: true,
    });

    // used to know which nodes to create when dragging files to the canvas
    if (base_class.supported_extensions) {
      for (const i in base_class.supported_extensions) {
        const ext = base_class.supported_extensions[i];
        if (ext && ext.constructor === String) {
          LGraphNodeRegistry.node_types_by_file_extension[ext.toLowerCase()] = base_class;
        }
      }
    }
  }

  LGraphNodeRegistry.registered_node_types[type] = base_class;
  if (base_class.constructor.name) {
    LGraphNodeRegistry.Nodes[classname] = base_class;
  }
  if (LGraphNodeRegistry.onNodeTypeRegistered) {
    LGraphNodeRegistry.onNodeTypeRegistered(type, base_class);
  }
  if (prev && LGraphNodeRegistry.onNodeTypeReplaced) {
    LGraphNodeRegistry.onNodeTypeReplaced(type, base_class, prev);
  }

  // warnings
  if (base_class.prototype.onPropertyChange) {
    console.warn(`LiteGraph node class ${type} has onPropertyChange method, it must be called onPropertyChanged with d at the end`);
  }

  // TODO one would want to know input and ouput :: this would allow through registerNodeAndSlotType to get all the slots types
  if (LGraphSettings.auto_load_slot_types) {
    new base_class(base_class.title || 'tmpnode');
  }
}

/**
 * removes a node type from the system
 * @method unregisterNodeType
 * @param {String|Object} type name of the node or the node constructor itself
 */
export function unregisterNodeType(type) {
  const base_class = type.constructor === String
    ? LGraphNodeRegistry.registered_node_types[type]
    : type;
  if (!base_class) {
    throw `node type not found: ${type}`;
  }
  delete LGraphNodeRegistry.registered_node_types[base_class.type];
  if (base_class.constructor.name) {
    delete LGraphNodeRegistry.Nodes[base_class.constructor.name];
  }
}

/**
 * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
 * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
 * @method wrapFunctionAsNode
 * @param {String} name node name with namespace (p.e.: 'math/sum')
 * @param {Function} func
 * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
 * @param {String} return_type [optional] string with the return type, otherwise it will be generic
 * @param {Object} properties [optional] properties to be configurable
 */
export function wrapFunctionAsNode(
  name,
  func,
  param_types,
  return_type,
  properties,
) {
  const params = Array(func.length);
  let code = '';
  if (param_types !== null) // null means no inputs
  {
    const names = getParameterNames(func);
    for (let i = 0; i < names.length; ++i) {
      let type = 0;
      if (param_types) {
        // type = param_types[i] != null ? "'" + param_types[i] + "'" : "0";
        if (param_types[i] != null && param_types[i].constructor === String) type = `'${param_types[i]}'`;
        else if (param_types[i] != null) type = param_types[i];
      }
      code
                        += `this.addInput('${
          names[i]
        }',${
          type
        });\n`;
    }
  }
  if (return_type !== null) // null means no output
  {
    code
                += `this.addOutput('out',${
        return_type != null ? (return_type.constructor === String ? `'${return_type}'` : return_type) : 0
      });\n`;
  }
  if (properties) {
    code
                    += `this.properties = ${JSON.stringify(properties)};\n`;
  }
  const classobj = Function(code);
  classobj.title = name.split('/').pop();
  classobj.desc = `Generated from ${func.name}`;
  classobj.prototype.onExecute = function onExecute() {
    for (let i = 0; i < params.length; ++i) {
      params[i] = this.getInputData(i);
    }
    const r = func.apply(this, params);
    this.setOutputData(0, r);
  };
  registerNodeType(name, classobj);
  return classobj;
}

/**
 * Removes all previously registered node's types
 */
export function clearRegisteredTypes() {
  LGraphNodeRegistry.registered_node_types = {};
  LGraphNodeRegistry.node_types_by_file_extension = {};
  LGraphNodeRegistry.Nodes = {};
  LGraphNodeRegistry.searchbox_extras = {};
}

/**
    * Save a slot type and his node
    * @method registerSlotType
    * @param {String|Object} type name of the node or the node constructor itself
    * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
    */
export function registerNodeAndSlotType(type, slot_type, out) {
  out = out || false;
  const base_class = type.constructor === String
                && LGraphNodeRegistry.registered_node_types[type] !== 'anonymous'
    ? LGraphNodeRegistry.registered_node_types[type]
    : type;

  const class_type = base_class.constructor.type;

  let allTypes = [];
  if (typeof slot_type === 'string') {
    allTypes = slot_type.split(',');
  } else if (slot_type == LGraphEvents.EVENT || slot_type == LGraphEvents.ACTION) {
    allTypes = ['_event_'];
  } else {
    allTypes = ['*'];
  }

  for (let i = 0; i < allTypes.length; ++i) {
    let slotType = allTypes[i];
    if (slotType === '') {
      slotType = '*';
    }
    const registerTo = out
      ? 'registered_slot_out_types'
      : 'registered_slot_in_types';
    if (LGraphNodeRegistry[registerTo][slotType] === undefined) {
      LGraphNodeRegistry[registerTo][slotType] = { nodes: [] };
    }
    if (!LGraphNodeRegistry[registerTo][slotType].nodes.includes(class_type)) {
      LGraphNodeRegistry[registerTo][slotType].nodes.push(class_type);
    }

    // check if is a new type
    if (!out) {
      if (!LGraphNodeRegistry.slot_types_in.includes(slotType.toLowerCase())) {
        LGraphNodeRegistry.slot_types_in.push(slotType.toLowerCase());
        LGraphNodeRegistry.slot_types_in.sort();
      }
    } else if (!LGraphNodeRegistry.slot_types_out.includes(slotType.toLowerCase())) {
      LGraphNodeRegistry.slot_types_out.push(slotType.toLowerCase());
      LGraphNodeRegistry.slot_types_out.sort();
    }
  }
}

/**
 * Create a new nodetype by passing an object with some properties
 * like onCreate, inputs:Array, outputs:Array, properties, onExecute
 * @method buildNodeClassFromObject
 * @param {String} name node name with namespace (p.e.: 'math/sum')
 * @param {Object} object methods expected onCreate, inputs, outputs, properties, onExecute
 */
export function buildNodeClassFromObject(
  name,
  object,
) {
  let ctor_code = '';
  if (object.inputs) {
    for (var i = 0; i < object.inputs.length; ++i) {
      var _name = object.inputs[i][0];
      var _type = object.inputs[i][1];
      if (_type && _type.constructor === String) _type = `"${_type}"`;
      ctor_code += `this.addInput('${_name}',${_type});\n`;
    }
  }
  if (object.outputs) {
    for (var i = 0; i < object.outputs.length; ++i) {
      var _name = object.outputs[i][0];
      var _type = object.outputs[i][1];
      if (_type && _type.constructor === String) _type = `"${_type}"`;
      ctor_code += `this.addOutput('${_name}',${_type});\n`;
    }
  }
  if (object.properties) {
    for (var i in object.properties) {
      let prop = object.properties[i];
      if (prop && prop.constructor === String) prop = `"${prop}"`;
      ctor_code += `this.addProperty('${i}',${prop});\n`;
    }
  }
  ctor_code += 'if(this.onCreate)this.onCreate()';
  const classobj = Function(ctor_code);
  for (var i in object) if (i != 'inputs' && i != 'outputs' && i != 'properties') classobj.prototype[i] = object[i];
  classobj.title = object.title || name.split('/').pop();
  classobj.desc = object.desc || 'Generated from object';
  registerNodeType(name, classobj);
  return classobj;
}

/**
 * Adds this method to all nodetypes, existing and to be created
 * (You can add it to LGraphNode.prototype but then existing node types wont have it)
 * @method addNodeMethod
 * @param {Function} func
 */
export function addNodeMethod(name, func) {
  LGraphNode.prototype[name] = func;
  for (const i in LGraphNodeRegistry.registered_node_types) {
    const type = LGraphNodeRegistry.registered_node_types[i];
    if (type.prototype[name]) {
      type.prototype[`_${name}`] = type.prototype[name];
    } // keep old in case of replacing
    type.prototype[name] = func;
  }
}