import { LiteGraph } from './litegraph';
import { console } from './Console';

/**
 * Base Class for all the node type classes.
 *
 * @class LGraphNode
 * @param {String} name A name for the node.
 *
 * @property {String} title Title of the node.
 * @property {Array.<Number>} pos Position of the node in the graph, [x, y].
 * @property {Array.<Number>} size Size of the node, [width, height].
 * @property {Object[]} input|output List of every connection:
 *   - {String} name Name of the connection.
 *   - {String} type Type of the connection.
 *   - {Array.<Number>=} pos Position of the connection, optional.
 *   - {String} direction Direction of the connection, "input" or "output".
 *   - {Array} links Array of links.
 * @property {Object} general_properties General properties:
 *   - {Boolean} clip_area If true, render outside the node is clipped.
 *   - {Boolean} unsafe_execution Not allowed for safe execution.
 *   - {Boolean} skip_repeated_outputs New outputs won't show if one is already connected.
 *   - {Boolean} resizable If false, node cannot be resized with the mouse.
 *   - {Boolean} horizontal Slots are distributed horizontally.
 *   - {Number} widgets_start_y Y distance from the top of the node where widgets start.
 * @property {Object} flags Flags object:
 *   - {Boolean} collapsed If true, the node is collapsed.
 * @property {Object} supported_callbacks Supported callbacks:
 *   - {Function} onAdded Called when added to graph.
 *   - {Function} onRemoved Called when removed from graph.
 *   - {Function} onStart Called when the graph starts playing.
 *   - {Function} onStop Called when the graph stops playing.
 *   - {Function} onDrawForeground Render inside widgets inside the node.
 *   - {Function} onDrawBackground Render background area inside the node (edit mode only).
 *   - {Function} onMouseDown
 *   - {Function} onMouseMove
 *   - {Function} onMouseUp
 *   - {Function} onMouseEnter
 *   - {Function} onMouseLeave
 *   - {Function} onExecute Execute the node.
 *   - {Function} onPropertyChanged Called when a property is changed (return true to skip default behavior).
 *   - {Function} onGetInputs Returns an array of possible inputs.
 *   - {Function} onGetOutputs Returns an array of possible outputs.
 *   - {Function} onBounding Called if the node has a larger bounding than itself (receives [x, y, w, h]).
 *   - {Function} onDblClick Double-clicked in the node.
 *   - {Function} onInputDblClick Double-clicked on input slot (automatically create connected node).
 *   - {Function} onOutputDblClick Double-clicked on output slot (automatically create connected node).
 *   - {Function} onConfigure Called after the node has been configured.
 *   - {Function} onSerialize Adds extra info when serializing (receives object to fill with data).
 *   - {Function} onSelected Called when node is selected.
 *   - {Function} onDeselected Called when node is deselected.
 *   - {Function} onDropItem Called when DOM item is dropped over the node.
 *   - {Function} onDropFile Called when file is dropped over the node.
 *   - {Function} onConnectInput If returns false, incoming connection will be canceled.
 *   - {Function} onConnectionsChange Called when a connection changes (LiteGraph.INPUT or LiteGraph.OUTPUT, slot, connected, link_info, input_info).
 *   - {Function} onAction Action slot triggered.
 *   - {Function} getExtraMenuOptions Adds options to context menu.
 */
export class LGraphNode {
  constructor(title) {
    this._ctor(title);
  }

  _ctor(title) {
    this.title = title || 'Unnamed';
    this.size = [LiteGraph.NODE_WIDTH, 60];
    this.graph = null;

    this._pos = new Float32Array(10, 10);

    if (LiteGraph.use_uuids) {
      this.id = LiteGraph.uuidv4();
    } else {
      this.id = -1; // not know till not added
    }
    this.type = null;

    // inputs available: array of inputs
    this.inputs = [];
    this.outputs = [];
    this.connections = [];

    // local data
    this.properties = {}; // for the values
    this.properties_info = []; // for the info

    this.flags = {};
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

  /**
   * configure a node from an object containing the serialized info
   * @method configure
   */
  configure(info) {
    if (this.graph) {
      this.graph._version++;
    }
    for (var j in info) {
      if (j == 'properties') {
        // i don't want to clone properties, I want to reuse the old container
        for (const k in info.properties) {
          this.properties[k] = info.properties[k];
          if (this.onPropertyChanged) {
            this.onPropertyChanged(k, info.properties[k]);
          }
        }
        continue;
      }

      if (info[j] == null) {
        continue;
      } else if (typeof info[j] === 'object') {
        // object
        if (this[j] && this[j].configure) {
          this[j].configure(info[j]);
        } else {
          this[j] = LiteGraph.cloneObject(info[j], this[j]);
        }
      } // value
      else {
        this[j] = info[j];
      }
    }

    if (!info.title) {
      this.title = this.constructor.title;
    }

    if (this.inputs) {
      for (var i = 0; i < this.inputs.length; ++i) {
        const input = this.inputs[i];
        var link_info = this.graph ? this.graph.links[input.link] : null;
        if (this.onConnectionsChange) this.onConnectionsChange(LiteGraph.INPUT, i, true, link_info, input); // link_info has been created now, so its updated

        if (this.onInputAdded) this.onInputAdded(input);
      }
    }

    if (this.outputs) {
      for (var i = 0; i < this.outputs.length; ++i) {
        const output = this.outputs[i];
        if (!output.links) {
          continue;
        }
        for (var j = 0; j < output.links.length; ++j) {
          var link_info = this.graph ? this.graph.links[output.links[j]] : null;
          if (this.onConnectionsChange) this.onConnectionsChange(LiteGraph.OUTPUT, i, true, link_info, output); // link_info has been created now, so its updated
        }

        if (this.onOutputAdded) this.onOutputAdded(output);
      }
    }

    if (this.widgets) {
      for (var i = 0; i < this.widgets.length; ++i) {
        const w = this.widgets[i];
        if (!w) continue;
        if (w.options && w.options.property && (this.properties[w.options.property] != undefined)) w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
      }
      if (info.widgets_values) {
        for (var i = 0; i < info.widgets_values.length; ++i) {
          if (this.widgets[i]) {
            this.widgets[i].value = info.widgets_values[i];
          }
        }
      }
    }

    if (this.onConfigure) {
      this.onConfigure(info);
    }
  }

  /**
   * serialize the content
   * @method serialize
   */
  serialize() {
    // create serialization object
    const o = {
      id: this.id,
      type: this.type,
      pos: this.pos,
      size: this.size,
      flags: LiteGraph.cloneObject(this.flags),
      order: this.order,
      mode: this.mode,
    };

    // special case for when there were errors
    if (this.constructor === LGraphNode && this.last_serialization) {
      return this.last_serialization;
    }

    if (this.inputs) {
      o.inputs = this.inputs;
    }

    if (this.outputs) {
      // clear outputs last data (because data in connections is never serialized but stored inside the outputs info)
      for (var i = 0; i < this.outputs.length; i++) {
        delete this.outputs[i]._data;
      }
      o.outputs = this.outputs;
    }

    if (this.title && this.title != this.constructor.title) {
      o.title = this.title;
    }

    if (this.properties) {
      o.properties = LiteGraph.cloneObject(this.properties);
    }

    if (this.widgets && this.serialize_widgets) {
      o.widgets_values = [];
      for (var i = 0; i < this.widgets.length; ++i) {
        if (this.widgets[i]) o.widgets_values[i] = this.widgets[i].value;
        else o.widgets_values[i] = null;
      }
    }

    if (!o.type) {
      o.type = this.constructor.type;
    }

    if (this.color) {
      o.color = this.color;
    }
    if (this.bgcolor) {
      o.bgcolor = this.bgcolor;
    }
    if (this.boxcolor) {
      o.boxcolor = this.boxcolor;
    }
    if (this.shape) {
      o.shape = this.shape;
    }

    if (this.onSerialize) {
      if (this.onSerialize(o)) {
        console.warn('node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter');
      }
    }

    return o;
  }

  /**
   * Creates a clone of this node.
   *
   * @returns {LGraphNode} A cloned instance of the current node.
   */
  clone() {
    const node = LiteGraph.createNode(this.type);
    if (!node) {
      return null;
    }

    // we clone it because serialize returns shared containers
    const data = LiteGraph.cloneObject(this.serialize());

    // remove links
    if (data.inputs) {
      for (var i = 0; i < data.inputs.length; ++i) {
        data.inputs[i].link = null;
      }
    }

    if (data.outputs) {
      for (var i = 0; i < data.outputs.length; ++i) {
        if (data.outputs[i].links) {
          data.outputs[i].links.length = 0;
        }
      }
    }

    delete data.id;

    if (LiteGraph.use_uuids) {
      data.id = LiteGraph.uuidv4();
    }

    // remove links
    node.configure(data);

    return node;
  }

  /**
   * serialize and stringify
   * @method toString
   */
  toString() {
    return JSON.stringify(this.serialize());
  }

  /*
   * @TODO: Evaluate truthiness of this in modern context
   * LGraphNode.prototype.deserialize = function(info) {} //this cannot be done from within, must be done in LiteGraph
   */

  /**
   * get the title string
   * @method getTitle
   */
  getTitle() {
    return this.title || this.constructor.title;
  }

  /**
   * sets the value of a property
   * @method setProperty
   * @param {String} name
   * @param {*} value
   */
  setProperty(name, value) {
    if (!this.properties) {
      this.properties = {};
    }
    if (value === this.properties[name]) return;
    const prev_value = this.properties[name];
    this.properties[name] = value;
    if (this.onPropertyChanged) {
      if (this.onPropertyChanged(name, value, prev_value) === false) // abort change
      { this.properties[name] = prev_value; }
    }
    if (this.widgets) // widgets could be linked to properties
    {
      for (let i = 0; i < this.widgets.length; ++i) {
        const w = this.widgets[i];
        if (!w) continue;
        if (w.options.property == name) {
          w.value = value;
          break;
        }
      }
    }
  }

  // Execution Related:
  /**
   * sets the output data
   * @method setOutputData
   * @param {number} slot
   * @param {*} data
   */
  setOutputData(slot, data) {
    if (!this.outputs) {
      return;
    }

    // this maybe slow and a niche case
    // if(slot && slot.constructor === String)
    //    slot = this.findOutputSlot(slot);

    if (slot == -1 || slot >= this.outputs.length) {
      return;
    }

    const output_info = this.outputs[slot];
    if (!output_info) {
      return;
    }

    // store data in the output itself in case we want to debug
    output_info._data = data;

    // if there are connections, pass the data to the connections
    if (this.outputs[slot].links) {
      for (let i = 0; i < this.outputs[slot].links.length; i++) {
        const link_id = this.outputs[slot].links[i];
        const link = this.graph.links[link_id];
        if (link) link.data = data;
      }
    }
  }

  /**
   * sets the output data type, useful when you want to be able to overwrite the data type
   * @method setOutputDataType
   * @param {number} slot
   * @param {String} datatype
   */
  setOutputDataType(slot, type) {
    if (!this.outputs) {
      return;
    }
    if (slot == -1 || slot >= this.outputs.length) {
      return;
    }
    const output_info = this.outputs[slot];
    if (!output_info) {
      return;
    }
    // store data in the output itself in case we want to debug
    output_info.type = type;

    // if there are connections, pass the data to the connections
    if (this.outputs[slot].links) {
      for (let i = 0; i < this.outputs[slot].links.length; i++) {
        const link_id = this.outputs[slot].links[i];
        this.graph.links[link_id].type = type;
      }
    }
  }

  /**
   * Retrieves the input data (data traveling through the connection) from one slot
   * @method getInputData
   * @param {number} slot
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns undefined
   */
  getInputData(slot, force_update) {
    if (!this.inputs) {
      return;
    } // undefined;

    if (slot >= this.inputs.length || this.inputs[slot].link == null) {
      return;
    }

    const link_id = this.inputs[slot].link;
    const link = this.graph.links[link_id];
    if (!link) {
      // bug: weird case but it happens sometimes
      return null;
    }

    if (!force_update) {
      return link.data;
    }

    // special case: used to extract data from the incoming connection before the graph has been executed
    const node = this.graph.getNodeById(link.origin_id);
    if (!node) {
      return link.data;
    }

    if (node.updateOutputData) {
      node.updateOutputData(link.origin_slot);
    } else if (node.onExecute) {
      node.onExecute();
    }

    return link.data;
  }

  /**
   * Retrieves the input data type (in case this supports multiple input types)
   * @method getInputDataType
   * @param {number} slot
   * @return {String} datatype in string format
   */
  getInputDataType(slot) {
    if (!this.inputs) {
      return null;
    } // undefined;

    if (slot >= this.inputs.length || this.inputs[slot].link == null) {
      return null;
    }
    const link_id = this.inputs[slot].link;
    const link = this.graph.links[link_id];
    if (!link) {
      // bug: weird case but it happens sometimes
      return null;
    }
    const node = this.graph.getNodeById(link.origin_id);
    if (!node) {
      return link.type;
    }
    const output_info = node.outputs[link.origin_slot];
    if (output_info) {
      return output_info.type;
    }
    return null;
  }

  /**
   * Retrieves the input data from one slot using its name instead of slot number
   * @method getInputDataByName
   * @param {String} slot_name
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns null
   */
  getInputDataByName(slot_name, force_update) {
    const slot = this.findInputSlot(slot_name);
    if (slot == -1) {
      return null;
    }
    return this.getInputData(slot, force_update);
  }

  /**
   * tells you if there is a connection in one input slot
   * @method isInputConnected
   * @param {number} slot
   * @return {boolean}
   */
  isInputConnected(slot) {
    if (!this.inputs) {
      return false;
    }
    return slot < this.inputs.length && this.inputs[slot].link != null;
  }

  /**
   * tells you info about an input connection (which node, type, etc)
   * @method getInputInfo
   * @param {number} slot
   * @return {Object} object or null { link: id, name: string, type: string or 0 }
   */
  getInputInfo(slot) {
    if (!this.inputs) {
      return null;
    }
    if (slot < this.inputs.length) {
      return this.inputs[slot];
    }
    return null;
  }

  /**
   * Returns the link info in the connection of an input slot
   * @method getInputLink
   * @param {number} slot
   * @return {LLink} object or null
   */
  getInputLink(slot) {
    if (!this.inputs) {
      return null;
    }
    if (slot < this.inputs.length) {
      const slot_info = this.inputs[slot];
      return this.graph.links[slot_info.link];
    }
    return null;
  }

  /**
   * returns the node connected in the input slot
   * @method getInputNode
   * @param {number} slot
   * @return {LGraphNode} node or null
   */
  getInputNode(slot) {
    if (!this.inputs) {
      return null;
    }
    if (slot >= this.inputs.length) {
      return null;
    }
    const input = this.inputs[slot];
    if (!input || input.link === null) {
      return null;
    }
    const link_info = this.graph.links[input.link];
    if (!link_info) {
      return null;
    }
    return this.graph.getNodeById(link_info.origin_id);
  }

  /**
   * returns the value of an input with this name, otherwise checks if there is a property with that name
   * @method getInputOrProperty
   * @param {string} name
   * @return {*} value
   */
  getInputOrProperty(name) {
    if (!this.inputs || !this.inputs.length) {
      return this.properties ? this.properties[name] : null;
    }

    for (let i = 0, l = this.inputs.length; i < l; ++i) {
      const input_info = this.inputs[i];
      if (name == input_info.name && input_info.link != null) {
        const link = this.graph.links[input_info.link];
        if (link) {
          return link.data;
        }
      }
    }
    return this.properties[name];
  }

  /**
   * tells you the last output data that went in that slot
   * @method getOutputData
   * @param {number} slot
   * @return {Object}  object or null
   */
  getOutputData(slot) {
    if (!this.outputs) {
      return null;
    }
    if (slot >= this.outputs.length) {
      return null;
    }

    const info = this.outputs[slot];
    return info._data;
  }

  /**
   * tells you info about an output connection (which node, type, etc)
   * @method getOutputInfo
   * @param {number} slot
   * @return {Object}  object or null { name: string, type: string, links: [ ids of links in number ] }
   */
  getOutputInfo(slot) {
    if (!this.outputs) {
      return null;
    }
    if (slot < this.outputs.length) {
      return this.outputs[slot];
    }
    return null;
  }

  /**
   * tells you if there is a connection in one output slot
   * @method isOutputConnected
   * @param {number} slot
   * @return {boolean}
   */
  isOutputConnected(slot) {
    if (!this.outputs) {
      return false;
    }
    return (
      slot < this.outputs.length
                && this.outputs[slot].links
                && this.outputs[slot].links.length
    );
  }

  /**
   * tells you if there is any connection in the output slots
   * @method isAnyOutputConnected
   * @return {boolean}
   */
  isAnyOutputConnected() {
    if (!this.outputs) {
      return false;
    }
    for (let i = 0; i < this.outputs.length; ++i) {
      if (this.outputs[i].links && this.outputs[i].links.length) {
        return true;
      }
    }
    return false;
  }

  /**
   * retrieves all the nodes connected to this output slot
   * @method getOutputNodes
   * @param {number} slot
   * @return {array}
   */
  getOutputNodes(slot) {
    if (!this.outputs || this.outputs.length == 0) {
      return null;
    }

    if (slot >= this.outputs.length) {
      return null;
    }

    const output = this.outputs[slot];
    if (!output.links || output.links.length == 0) {
      return null;
    }

    const r = [];
    for (let i = 0; i < output.links.length; i++) {
      const link_id = output.links[i];
      const link = this.graph.links[link_id];
      if (link) {
        const target_node = this.graph.getNodeById(link.target_id);
        if (target_node) {
          r.push(target_node);
        }
      }
    }
    return r;
  }

  /**
   * Adds an 'onTrigger' input slot to the node if it doesn't already exist.
   * If the slot already exists, returns its index.
   *
   * @returns {number} Index of the 'onTrigger' input slot.
   */
  addOnTriggerInput() {
    const trigS = this.findInputSlot('onTrigger');
    if (trigS == -1) { // !trigS ||
      const input = this.addInput('onTrigger', LiteGraph.EVENT, { optional: true, nameLocked: true });
      return this.findInputSlot('onTrigger');
    }
    return trigS;
  }

  /**
   * Adds an 'onExecuted' output slot to the node if it doesn't already exist.
   * If the slot already exists, returns its index.
   *
   * @returns {number} Index of the 'onExecuted' output slot.
   */
  addOnExecutedOutput() {
    const trigS = this.findOutputSlot('onExecuted');
    if (trigS == -1) { // !trigS ||
      const output = this.addOutput('onExecuted', LiteGraph.ACTION, { optional: true, nameLocked: true });
      return this.findOutputSlot('onExecuted');
    }
    return trigS;
  }

  /**
   * Executes the 'onExecuted' output slot of the node if it exists, passing the provided parameters.
   *
   * @param {*} param - The parameter to pass to the output slot.
   * @param {*} options - Options to be passed along with the parameter.
   */
  onAfterExecuteNode(param, options) {
    const trigS = this.findOutputSlot('onExecuted');
    if (trigS != -1) {
      console.debug(`${this.id}:${this.order} triggering slot onAfterExecute`);
      console.debug(param);
      console.debug(options);
      this.triggerSlot(trigS, param, null, options);
    }
  }

  /**
   * Changes the execution mode of the node based on the provided modeTo value.
   *
   * @param {number} modeTo - The mode to change to. Should be one of the LiteGraph mode constants:
   *                          LiteGraph.ON_EVENT, LiteGraph.ON_TRIGGER, LiteGraph.NEVER,
   *                          LiteGraph.ALWAYS, LiteGraph.ON_REQUEST.
   * @returns {boolean} - Returns true if the mode change was successful, false otherwise.
   */
  changeMode(modeTo) {
    switch (modeTo) {
      case LiteGraph.ON_EVENT:
        // this.addOnExecutedOutput();
        break;

      case LiteGraph.ON_TRIGGER:
        this.addOnTriggerInput();
        this.addOnExecutedOutput();
        break;

      case LiteGraph.NEVER:
        break;

      case LiteGraph.ALWAYS:
        break;

      case LiteGraph.ON_REQUEST:
        break;

      default:
        return false;
    }
    this.mode = modeTo;
    return true;
  }

  /**
   * Triggers the execution of actions that were deferred when the action was triggered
   * @method executePendingActions
   */
  executePendingActions() {
    if (!this._waiting_actions || !this._waiting_actions.length) return;
    for (let i = 0; i < this._waiting_actions.length; ++i) {
      const p = this._waiting_actions[i];
      this.onAction(p[0], p[1], p[2], p[3], p[4]);
    }
    this._waiting_actions.length = 0;
  }

  /**
   * Triggers the node code execution, place a boolean/counter to mark the node as being executed
   * @method doExecute
   * @param {*} param
   * @param {*} options
   */
  doExecute(param, options) {
    options = options || {};
    if (this.onExecute) {
      // enable this to give the event an ID
      if (!options.action_call) options.action_call = `${this.id}_exec_${Math.floor(Math.random() * 9999)}`;

      this.graph.nodes_executing[this.id] = true; // .push(this.id);

      this.onExecute(param, options);

      this.graph.nodes_executing[this.id] = false; // .pop();

      // save execution/action ref
      this.exec_version = this.graph.iteration;
      if (options && options.action_call) {
        this.action_call = options.action_call; // if (param)
        this.graph.nodes_executedAction[this.id] = options.action_call;
      }
    }
    this.execute_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
    if (this.onAfterExecuteNode) this.onAfterExecuteNode(param, options); // callback
  }

  /**
   * Triggers an action, wrapped by logics to control execution flow
   * @method actionDo
   * @param {String} action name
   * @param {*} param
   */
  actionDo(action, param, options, action_slot) {
    options = options || {};
    if (this.onAction) {
      // enable this to give the event an ID
      if (!options.action_call) options.action_call = `${this.id}_${action || 'action'}_${Math.floor(Math.random() * 9999)}`;

      this.graph.nodes_actioning[this.id] = (action || 'actioning'); // .push(this.id);

      this.onAction(action, param, options, action_slot);

      this.graph.nodes_actioning[this.id] = false; // .pop();

      // save execution/action ref
      if (options && options.action_call) {
        this.action_call = options.action_call; // if (param)
        this.graph.nodes_executedAction[this.id] = options.action_call;
      }
    }
    this.action_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
    if (this.onAfterExecuteNode) this.onAfterExecuteNode(param, options);
  }

  /**
   * Triggers an event in this node, this will trigger any output with the same name
   * @method trigger
   * @param {String} event name ( "on_play", ... ) if action is equivalent to false then the event is send to all
   * @param {*} param
   */
  trigger(action, param, options) {
    if (!this.outputs || !this.outputs.length) {
      return;
    }

    if (this.graph) this.graph._last_trigger_time = LiteGraph.getTime();

    for (let i = 0; i < this.outputs.length; ++i) {
      const output = this.outputs[i];
      if (!output || output.type !== LiteGraph.EVENT || (action && output.name != action)) continue;
      this.triggerSlot(i, param, null, options);
    }
  }

  /**
   * Triggers a slot event in this node: cycle output slots and launch execute/action on connected nodes
   * @method triggerSlot
   * @param {Number} slot the index of the output slot
   * @param {*} param
   * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
   */
  triggerSlot(slot, param, link_id, options) {
    options = options || {};
    if (!this.outputs) {
      return;
    }

    if (slot == null) {
      console.error('slot must be a number');
      return;
    }

    if (slot.constructor !== Number) console.warn("slot must be a number, use node.trigger('name') if you want to use a string");

    const output = this.outputs[slot];
    if (!output) {
      return;
    }

    const { links } = output;
    if (!links || !links.length) {
      return;
    }

    if (this.graph) {
      this.graph._last_trigger_time = LiteGraph.getTime();
    }

    // for every link attached here
    for (let k = 0; k < links.length; ++k) {
      const id = links[k];
      if (link_id != null && link_id != id) {
        // to skip links
        continue;
      }
      const link_info = this.graph.links[links[k]];
      if (!link_info) {
        // not connected
        continue;
      }
      link_info._last_time = LiteGraph.getTime();
      const node = this.graph.getNodeById(link_info.target_id);
      if (!node) {
        // node not found?
        continue;
      }

      // used to mark events in graph
      var target_connection = node.inputs[link_info.target_slot];

      if (node.mode === LiteGraph.ON_TRIGGER) {
        // generate unique trigger ID if not present
        if (!options.action_call) options.action_call = `${this.id}_trigg_${Math.floor(Math.random() * 9999)}`;
        if (node.onExecute) {
          // -- wrapping node.onExecute(param); --
          node.doExecute(param, options);
        }
      } else if (node.onAction) {
        // generate unique action ID if not present
        if (!options.action_call) options.action_call = `${this.id}_act_${Math.floor(Math.random() * 9999)}`;
        // pass the action name
        var target_connection = node.inputs[link_info.target_slot];

        // instead of executing them now, it will be executed in the next graph loop, to ensure data flow
        if (LiteGraph.use_deferred_actions && node.onExecute) {
          if (!node._waiting_actions) node._waiting_actions = [];
          node._waiting_actions.push([target_connection.name, param, options, link_info.target_slot]);
        } else {
          // wrap node.onAction(target_connection.name, param);
          node.actionDo(target_connection.name, param, options, link_info.target_slot);
        }
      }
    }
  }

  /**
   * clears the trigger slot animation
   * @method clearTriggeredSlot
   * @param {Number} slot the index of the output slot
   * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
   */
  clearTriggeredSlot(slot, link_id) {
    if (!this.outputs) {
      return;
    }

    const output = this.outputs[slot];
    if (!output) {
      return;
    }

    const { links } = output;
    if (!links || !links.length) {
      return;
    }

    // for every link attached here
    for (let k = 0; k < links.length; ++k) {
      const id = links[k];
      if (link_id != null && link_id != id) {
        // to skip links
        continue;
      }
      const link_info = this.graph.links[links[k]];
      if (!link_info) {
        // not connected
        continue;
      }
      link_info._last_time = 0;
    }
  }

  /**
   * changes node size and triggers callback
   * @method setSize
   * @param {vec2} size
   */
  setSize(size) {
    this.size = size;
    if (this.onResize) this.onResize(this.size);
  }

  /**
   * add a new property to this node
   * @method addProperty
   * @param {string} name
   * @param {*} default_value
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of the property (like values, etc)
   */
  addProperty(name, default_value, type, extra_info) {
    const o = { name, type, default_value };
    if (extra_info) {
      for (const i in extra_info) {
        o[i] = extra_info[i];
      }
    }
    if (!this.properties_info) {
      this.properties_info = [];
    }
    this.properties_info.push(o);
    if (!this.properties) {
      this.properties = {};
    }
    this.properties[name] = default_value;
    return o;
  }

  // connections

  /**
   * add a new output slot to use in this node
   * @method addOutput
   * @param {string} name
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
   */
  addOutput(name, type, extra_info) {
    const output = { name, type, links: null };
    if (extra_info) {
      for (const i in extra_info) {
        output[i] = extra_info[i];
      }
    }

    if (!this.outputs) {
      this.outputs = [];
    }
    this.outputs.push(output);
    if (this.onOutputAdded) {
      this.onOutputAdded(output);
    }

    if (LiteGraph.auto_load_slot_types) LiteGraph.registerNodeAndSlotType(this, type, true);

    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
    return output;
  }

  /**
   * add a new output slot to use in this node
   * @method addOutputs
   * @param {Array} array of triplets like [[name,type,extra_info],[...]]
   */
  addOutputs(array) {
    for (let i = 0; i < array.length; ++i) {
      const info = array[i];
      const o = { name: info[0], type: info[1], link: null };
      if (array[2]) {
        for (const j in info[2]) {
          o[j] = info[2][j];
        }
      }

      if (!this.outputs) {
        this.outputs = [];
      }
      this.outputs.push(o);
      if (this.onOutputAdded) {
        this.onOutputAdded(o);
      }

      if (LiteGraph.auto_load_slot_types) LiteGraph.registerNodeAndSlotType(this, info[1], true);
    }

    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  }

  /**
   * remove an existing output slot
   * @method removeOutput
   * @param {number} slot
   */
  removeOutput(slot) {
    this.disconnectOutput(slot);
    this.outputs.splice(slot, 1);
    for (let i = slot; i < this.outputs.length; ++i) {
      if (!this.outputs[i] || !this.outputs[i].links) {
        continue;
      }
      const { links } = this.outputs[i];
      for (let j = 0; j < links.length; ++j) {
        const link = this.graph.links[links[j]];
        if (!link) {
          continue;
        }
        link.origin_slot -= 1;
      }
    }

    this.setSize(this.computeSize());
    if (this.onOutputRemoved) {
      this.onOutputRemoved(slot);
    }
    this.setDirtyCanvas(true, true);
  }

  /**
   * add a new input slot to use in this node
   * @method addInput
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
   * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
   */
  addInput(name, type, extra_info) {
    type = type || 0;
    const input = { name, type, link: null };
    if (extra_info) {
      for (const i in extra_info) {
        input[i] = extra_info[i];
      }
    }

    if (!this.inputs) {
      this.inputs = [];
    }

    this.inputs.push(input);
    this.setSize(this.computeSize());

    if (this.onInputAdded) {
      this.onInputAdded(input);
    }

    LiteGraph.registerNodeAndSlotType(this, type);

    this.setDirtyCanvas(true, true);
    return input;
  }

  /**
   * add several new input slots in this node
   * @method addInputs
   * @param {Array} array of triplets like [[name,type,extra_info],[...]]
   */
  addInputs(array) {
    for (let i = 0; i < array.length; ++i) {
      const info = array[i];
      const o = { name: info[0], type: info[1], link: null };
      if (array[2]) {
        for (const j in info[2]) {
          o[j] = info[2][j];
        }
      }

      if (!this.inputs) {
        this.inputs = [];
      }
      this.inputs.push(o);
      if (this.onInputAdded) {
        this.onInputAdded(o);
      }

      LiteGraph.registerNodeAndSlotType(this, info[1]);
    }

    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  }

  /**
   * remove an existing input slot
   * @method removeInput
   * @param {number} slot
   */
  removeInput(slot) {
    this.disconnectInput(slot);
    const slot_info = this.inputs.splice(slot, 1);
    for (let i = slot; i < this.inputs.length; ++i) {
      if (!this.inputs[i]) {
        continue;
      }
      const link = this.graph.links[this.inputs[i].link];
      if (!link) {
        continue;
      }
      link.target_slot -= 1;
    }
    this.setSize(this.computeSize());
    if (this.onInputRemoved) {
      this.onInputRemoved(slot, slot_info[0]);
    }
    this.setDirtyCanvas(true, true);
  }

  /**
   * add an special connection to this node (used for special kinds of graphs)
   * @method addConnection
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...)
   * @param {[x,y]} pos position of the connection inside the node
   * @param {string} direction if is input or output
   */
  addConnection(name, type, pos, direction) {
    const o = {
      name,
      type,
      pos,
      direction,
      links: null,
    };
    this.connections.push(o);
    return o;
  }

  /**
   * computes the minimum size of a node according to its inputs and output slots
   * @method computeSize
   * @param {vec2} minHeight
   * @return {vec2} the total size
   */
  computeSize(out) {
    if (this.constructor.size) {
      return this.constructor.size.concat();
    }

    let rows = Math.max(
      this.inputs ? this.inputs.length : 1,
      this.outputs ? this.outputs.length : 1,
    );
    const size = out || new Float32Array([0, 0]);
    rows = Math.max(rows, 1);
    const font_size = LiteGraph.NODE_TEXT_SIZE; // although it should be graphcanvas.inner_text_font size

    const title_width = compute_text_size(this.title);
    let input_width = 0;
    let output_width = 0;

    if (this.inputs) {
      for (var i = 0, l = this.inputs.length; i < l; ++i) {
        const input = this.inputs[i];
        var text = input.label || input.name || '';
        var text_width = compute_text_size(text);
        if (input_width < text_width) {
          input_width = text_width;
        }
      }
    }

    if (this.outputs) {
      for (var i = 0, l = this.outputs.length; i < l; ++i) {
        const output = this.outputs[i];
        var text = output.label || output.name || '';
        var text_width = compute_text_size(text);
        if (output_width < text_width) {
          output_width = text_width;
        }
      }
    }

    size[0] = Math.max(input_width + output_width + 10, title_width);
    size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH);
    if (this.widgets && this.widgets.length) {
      size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1.5);
    }

    size[1] = (this.constructor.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;

    let widgets_height = 0;
    if (this.widgets && this.widgets.length) {
      for (var i = 0, l = this.widgets.length; i < l; ++i) {
        if (this.widgets[i].computeSize) widgets_height += this.widgets[i].computeSize(size[0])[1] + 4;
        else widgets_height += LiteGraph.NODE_WIDGET_HEIGHT + 4;
      }
      widgets_height += 8;
    }

    // compute height using widgets height
    if (this.widgets_up) size[1] = Math.max(size[1], widgets_height);
    else if (this.widgets_start_y != null) size[1] = Math.max(size[1], widgets_height + this.widgets_start_y);
    else size[1] += widgets_height;

    function compute_text_size(text) {
      if (!text) {
        return 0;
      }
      return font_size * text.length * 0.6;
    }

    if (
      this.constructor.min_height
                && size[1] < this.constructor.min_height
    ) {
      size[1] = this.constructor.min_height;
    }

    size[1] += 6; // margin

    return size;
  }

  /**
   * returns all the info available about a property of this node.
   *
   * @method getPropertyInfo
   * @param {String} property name of the property
   * @return {Object} the object with all the available info
   */
  getPropertyInfo(property) {
    let info = null;

    // there are several ways to define info about a property
    // legacy mode
    if (this.properties_info) {
      for (let i = 0; i < this.properties_info.length; ++i) {
        if (this.properties_info[i].name == property) {
          info = this.properties_info[i];
          break;
        }
      }
    }
    // litescene mode using the constructor
    if (this.constructor[`@${property}`]) info = this.constructor[`@${property}`];

    if (this.constructor.widgets_info && this.constructor.widgets_info[property]) info = this.constructor.widgets_info[property];

    // litescene mode using the constructor
    if (!info && this.onGetPropertyInfo) {
      info = this.onGetPropertyInfo(property);
    }

    if (!info) info = {};
    if (!info.type) info.type = typeof this.properties[property];
    if (info.widget == 'combo') info.type = 'enum';

    return info;
  }

  /**
   * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
   *
   * @method addWidget
   * @param {String} type the widget type (could be "number","string","combo"
   * @param {String} name the text to show on the widget
   * @param {String} value the default value
   * @param {Function|String} callback function to call when it changes (optionally, it can be the name of the property to modify)
   * @param {Object} options the object that contains special properties of this widget
   * @return {Object} the created widget object
   */
  addWidget(type, name, value, callback, options) {
    if (!this.widgets) {
      this.widgets = [];
    }

    if (!options && callback && callback.constructor === Object) {
      options = callback;
      callback = null;
    }

    if (options && options.constructor === String) // options can be the property name
    { options = { property: options }; }

    if (callback && callback.constructor === String) // callback can be the property name
    {
      if (!options) options = {};
      options.property = callback;
      callback = null;
    }

    if (callback && callback.constructor !== Function) {
      console.warn('addWidget: callback must be a function');
      callback = null;
    }

    const w = {
      type: type.toLowerCase(),
      name,
      value,
      callback,
      options: options || {},
    };

    if (w.options.y !== undefined) {
      w.y = w.options.y;
    }

    if (!callback && !w.options.callback && !w.options.property) {
      console.warn('LiteGraph addWidget(...) without a callback or property assigned');
    }
    if (type == 'combo' && !w.options.values) {
      throw new Error("LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }");
    }
    this.widgets.push(w);
    this.setSize(this.computeSize());
    return w;
  }

  /**
   * Adds a custom widget to the node.
   *
   * @param {*} custom_widget - The custom widget object to add.
   * @returns {*} - The added custom widget.
   */
  addCustomWidget(custom_widget) {
    if (!this.widgets) {
      this.widgets = [];
    }
    this.widgets.push(custom_widget);
    return custom_widget;
  }

  /**
   * returns the bounding of the object, used for rendering purposes
   * @method getBounding
   * @param out {Float32Array[4]?} [optional] a place to store the output, to free garbage
   * @param compute_outer {boolean?} [optional] set to true to include the shadow and connection points in the bounding calculation
   * @return {Float32Array[4]} the bounding box in format of [topleft_cornerx, topleft_cornery, width, height]
   */
  getBounding(out, compute_outer) {
    out = out || new Float32Array(4);
    const nodePos = this.pos;
    const isCollapsed = this.flags.collapsed;
    const nodeSize = this.size;

    let left_offset = 0;
    // 1 offset due to how nodes are rendered
    let right_offset = 1;
    let top_offset = 0;
    let bottom_offset = 0;

    if (compute_outer) {
      // 4 offset for collapsed node connection points
      left_offset = 4;
      // 6 offset for right shadow and collapsed node connection points
      right_offset = 6 + left_offset;
      // 4 offset for collapsed nodes top connection points
      top_offset = 4;
      // 5 offset for bottom shadow and collapsed node connection points
      bottom_offset = 5 + top_offset;
    }

    out[0] = nodePos[0] - left_offset;
    out[1] = nodePos[1] - LiteGraph.NODE_TITLE_HEIGHT - top_offset;
    out[2] = isCollapsed
      ? (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) + right_offset
      : nodeSize[0] + right_offset;
    out[3] = isCollapsed
      ? LiteGraph.NODE_TITLE_HEIGHT + bottom_offset
      : nodeSize[1] + LiteGraph.NODE_TITLE_HEIGHT + bottom_offset;

    if (this.onBounding) {
      this.onBounding(out);
    }
    return out;
  }

  /**
   * checks if a point is inside the shape of a node
   * @method isPointInside
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isPointInside(x, y, margin, skip_title) {
    margin = margin || 0;

    let margin_top = this.graph && this.graph.isLive() ? 0 : LiteGraph.NODE_TITLE_HEIGHT;
    if (skip_title) {
      margin_top = 0;
    }
    if (this.flags && this.flags.collapsed) {
      // if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < LiteGraph.NODE_COLLAPSED_RADIUS)
      if (
        LiteGraph.isInsideRectangle(
          x,
          y,
          this.pos[0] - margin,
          this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT - margin,
          (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH)
                            + 2 * margin,
          LiteGraph.NODE_TITLE_HEIGHT + 2 * margin,
        )
      ) {
        return true;
      }
    } else if (
      this.pos[0] - 4 - margin < x
                && this.pos[0] + this.size[0] + 4 + margin > x
                && this.pos[1] - margin_top - margin < y
                && this.pos[1] + this.size[1] + margin > y
    ) {
      return true;
    }
    return false;
  }

  /**
   * checks if a point is inside a node slot, and returns info about which slot
   * @method getSlotInPosition
   * @param {number} x
   * @param {number} y
   * @return {Object} if found the object contains { input|output: slot object, slot: number, link_pos: [x,y] }
   */
  getSlotInPosition(x, y) {
    // search for inputs
    const link_pos = new Float32Array(2);
    if (this.inputs) {
      for (var i = 0, l = this.inputs.length; i < l; ++i) {
        const input = this.inputs[i];
        this.getConnectionPos(true, i, link_pos);
        if (
          LiteGraph.isInsideRectangle(
            x,
            y,
            link_pos[0] - 10,
            link_pos[1] - 5,
            20,
            10,
          )
        ) {
          return { input, slot: i, link_pos };
        }
      }
    }

    if (this.outputs) {
      for (var i = 0, l = this.outputs.length; i < l; ++i) {
        const output = this.outputs[i];
        this.getConnectionPos(false, i, link_pos);
        if (
          LiteGraph.isInsideRectangle(
            x,
            y,
            link_pos[0] - 10,
            link_pos[1] - 5,
            20,
            10,
          )
        ) {
          return { output, slot: i, link_pos };
        }
      }
    }

    return null;
  }

  /**
   * returns the input slot with a given name (used for dynamic slots), -1 if not found
   * @method findInputSlot
   * @param {string} name the name of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @return {number_or_object} the slot (-1 if not found)
   */
  findInputSlot(name, returnObj) {
    if (!this.inputs) {
      return -1;
    }
    for (let i = 0, l = this.inputs.length; i < l; ++i) {
      if (name == this.inputs[i].name) {
        return !returnObj ? i : this.inputs[i];
      }
    }
    return -1;
  }

  /**
   * returns the output slot with a given name (used for dynamic slots), -1 if not found
   * @method findOutputSlot
   * @param {string} name the name of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @return {number_or_object} the slot (-1 if not found)
   */
  findOutputSlot(name, returnObj) {
    returnObj = returnObj || false;
    if (!this.outputs) {
      return -1;
    }
    for (let i = 0, l = this.outputs.length; i < l; ++i) {
      if (name == this.outputs[i].name) {
        return !returnObj ? i : this.outputs[i];
      }
    }
    return -1;
  }

  // @TODO refactor: USE SINGLE findInput/findOutput functions! :: merge options

  /**
   * returns the first free input slot
   * @method findInputSlotFree
   * @param {object} options
   * @return {number_or_object} the slot (-1 if not found)
   */
  findInputSlotFree(optsIn) {
    var optsIn = optsIn || {};
    const optsDef = {
      returnObj: false,
      typesNotAccepted: [],
    };
    const opts = Object.assign(optsDef, optsIn);
    if (!this.inputs) {
      return -1;
    }
    for (let i = 0, l = this.inputs.length; i < l; ++i) {
      if (this.inputs[i].link && this.inputs[i].link != null) {
        continue;
      }
      if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.inputs[i].type)) {
        continue;
      }
      return !opts.returnObj ? i : this.inputs[i];
    }
    return -1;
  }

  /**
   * returns the first output slot free
   * @method findOutputSlotFree
   * @param {object} options
   * @return {number_or_object} the slot (-1 if not found)
   */
  findOutputSlotFree(optsIn) {
    var optsIn = optsIn || {};
    const optsDef = {
      returnObj: false,
      typesNotAccepted: [],
    };
    const opts = Object.assign(optsDef, optsIn);
    if (!this.outputs) {
      return -1;
    }
    for (let i = 0, l = this.outputs.length; i < l; ++i) {
      if (this.outputs[i].links && this.outputs[i].links != null) {
        continue;
      }
      if (opts.typesNotAccepted && opts.typesNotAccepted.includes && opts.typesNotAccepted.includes(this.outputs[i].type)) {
        continue;
      }
      return !opts.returnObj ? i : this.outputs[i];
    }
    return -1;
  }

  /**
   * findSlotByType for INPUTS
   */
  findInputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
    return this.findSlotByType(true, type, returnObj, preferFreeSlot, doNotUseOccupied);
  }

  /**
   * findSlotByType for OUTPUTS
   */
  findOutputSlotByType(type, returnObj, preferFreeSlot, doNotUseOccupied) {
    return this.findSlotByType(false, type, returnObj, preferFreeSlot, doNotUseOccupied);
  }

  /**
   * returns the output (or input) slot with a given type, -1 if not found
   * @method findSlotByType
   * @param {boolean} input uise inputs instead of outputs
   * @param {string} type the type of the slot
   * @param {boolean} returnObj if the obj itself wanted
   * @param {boolean} preferFreeSlot if we want a free slot (if not found, will return the first of the type anyway)
   * @return {number_or_object} the slot (-1 if not found)
   */
  findSlotByType(input, type, returnObj, preferFreeSlot, doNotUseOccupied) {
    input = input || false;
    returnObj = returnObj || false;
    preferFreeSlot = preferFreeSlot || false;
    doNotUseOccupied = doNotUseOccupied || false;
    const aSlots = input ? this.inputs : this.outputs;
    if (!aSlots) {
      return -1;
    }
    // !! empty string type is considered 0, * !!
    if (type == '' || type == '*') type = 0;
    for (var i = 0, l = aSlots.length; i < l; ++i) {
      var tFound = false;
      var aSource = (`${type}`).toLowerCase().split(',');
      var aDest = aSlots[i].type == '0' || aSlots[i].type == '*' ? '0' : aSlots[i].type;
      aDest = (`${aDest}`).toLowerCase().split(',');
      for (var sI = 0; sI < aSource.length; sI++) {
        for (var dI = 0; dI < aDest.length; dI++) {
          if (aSource[sI] == '_event_') aSource[sI] = LiteGraph.EVENT;
          if (aDest[sI] == '_event_') aDest[sI] = LiteGraph.EVENT;
          if (aSource[sI] == '*') aSource[sI] = 0;
          if (aDest[sI] == '*') aDest[sI] = 0;
          if (aSource[sI] == aDest[dI]) {
            if (preferFreeSlot && aSlots[i].links && aSlots[i].links !== null) continue;
            return !returnObj ? i : aSlots[i];
          }
        }
      }
    }
    // if didnt find some, stop checking for free slots
    if (preferFreeSlot && !doNotUseOccupied) {
      for (var i = 0, l = aSlots.length; i < l; ++i) {
        var tFound = false;
        var aSource = (`${type}`).toLowerCase().split(',');
        var aDest = aSlots[i].type == '0' || aSlots[i].type == '*' ? '0' : aSlots[i].type;
        aDest = (`${aDest}`).toLowerCase().split(',');
        for (var sI = 0; sI < aSource.length; sI++) {
          for (var dI = 0; dI < aDest.length; dI++) {
            if (aSource[sI] == '*') aSource[sI] = 0;
            if (aDest[sI] == '*') aDest[sI] = 0;
            if (aSource[sI] == aDest[dI]) {
              return !returnObj ? i : aSlots[i];
            }
          }
        }
      }
    }
    return -1;
  }

  /**
   * connect this node output to the input of another node BY TYPE
   * @method connectByType
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {string} target_type the input slot type of the target node
   * @return {Object} the link_info is created, otherwise null
   */
  connectByType(slot, target_node, target_slotType, optsIn) {
    var optsIn = optsIn || {};
    const optsDef = {
      createEventInCase: true,
      firstFreeIfOutputGeneralInCase: true,
      generalTypeInCase: true,
    };
    const opts = Object.assign(optsDef, optsIn);
    if (target_node && target_node.constructor === Number) {
      target_node = this.graph.getNodeById(target_node);
    }
    var target_slot = target_node.findInputSlotByType(target_slotType, false, true);
    if (target_slot >= 0 && target_slot !== null) {
      console.debug(`CONNbyTYPE type ${target_slotType} for ${target_slot}`);
      return this.connect(slot, target_node, target_slot);
    }
    console.log(`type ${target_slotType} not found or not free?`);
    if (opts.createEventInCase && target_slotType == LiteGraph.EVENT) {
      // WILL CREATE THE onTrigger IN SLOT
      console.debug(`connect WILL CREATE THE onTrigger ${target_slotType} to ${target_node}`);
      return this.connect(slot, target_node, -1);
    }
    // connect to the first general output slot if not found a specific type and
    if (opts.generalTypeInCase) {
      var target_slot = target_node.findInputSlotByType(0, false, true, true);
      console.debug('connect TO a general type (*, 0), if not found the specific type ', target_slotType, ' to ', target_node, 'RES_SLOT:', target_slot);
      if (target_slot >= 0) {
        return this.connect(slot, target_node, target_slot);
      }
    }
    // connect to the first free input slot if not found a specific type and this output is general
    if (opts.firstFreeIfOutputGeneralInCase && (target_slotType == 0 || target_slotType == '*' || target_slotType == '')) {
      var target_slot = target_node.findInputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
      console.debug('connect TO TheFirstFREE ', target_slotType, ' to ', target_node, 'RES_SLOT:', target_slot);
      if (target_slot >= 0) {
        return this.connect(slot, target_node, target_slot);
      }
    }

    console.debug('no way to connect type: ', target_slotType, ' to targetNODE ', target_node);
    // TODO filter

    return null;
  }

  /**
   * connect this node input to the output of another node BY TYPE
   * @method connectByType
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {string} target_type the output slot type of the target node
   * @return {Object} the link_info is created, otherwise null
   */
  connectByTypeOutput(slot, source_node, source_slotType, optsIn) {
    var optsIn = optsIn || {};
    const optsDef = {
      createEventInCase: true,
      firstFreeIfInputGeneralInCase: true,
      generalTypeInCase: true,
    };
    const opts = Object.assign(optsDef, optsIn);
    if (source_node && source_node.constructor === Number) {
      source_node = this.graph.getNodeById(source_node);
    }
    var source_slot = source_node.findOutputSlotByType(source_slotType, false, true);
    if (source_slot >= 0 && source_slot !== null) {
      console.debug(`CONNbyTYPE OUT! type ${source_slotType} for ${source_slot}`);
      return source_node.connect(source_slot, this, slot);
    }

    // connect to the first general output slot if not found a specific type and
    if (opts.generalTypeInCase) {
      var source_slot = source_node.findOutputSlotByType(0, false, true, true);
      if (source_slot >= 0) {
        return source_node.connect(source_slot, this, slot);
      }
    }

    if (opts.createEventInCase && source_slotType == LiteGraph.EVENT) {
      // WILL CREATE THE onExecuted OUT SLOT
      if (LiteGraph.do_add_triggers_slots) {
        var source_slot = source_node.addOnExecutedOutput();
        return source_node.connect(source_slot, this, slot);
      }
    }
    // connect to the first free output slot if not found a specific type and this input is general
    if (opts.firstFreeIfInputGeneralInCase && (source_slotType == 0 || source_slotType == '*' || source_slotType == '')) {
      var source_slot = source_node.findOutputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
      if (source_slot >= 0) {
        return source_node.connect(source_slot, this, slot);
      }
    }

    console.debug('no way to connect byOUT type: ', source_slotType, ' to sourceNODE ', source_node);
    // TODO filter

    console.log(`type OUT! ${source_slotType} not found or not free?`);
    return null;
  }

  /**
   * connect this node output to the input of another node
   * @method connect
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
   * @return {Object} the link_info is created, otherwise null
   */
  connect(slot, target_node, target_slot) {
    target_slot = target_slot || 0;

    if (!this.graph) {
      // could be connected before adding it to a graph due to link ids being associated with graphs
      console.log("Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them.");
      return null;
    }

    // seek for the output slot
    if (slot.constructor === String) {
      slot = this.findOutputSlot(slot);
      if (slot == -1) {
        if (LiteGraph.debug) {
          console.log(`Connect: Error, no slot of name ${slot}`);
        }
        return null;
      }
    } else if (!this.outputs || slot >= this.outputs.length) {
      if (LiteGraph.debug) {
        console.log('Connect: Error, slot number not found');
      }
      return null;
    }

    if (target_node && target_node.constructor === Number) {
      target_node = this.graph.getNodeById(target_node);
    }
    if (!target_node) {
      throw new TypeError('target node is null');
    }

    // avoid loopback
    if (target_node == this) {
      return null;
    }

    // you can specify the slot by name
    if (target_slot.constructor === String) {
      target_slot = target_node.findInputSlot(target_slot);
      if (target_slot == -1) {
        if (LiteGraph.debug) {
          console.log(`Connect: Error, no slot of name ${target_slot}`);
        }
        return null;
      }
    } else if (target_slot === LiteGraph.EVENT) {
      if (LiteGraph.do_add_triggers_slots) {
        // search for first slot with event? :: NO this is done outside
        console.log('Connect: Creating triggerEvent');
        // force mode
        target_node.changeMode(LiteGraph.ON_TRIGGER);
        target_slot = target_node.findInputSlot('onTrigger');
      } else {
        return null; // -- break --
      }
    } else if (
      !target_node.inputs
                || target_slot >= target_node.inputs.length
    ) {
      if (LiteGraph.debug) {
        console.log('Connect: Error, slot number not found');
      }
      return null;
    }

    let changed = false;

    const input = target_node.inputs[target_slot];
    let link_info = null;
    const output = this.outputs[slot];

    if (!this.outputs[slot]) {
      console.debug(`Invalid slot passed: ${slot}`);
      console.debug(this.outputs);
      return null;
    }

    // allow target node to change slot
    if (target_node.onBeforeConnectInput) {
      // This way node can choose another slot (or make a new one?)
      target_slot = target_node.onBeforeConnectInput(target_slot); // callback
    }

    // check target_slot and check connection types
    if (target_slot === false || target_slot === null || !LiteGraph.isValidConnection(output.type, input.type)) {
      this.setDirtyCanvas(false, true);
      if (changed) this.graph.connectionChange(this, link_info);
      return null;
    }
    console.debug('valid connection', output.type, input.type);

    // allows nodes to block connection, callback
    if (target_node.onConnectInput) {
      if (target_node.onConnectInput(target_slot, output.type, output, this, slot) === false) {
        return null;
      }
    }
    if (this.onConnectOutput) { // callback
      if (this.onConnectOutput(slot, input.type, input, target_node, target_slot) === false) {
        return null;
      }
    }

    // if there is something already plugged there, disconnect
    if (target_node.inputs[target_slot] && target_node.inputs[target_slot].link != null) {
      this.graph.beforeChange();
      target_node.disconnectInput(target_slot, { doProcessChange: false });
      changed = true;
    }
    if (output.links !== null && output.links.length) {
      switch (output.type) {
        case LiteGraph.EVENT:
          if (!LiteGraph.allow_multi_output_for_events) {
            this.graph.beforeChange();
            this.disconnectOutput(slot, false, { doProcessChange: false }); // Input(target_slot, {doProcessChange: false});
            changed = true;
          }
          break;
        default:
          break;
      }
    }

    let nextId;
    if (LiteGraph.use_uuids) nextId = LiteGraph.uuidv4();
    else nextId = ++this.graph.last_link_id;

    // create link class
    link_info = new LiteGraph.LLink(
      nextId,
      input.type || output.type,
      this.id,
      slot,
      target_node.id,
      target_slot,
    );

    // add to graph links list
    this.graph.links[link_info.id] = link_info;

    // connect in output
    if (output.links == null) {
      output.links = [];
    }
    output.links.push(link_info.id);
    // connect in input
    target_node.inputs[target_slot].link = link_info.id;
    if (this.graph) {
      this.graph._version++;
    }
    if (this.onConnectionsChange) {
      this.onConnectionsChange(
        LiteGraph.OUTPUT,
        slot,
        true,
        link_info,
        output,
      );
    } // link_info has been created now, so its updated
    if (target_node.onConnectionsChange) {
      target_node.onConnectionsChange(
        LiteGraph.INPUT,
        target_slot,
        true,
        link_info,
        input,
      );
    }
    if (this.graph && this.graph.onNodeConnectionChange) {
      this.graph.onNodeConnectionChange(
        LiteGraph.INPUT,
        target_node,
        target_slot,
        this,
        slot,
      );
      this.graph.onNodeConnectionChange(
        LiteGraph.OUTPUT,
        this,
        slot,
        target_node,
        target_slot,
      );
    }

    this.setDirtyCanvas(false, true);
    this.graph.afterChange();
    this.graph.connectionChange(this, link_info);

    return link_info;
  }

  /**
   * disconnect one output to an specific node
   * @method disconnectOutput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
   * @return {boolean} if it was disconnected successfully
   */
  disconnectOutput(slot, target_node) {
    if (slot.constructor === String) {
      slot = this.findOutputSlot(slot);
      if (slot == -1) {
        if (LiteGraph.debug) {
          console.log(`Connect: Error, no slot of name ${slot}`);
        }
        return false;
      }
    } else if (!this.outputs || slot >= this.outputs.length) {
      if (LiteGraph.debug) {
        console.log('Connect: Error, slot number not found');
      }
      return false;
    }

    // get output slot
    const output = this.outputs[slot];
    if (!output || !output.links || output.links.length == 0) {
      return false;
    }

    // one of the output links in this slot
    if (target_node) {
      if (target_node.constructor === Number) {
        target_node = this.graph.getNodeById(target_node);
      }
      if (!target_node) {
        throw new Error('Target Node not found');
      }

      for (var i = 0, l = output.links.length; i < l; i++) {
        var link_id = output.links[i];
        var link_info = this.graph.links[link_id];

        // is the link we are searching for...
        if (link_info.target_id == target_node.id) {
          output.links.splice(i, 1); // remove here
          var input = target_node.inputs[link_info.target_slot];
          input.link = null; // remove there
          delete this.graph.links[link_id]; // remove the link from the links pool
          if (this.graph) {
            this.graph._version++;
          }
          if (target_node.onConnectionsChange) {
            target_node.onConnectionsChange(
              LiteGraph.INPUT,
              link_info.target_slot,
              false,
              link_info,
              input,
            );
          } // link_info hasn't been modified so its ok
          if (this.onConnectionsChange) {
            this.onConnectionsChange(
              LiteGraph.OUTPUT,
              slot,
              false,
              link_info,
              output,
            );
          }
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(
              LiteGraph.OUTPUT,
              this,
              slot,
            );
          }
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(
              LiteGraph.OUTPUT,
              this,
              slot,
            );
            this.graph.onNodeConnectionChange(
              LiteGraph.INPUT,
              target_node,
              link_info.target_slot,
            );
          }
          break;
        }
      }
    } // all the links in this output slot
    else {
      for (var i = 0, l = output.links.length; i < l; i++) {
        var link_id = output.links[i];
        var link_info = this.graph.links[link_id];
        if (!link_info) {
          // bug: it happens sometimes
          continue;
        }

        var target_node = this.graph.getNodeById(link_info.target_id);
        var input = null;
        if (this.graph) {
          this.graph._version++;
        }
        if (target_node) {
          input = target_node.inputs[link_info.target_slot];
          input.link = null; // remove other side link
          if (target_node.onConnectionsChange) {
            target_node.onConnectionsChange(
              LiteGraph.INPUT,
              link_info.target_slot,
              false,
              link_info,
              input,
            );
          } // link_info hasn't been modified so its ok
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(
              LiteGraph.INPUT,
              target_node,
              link_info.target_slot,
            );
          }
        }
        delete this.graph.links[link_id]; // remove the link from the links pool
        if (this.onConnectionsChange) {
          this.onConnectionsChange(
            LiteGraph.OUTPUT,
            slot,
            false,
            link_info,
            output,
          );
        }
        if (this.graph && this.graph.onNodeConnectionChange) {
          this.graph.onNodeConnectionChange(
            LiteGraph.OUTPUT,
            this,
            slot,
          );
          this.graph.onNodeConnectionChange(
            LiteGraph.INPUT,
            target_node,
            link_info.target_slot,
          );
        }
      }
      output.links = null;
    }

    this.setDirtyCanvas(false, true);
    this.graph.connectionChange(this);
    return true;
  }

  /**
   * disconnect one input
   * @method disconnectInput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @return {boolean} if it was disconnected successfully
   */
  disconnectInput(slot) {
    // seek for the output slot
    if (slot.constructor === String) {
      slot = this.findInputSlot(slot);
      if (slot == -1) {
        if (LiteGraph.debug) {
          console.log(`Connect: Error, no slot of name ${slot}`);
        }
        return false;
      }
    } else if (!this.inputs || slot >= this.inputs.length) {
      if (LiteGraph.debug) {
        console.log('Connect: Error, slot number not found');
      }
      return false;
    }

    const input = this.inputs[slot];
    if (!input) {
      return false;
    }

    const link_id = this.inputs[slot].link;
    if (link_id != null) {
      this.inputs[slot].link = null;

      // remove other side
      const link_info = this.graph.links[link_id];
      if (link_info) {
        const target_node = this.graph.getNodeById(link_info.origin_id);
        if (!target_node) {
          return false;
        }

        const output = target_node.outputs[link_info.origin_slot];
        if (!output || !output.links || output.links.length == 0) {
          return false;
        }

        // search in the inputs list for this link
        for (var i = 0, l = output.links.length; i < l; i++) {
          if (output.links[i] == link_id) {
            output.links.splice(i, 1);
            break;
          }
        }

        delete this.graph.links[link_id]; // remove from the pool
        if (this.graph) {
          this.graph._version++;
        }
        if (this.onConnectionsChange) {
          this.onConnectionsChange(
            LiteGraph.INPUT,
            slot,
            false,
            link_info,
            input,
          );
        }
        if (target_node.onConnectionsChange) {
          target_node.onConnectionsChange(
            LiteGraph.OUTPUT,
            i,
            false,
            link_info,
            output,
          );
        }
        if (this.graph && this.graph.onNodeConnectionChange) {
          this.graph.onNodeConnectionChange(
            LiteGraph.OUTPUT,
            target_node,
            i,
          );
          this.graph.onNodeConnectionChange(LiteGraph.INPUT, this, slot);
        }
      }
    } // link != null

    this.setDirtyCanvas(false, true);
    if (this.graph) this.graph.connectionChange(this);
    return true;
  }

  /**
   * returns the center of a connection point in canvas coords
   * @method getConnectionPos
   * @param {boolean} is_input true if if a input slot, false if it is an output
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {vec2} out [optional] a place to store the output, to free garbage
   * @return {[x,y]} the position
   */
  getConnectionPos(is_input, slot_number, out) {
    out = out || new Float32Array(2);
    let num_slots = 0;
    if (is_input && this.inputs) {
      num_slots = this.inputs.length;
    }
    if (!is_input && this.outputs) {
      num_slots = this.outputs.length;
    }

    const offset = LiteGraph.NODE_SLOT_HEIGHT * 0.5;

    if (this.flags.collapsed) {
      const w = this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
      if (this.horizontal) {
        out[0] = this.pos[0] + w * 0.5;
        if (is_input) {
          out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
        } else {
          out[1] = this.pos[1];
        }
      } else {
        if (is_input) {
          out[0] = this.pos[0];
        } else {
          out[0] = this.pos[0] + w;
        }
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      }
      return out;
    }

    // weird feature that never got finished
    if (is_input && slot_number == -1) {
      out[0] = this.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      out[1] = this.pos[1] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      return out;
    }

    // hard-coded pos
    if (
      is_input
                && num_slots > slot_number
                && this.inputs[slot_number].pos
    ) {
      out[0] = this.pos[0] + this.inputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.inputs[slot_number].pos[1];
      return out;
    } if (
      !is_input
                && num_slots > slot_number
                && this.outputs[slot_number].pos
    ) {
      out[0] = this.pos[0] + this.outputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.outputs[slot_number].pos[1];
      return out;
    }

    // horizontal distributed slots
    if (this.horizontal) {
      out[0] = this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
      if (is_input) {
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
      } else {
        out[1] = this.pos[1] + this.size[1];
      }
      return out;
    }

    // default vertical slots
    if (is_input) {
      out[0] = this.pos[0] + offset;
    } else {
      out[0] = this.pos[0] + this.size[0] + 1 - offset;
    }
    out[1] = this.pos[1]
                + (slot_number + 0.7) * LiteGraph.NODE_SLOT_HEIGHT
                + (this.constructor.slot_start_y || 0);
    return out;
  }

  /**
   * Forces the node position to align to the grid defined by CANVAS_GRID_SIZE.
   */
  alignToGrid() {
    this.pos[0] = LiteGraph.CANVAS_GRID_SIZE
                * Math.round(this.pos[0] / LiteGraph.CANVAS_GRID_SIZE);
    this.pos[1] = LiteGraph.CANVAS_GRID_SIZE
                * Math.round(this.pos[1] / LiteGraph.CANVAS_GRID_SIZE);
  }

  /**
   * Logs a message to the node's console and notifies the graph's trace handler.
   * @param {string} msg The message to log.
   */
  trace(msg) {
    if (!this.console) {
      this.console = [];
    }

    this.console.push(msg);
    if (this.console.length > LGraphNode.MAX_CONSOLE) {
      this.console.shift();
    }

    if (this.graph.onNodeTrace) this.graph.onNodeTrace(this, msg);
  }

  /**
   * Forces the main canvas (LGraphNode) or the background canvas (links) to redraw.
   * @param {boolean} dirty_foreground Indicates whether the foreground canvas should be marked dirty.
   * @param {boolean} dirty_background Indicates whether the background canvas should be marked dirty.
   */
  setDirtyCanvas(dirty_foreground, dirty_background) {
    if (!this.graph) {
      return;
    }
    this.graph.sendActionToCanvas('setDirty', [
      dirty_foreground,
      dirty_background,
    ]);
  }

  /**
   * Loads an image asynchronously.
   * @param {string} url The URL of the image to load.
   * @returns {HTMLImageElement} The image element representing the loaded image.
   */
  loadImage(url) {
    const img = new Image();
    img.src = LiteGraph.node_images_path + url;
    img.ready = false;

    const that = this;
    img.onload = function () {
      this.ready = true;
      that.setDirtyCanvas(true);
    };
    return img;
  }

  // safe LGraphNode action execution (not sure if safe)
  /*
    LGraphNode.prototype.executeAction = function(action)
    {
        if(action == "") return false;

        if( action.indexOf(";") != -1 || action.indexOf("}") != -1)
        {
            this.trace("Error: Action contains unsafe characters");
            return false;
        }

        var tokens = action.split("(");
        var func_name = tokens[0];
        if( typeof(this[func_name]) != "function")
        {
            this.trace("Error: Action not found on node: " + func_name);
            return false;
        }

        var code = action;

        try
        {
            var _foo = eval;
            eval = null;
            (new Function("with(this) { " + code + "}")).call(this);
            eval = _foo;
        }
        catch (err)
        {
            this.trace("Error executing action {" + action + "} :" + err);
            return false;
        }

        return true;
    }
    */

  /**
   * Captures or releases input events for the node.
   * @param {boolean} v - Whether to capture input (`true`) or release capture (`false`).
   */
  captureInput(v) {
    if (!this.graph || !this.graph.list_of_graphcanvas) {
      return;
    }

    const list = this.graph.list_of_graphcanvas;

    for (let i = 0; i < list.length; ++i) {
      const c = list[i];
      // releasing somebody elses capture?!
      if (!v && c.node_capturing_input != this) {
        continue;
      }

      // change
      c.node_capturing_input = v ? this : null;
    }
  }

  /**
   * Collapse the node to make it smaller on the canvas
   * @method collapse
   */
  collapse(force) {
    this.graph._version++;
    if (this.constructor.collapsable === false && !force) {
      return;
    }
    if (!this.flags.collapsed) {
      this.flags.collapsed = true;
    } else {
      this.flags.collapsed = false;
    }
    this.setDirtyCanvas(true, true);
  }

  /**
   * Forces the node to do not move or realign on Z
   * @method pin
   */
  pin(v) {
    this.graph._version++;
    if (v === undefined) {
      this.flags.pinned = !this.flags.pinned;
    } else {
      this.flags.pinned = v;
    }
  }

  /**
   * Converts local coordinates relative to the node to screen coordinates.
   * @param {number} x - The local x-coordinate relative to the node.
   * @param {number} y - The local y-coordinate relative to the node.
   * @param {GraphCanvas} graphcanvas - The graph canvas object containing scale and offset.
   * @returns {Array} Screen coordinates [screenX, screenY].
   */
  localToScreen(x, y, graphcanvas) {
    return [
      (x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
      (y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1],
    ];
  }
}
