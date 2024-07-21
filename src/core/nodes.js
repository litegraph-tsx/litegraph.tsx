import { LGraphEvents } from './events';
import { LGraphSettings } from './settings';

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
