var global = typeof window < "u" ? window : typeof self < "u" ? self : globalThis;
const LiteGraph = {
  VERSION: 0.4,
  CANVAS_GRID_SIZE: 10,
  NODE_TITLE_HEIGHT: 30,
  NODE_TITLE_TEXT_Y: 20,
  NODE_SLOT_HEIGHT: 20,
  NODE_WIDGET_HEIGHT: 20,
  NODE_WIDTH: 140,
  NODE_MIN_WIDTH: 50,
  NODE_COLLAPSED_RADIUS: 10,
  NODE_COLLAPSED_WIDTH: 80,
  NODE_TITLE_COLOR: "#999",
  NODE_SELECTED_TITLE_COLOR: "#FFF",
  NODE_TEXT_SIZE: 14,
  NODE_TEXT_COLOR: "#AAA",
  NODE_SUBTEXT_SIZE: 12,
  NODE_DEFAULT_COLOR: "#333",
  NODE_DEFAULT_BGCOLOR: "#353535",
  NODE_DEFAULT_BOXCOLOR: "#666",
  NODE_DEFAULT_SHAPE: "box",
  NODE_BOX_OUTLINE_COLOR: "#FFF",
  DEFAULT_SHADOW_COLOR: "rgba(0,0,0,0.5)",
  DEFAULT_GROUP_FONT: 24,
  WIDGET_BGCOLOR: "#222",
  WIDGET_OUTLINE_COLOR: "#666",
  WIDGET_TEXT_COLOR: "#DDD",
  WIDGET_SECONDARY_TEXT_COLOR: "#999",
  LINK_COLOR: "#9A9",
  EVENT_LINK_COLOR: "#A86",
  CONNECTING_LINK_COLOR: "#AFA",
  MAX_NUMBER_OF_NODES: 1e3,
  //avoid infinite loops
  DEFAULT_POSITION: [100, 100],
  //default node position
  VALID_SHAPES: ["default", "box", "round", "card"],
  //,"circle"
  //shapes are used for nodes but also for slots
  BOX_SHAPE: 1,
  ROUND_SHAPE: 2,
  CIRCLE_SHAPE: 3,
  CARD_SHAPE: 4,
  ARROW_SHAPE: 5,
  GRID_SHAPE: 6,
  // intended for slot arrays
  //enums
  INPUT: 1,
  OUTPUT: 2,
  EVENT: -1,
  //for outputs
  ACTION: -1,
  //for inputs
  NODE_MODES: ["Always", "On Event", "Never", "On Trigger"],
  // helper, will add "On Request" and more in the future
  NODE_MODES_COLORS: ["#666", "#422", "#333", "#224", "#626"],
  // use with node_box_coloured_by_mode
  ALWAYS: 0,
  ON_EVENT: 1,
  NEVER: 2,
  ON_TRIGGER: 3,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  CENTER: 5,
  LINK_RENDER_MODES: ["Straight", "Linear", "Spline"],
  // helper
  STRAIGHT_LINK: 0,
  LINEAR_LINK: 1,
  SPLINE_LINK: 2,
  NORMAL_TITLE: 0,
  NO_TITLE: 1,
  TRANSPARENT_TITLE: 2,
  AUTOHIDE_TITLE: 3,
  VERTICAL_LAYOUT: "vertical",
  // arrange nodes vertically
  proxy: null,
  //used to redirect calls
  node_images_path: "",
  debug: !1,
  catch_exceptions: !0,
  throw_errors: !0,
  allow_scripts: !1,
  //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
  use_deferred_actions: !0,
  //executes actions during the graph execution flow
  registered_node_types: {},
  //nodetypes by string
  node_types_by_file_extension: {},
  //used for dropping files in the canvas
  Nodes: {},
  //node types by classname
  Globals: {},
  //used to store vars between graphs
  searchbox_extras: {},
  //used to add extra features to the search box
  auto_sort_node_types: !1,
  // [true!] If set to true, will automatically sort node types / categories in the context menus
  node_box_coloured_when_on: !1,
  // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
  node_box_coloured_by_mode: !1,
  // [true!] nodebox based on node mode, visual feedback
  dialog_close_on_mouse_leave: !1,
  // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  dialog_close_on_mouse_leave_delay: 500,
  shift_click_do_break_link_from: !1,
  // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
  click_do_break_link_to: !1,
  // [false!]prefer false, way too easy to break links
  search_hide_on_mouse_leave: !0,
  // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  search_filter_enabled: !1,
  // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
  search_show_all_on_open: !0,
  // [true!] opens the results list when opening the search widget
  auto_load_slot_types: !1,
  // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
  // set these values if not using auto_load_slot_types
  registered_slot_in_types: {},
  // slot types for nodeclass
  registered_slot_out_types: {},
  // slot types for nodeclass
  slot_types_in: [],
  // slot types IN
  slot_types_out: [],
  // slot types OUT
  slot_types_default_in: [],
  // specify for each IN slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  slot_types_default_out: [],
  // specify for each OUT slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  alt_drag_do_clone_nodes: !1,
  // [true!] very handy, ALT click to clone and drag the new node
  do_add_triggers_slots: !1,
  // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this
  allow_multi_output_for_events: !0,
  // [false!] being events, it is strongly reccomended to use them sequentially, one by one
  middle_click_slot_add_default_node: !1,
  //[true!] allows to create and connect a ndoe clicking with the third button (wheel)
  release_link_on_empty_shows_menu: !1,
  //[true!] dragging a link to empty space will open a menu, add from list, search or defaults
  pointerevents_method: "pointer",
  // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)
  // TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)
  ctrl_shift_v_paste_connect_unselected_outputs: !0,
  //[true!] allows ctrl + shift + v to paste nodes with the outputs of the unselected nodes connected with the inputs of the newly pasted nodes
  // if true, all newly created nodes/links will use string UUIDs for their id fields instead of integers.
  // use this if you must have node IDs that are unique across all graphs and subgraphs.
  use_uuids: !1,
  /**
         * Register a node class so it can be listed when the user wants to create a new one
         * @method registerNodeType
         * @param {String} type name of the node and path
         * @param {Class} base_class class containing the structure of a node
         */
  registerNodeType: function(e, t) {
    if (!t.prototype)
      throw "Cannot register a simple object, it must be a class with a prototype";
    t.type = e, LiteGraph.debug && console.log("Node registered: " + e);
    const r = t.name, n = e.lastIndexOf("/");
    t.category = e.substring(0, n), t.title || (t.title = r);
    for (var s in LGraphNode.prototype)
      t.prototype[s] || (t.prototype[s] = LGraphNode.prototype[s]);
    const l = this.registered_node_types[e];
    if (l && console.log("replacing node type: " + e), !Object.prototype.hasOwnProperty.call(t.prototype, "shape") && (Object.defineProperty(t.prototype, "shape", {
      set: function(a) {
        switch (a) {
          case "default":
            delete this._shape;
            break;
          case "box":
            this._shape = LiteGraph.BOX_SHAPE;
            break;
          case "round":
            this._shape = LiteGraph.ROUND_SHAPE;
            break;
          case "circle":
            this._shape = LiteGraph.CIRCLE_SHAPE;
            break;
          case "card":
            this._shape = LiteGraph.CARD_SHAPE;
            break;
          default:
            this._shape = a;
        }
      },
      get: function() {
        return this._shape;
      },
      enumerable: !0,
      configurable: !0
    }), t.supported_extensions))
      for (let a in t.supported_extensions) {
        const o = t.supported_extensions[a];
        o && o.constructor === String && (this.node_types_by_file_extension[o.toLowerCase()] = t);
      }
    this.registered_node_types[e] = t, t.constructor.name && (this.Nodes[r] = t), LiteGraph.onNodeTypeRegistered && LiteGraph.onNodeTypeRegistered(e, t), l && LiteGraph.onNodeTypeReplaced && LiteGraph.onNodeTypeReplaced(e, t, l), t.prototype.onPropertyChange && console.warn(
      "LiteGraph node class " + e + " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
    ), this.auto_load_slot_types && new t(t.title || "tmpnode");
  },
  /**
         * removes a node type from the system
         * @method unregisterNodeType
         * @param {String|Object} type name of the node or the node constructor itself
         */
  unregisterNodeType: function(e) {
    const t = e.constructor === String ? this.registered_node_types[e] : e;
    if (!t)
      throw "node type not found: " + e;
    delete this.registered_node_types[t.type], t.constructor.name && delete this.Nodes[t.constructor.name];
  },
  /**
        * Save a slot type and his node
        * @method registerSlotType
        * @param {String|Object} type name of the node or the node constructor itself
        * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
        */
  registerNodeAndSlotType: function(e, t, r) {
    r = r || !1;
    const s = (e.constructor === String && this.registered_node_types[e] !== "anonymous" ? this.registered_node_types[e] : e).constructor.type;
    let l = [];
    typeof t == "string" ? l = t.split(",") : t == this.EVENT || t == this.ACTION ? l = ["_event_"] : l = ["*"];
    for (let a = 0; a < l.length; ++a) {
      let o = l[a];
      o === "" && (o = "*");
      const h = r ? "registered_slot_out_types" : "registered_slot_in_types";
      this[h][o] === void 0 && (this[h][o] = { nodes: [] }), this[h][o].nodes.includes(s) || this[h][o].nodes.push(s), r ? this.slot_types_out.includes(o.toLowerCase()) || (this.slot_types_out.push(o.toLowerCase()), this.slot_types_out.sort()) : this.slot_types_in.includes(o.toLowerCase()) || (this.slot_types_in.push(o.toLowerCase()), this.slot_types_in.sort());
    }
  },
  /**
         * Create a new nodetype by passing an object with some properties
         * like onCreate, inputs:Array, outputs:Array, properties, onExecute
         * @method buildNodeClassFromObject
         * @param {String} name node name with namespace (p.e.: 'math/sum')
         * @param {Object} object methods expected onCreate, inputs, outputs, properties, onExecute
         */
  buildNodeClassFromObject: function(e, t) {
    var r = "";
    if (t.inputs)
      for (var n = 0; n < t.inputs.length; ++n) {
        var s = t.inputs[n][0], l = t.inputs[n][1];
        l && l.constructor === String && (l = '"' + l + '"'), r += "this.addInput('" + s + "'," + l + `);
`;
      }
    if (t.outputs)
      for (var n = 0; n < t.outputs.length; ++n) {
        var s = t.outputs[n][0], l = t.outputs[n][1];
        l && l.constructor === String && (l = '"' + l + '"'), r += "this.addOutput('" + s + "'," + l + `);
`;
      }
    if (t.properties)
      for (var n in t.properties) {
        var a = t.properties[n];
        a && a.constructor === String && (a = '"' + a + '"'), r += "this.addProperty('" + n + "'," + a + `);
`;
      }
    r += "if(this.onCreate)this.onCreate()";
    var o = Function(r);
    for (var n in t)
      n != "inputs" && n != "outputs" && n != "properties" && (o.prototype[n] = t[n]);
    return o.title = t.title || e.split("/").pop(), o.desc = t.desc || "Generated from object", this.registerNodeType(e, o), o;
  },
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
  wrapFunctionAsNode: function(e, t, r, n, s) {
    var l = Array(t.length), a = "";
    if (r !== null)
      for (var o = LiteGraph.getParameterNames(t), h = 0; h < o.length; ++h) {
        var u = 0;
        r && (r[h] != null && r[h].constructor === String ? u = "'" + r[h] + "'" : r[h] != null && (u = r[h])), a += "this.addInput('" + o[h] + "'," + u + `);
`;
      }
    n !== null && (a += "this.addOutput('out'," + (n != null ? n.constructor === String ? "'" + n + "'" : n : 0) + `);
`), s && (a += "this.properties = " + JSON.stringify(s) + `;
`);
    var p = Function(a);
    return p.title = e.split("/").pop(), p.desc = "Generated from " + t.name, p.prototype.onExecute = function() {
      for (var c = 0; c < l.length; ++c)
        l[c] = this.getInputData(c);
      var g = t.apply(this, l);
      this.setOutputData(0, g);
    }, this.registerNodeType(e, p), p;
  },
  /**
         * Removes all previously registered node's types
         */
  clearRegisteredTypes: function() {
    this.registered_node_types = {}, this.node_types_by_file_extension = {}, this.Nodes = {}, this.searchbox_extras = {};
  },
  /**
         * Adds this method to all nodetypes, existing and to be created
         * (You can add it to LGraphNode.prototype but then existing node types wont have it)
         * @method addNodeMethod
         * @param {Function} func
         */
  addNodeMethod: function(e, t) {
    LGraphNode.prototype[e] = t;
    for (var r in this.registered_node_types) {
      var n = this.registered_node_types[r];
      n.prototype[e] && (n.prototype["_" + e] = n.prototype[e]), n.prototype[e] = t;
    }
  },
  /**
         * Create a node of a given type with a name. The node is not attached to any graph yet.
         * @method createNode
         * @param {String} type full name of the node class. p.e. "math/sin"
         * @param {String} name a name to distinguish from other nodes
         * @param {Object} options to set options
         */
  createNode: function(e, t, r) {
    var n = this.registered_node_types[e];
    if (!n)
      return LiteGraph.debug && console.log(
        'GraphNode type "' + e + '" not registered.'
      ), null;
    n.prototype, t = t || n.title || e;
    var s = null;
    if (LiteGraph.catch_exceptions)
      try {
        s = new n(t);
      } catch (a) {
        return console.error(a), null;
      }
    else
      s = new n(t);
    if (s.type = e, !s.title && t && (s.title = t), s.properties || (s.properties = {}), s.properties_info || (s.properties_info = []), s.flags || (s.flags = {}), s.size || (s.size = s.computeSize()), s.pos || (s.pos = LiteGraph.DEFAULT_POSITION.concat()), s.mode || (s.mode = LiteGraph.ALWAYS), r)
      for (var l in r)
        s[l] = r[l];
    return s.onNodeCreated && s.onNodeCreated(), s;
  },
  /**
         * Returns a registered node type with a given name
         * @method getNodeType
         * @param {String} type full name of the node class. p.e. "math/sin"
         * @return {Class} the node class
         */
  getNodeType: function(e) {
    return this.registered_node_types[e];
  },
  /**
         * Returns a list of node types matching one category
         * @method getNodeType
         * @param {String} category category name
         * @return {Array} array with all the node classes
         */
  getNodeTypesInCategory: function(e, t) {
    var r = [];
    for (var n in this.registered_node_types) {
      var s = this.registered_node_types[n];
      s.filter == t && (e == "" ? s.category == null && r.push(s) : s.category == e && r.push(s));
    }
    return this.auto_sort_node_types && r.sort(function(l, a) {
      return l.title.localeCompare(a.title);
    }), r;
  },
  /**
         * Returns a list with all the node type categories
         * @method getNodeTypesCategories
         * @param {String} filter only nodes with ctor.filter equal can be shown
         * @return {Array} array with all the names of the categories
         */
  getNodeTypesCategories: function(e) {
    var t = { "": 1 };
    for (var r in this.registered_node_types) {
      var n = this.registered_node_types[r];
      if (n.category && !n.skip_list) {
        if (n.filter != e)
          continue;
        t[n.category] = 1;
      }
    }
    var s = [];
    for (var r in t)
      s.push(r);
    return this.auto_sort_node_types ? s.sort() : s;
  },
  //debug purposes: reloads all the js scripts that matches a wildcard
  reloadNodes: function(e) {
    for (var t = document.getElementsByTagName("script"), r = [], n = 0; n < t.length; n++)
      r.push(t[n]);
    var s = document.getElementsByTagName("head")[0];
    e = document.location.href + e;
    for (var n = 0; n < r.length; n++) {
      var l = r[n].src;
      if (!(!l || l.substr(0, e.length) != e))
        try {
          LiteGraph.debug && console.log("Reloading: " + l);
          var a = document.createElement("script");
          a.type = "text/javascript", a.src = l, s.appendChild(a), s.removeChild(r[n]);
        } catch (h) {
          if (LiteGraph.throw_errors)
            throw h;
          LiteGraph.debug && console.log("Error while reloading " + l);
        }
    }
    LiteGraph.debug && console.log("Nodes reloaded");
  },
  //separated just to improve if it doesn't work
  cloneObject: function(e, t) {
    if (e == null)
      return null;
    var r = JSON.parse(JSON.stringify(e));
    if (!t)
      return r;
    for (var n in r)
      t[n] = r[n];
    return t;
  },
  /*
         * https://gist.github.com/jed/982883?permalink_comment_id=852670#gistcomment-852670
         */
  uuidv4: function() {
    return ("10000000-1000-4000-8000" + -1e11).replace(/[018]/g, (e) => (e ^ Math.random() * 16 >> e / 4).toString(16));
  },
  /**
         * Returns if the types of two slots are compatible (taking into account wildcards, etc)
         * @method isValidConnection
         * @param {String} type_a
         * @param {String} type_b
         * @return {Boolean} true if they can be connected
         */
  isValidConnection: function(e, t) {
    if ((e == "" || e === "*") && (e = 0), (t == "" || t === "*") && (t = 0), !e || !t || e == t || e == LiteGraph.EVENT && t == LiteGraph.ACTION)
      return !0;
    if (e = String(e), t = String(t), e = e.toLowerCase(), t = t.toLowerCase(), e.indexOf(",") == -1 && t.indexOf(",") == -1)
      return e == t;
    for (var r = e.split(","), n = t.split(","), s = 0; s < r.length; ++s)
      for (var l = 0; l < n.length; ++l)
        if (this.isValidConnection(r[s], n[l]))
          return !0;
    return !1;
  },
  /**
         * Register a string in the search box so when the user types it it will recommend this node
         * @method registerSearchboxExtra
         * @param {String} node_type the node recommended
         * @param {String} description text to show next to it
         * @param {Object} data it could contain info of how the node should be configured
         * @return {Boolean} true if they can be connected
         */
  registerSearchboxExtra: function(e, t, r) {
    this.searchbox_extras[t.toLowerCase()] = {
      type: e,
      desc: t,
      data: r
    };
  },
  /**
         * Wrapper to load files (from url using fetch or from file using FileReader)
         * @method fetchFile
         * @param {String|File|Blob} url the url of the file (or the file itself)
         * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
         * @param {Function} on_complete callback(data)
         * @param {Function} on_error in case of an error
         * @return {FileReader|Promise} returns the object used to 
         */
  fetchFile: function(e, t, r, n) {
    if (!e)
      return null;
    if (t = t || "text", e.constructor === String)
      return e.substr(0, 4) == "http" && LiteGraph.proxy && (e = LiteGraph.proxy + e.substr(e.indexOf(":") + 3)), fetch(e).then(function(l) {
        if (!l.ok)
          throw new Error("File not found");
        if (t == "arraybuffer")
          return l.arrayBuffer();
        if (t == "text" || t == "string")
          return l.text();
        if (t == "json")
          return l.json();
        if (t == "blob")
          return l.blob();
      }).then(function(l) {
        r && r(l);
      }).catch(function(l) {
        console.error("error fetching file:", e), n && n(l);
      });
    if (e.constructor === File || e.constructor === Blob) {
      var s = new FileReader();
      if (s.onload = function(l) {
        var a = l.target.result;
        t == "json" && (a = JSON.parse(a)), r && r(a);
      }, t == "arraybuffer")
        return s.readAsArrayBuffer(e);
      if (t == "text" || t == "json")
        return s.readAsText(e);
      if (t == "blob")
        return s.readAsBinaryString(e);
    }
    return null;
  }
};
global.LiteGraph = LiteGraph;
typeof performance < "u" ? LiteGraph.getTime = performance.now.bind(performance) : typeof Date < "u" && Date.now ? LiteGraph.getTime = Date.now.bind(Date) : typeof process < "u" ? LiteGraph.getTime = function() {
  var e = process.hrtime();
  return e[0] * 1e-3 + e[1] * 1e-6;
} : LiteGraph.getTime = function() {
  return (/* @__PURE__ */ new Date()).getTime();
};
function LGraph(e) {
  new.target || console.trace("WARNING: Use new to construct a new LGraph rather than calling it.  The current implementation is deprecated and will break in the next update."), LiteGraph.debug && console.log("Graph created"), this.list_of_graphcanvas = null, this.clear(), e && this.configure(e);
}
global.LGraph = LiteGraph.LGraph = LGraph;
LGraph.supported_types = ["number", "string", "boolean"];
LGraph.prototype.getSupportedTypes = function() {
  return this.supported_types || LGraph.supported_types;
};
LGraph.STATUS_STOPPED = 1;
LGraph.STATUS_RUNNING = 2;
LGraph.prototype.clear = function() {
  if (this.stop(), this.status = LGraph.STATUS_STOPPED, this.last_node_id = 0, this.last_link_id = 0, this._version = -1, this._nodes)
    for (var e = 0; e < this._nodes.length; ++e) {
      var t = this._nodes[e];
      t.onRemoved && t.onRemoved();
    }
  this._nodes = [], this._nodes_by_id = {}, this._nodes_in_order = [], this._nodes_executable = null, this._groups = [], this.links = {}, this.iteration = 0, this.config = {}, this.vars = {}, this.extra = {}, this.globaltime = 0, this.runningtime = 0, this.fixedtime = 0, this.fixedtime_lapse = 0.01, this.elapsed_time = 0.01, this.last_update_time = 0, this.starttime = 0, this.catch_errors = !0, this.nodes_executing = [], this.nodes_actioning = [], this.nodes_executedAction = [], this.inputs = {}, this.outputs = {}, this.change(), this.sendActionToCanvas("clear");
};
LGraph.prototype.attachCanvas = function(e) {
  if (e.constructor != LGraphCanvas)
    throw "attachCanvas expects a LGraphCanvas instance";
  e.graph && e.graph != this && e.graph.detachCanvas(e), e.graph = this, this.list_of_graphcanvas || (this.list_of_graphcanvas = []), this.list_of_graphcanvas.push(e);
};
LGraph.prototype.detachCanvas = function(e) {
  if (this.list_of_graphcanvas) {
    var t = this.list_of_graphcanvas.indexOf(e);
    t != -1 && (e.graph = null, this.list_of_graphcanvas.splice(t, 1));
  }
};
LGraph.prototype.start = function(e) {
  if (this.status != LGraph.STATUS_RUNNING) {
    this.status = LGraph.STATUS_RUNNING, this.onPlayEvent && this.onPlayEvent(), this.sendEventToAllNodes("onStart"), this.starttime = LiteGraph.getTime(), this.last_update_time = this.starttime, e = e || 0;
    var t = this;
    if (e == 0 && typeof window < "u" && window.requestAnimationFrame) {
      let r = function() {
        t.execution_timer_id == -1 && (window.requestAnimationFrame(r), t.onBeforeStep && t.onBeforeStep(), t.runStep(1, !t.catch_errors), t.onAfterStep && t.onAfterStep());
      };
      this.execution_timer_id = -1, r();
    } else
      this.execution_timer_id = setInterval(function() {
        t.onBeforeStep && t.onBeforeStep(), t.runStep(1, !t.catch_errors), t.onAfterStep && t.onAfterStep();
      }, e);
  }
};
LGraph.prototype.stop = function() {
  this.status != LGraph.STATUS_STOPPED && (this.status = LGraph.STATUS_STOPPED, this.onStopEvent && this.onStopEvent(), this.execution_timer_id != null && (this.execution_timer_id != -1 && clearInterval(this.execution_timer_id), this.execution_timer_id = null), this.sendEventToAllNodes("onStop"));
};
LGraph.prototype.runStep = function(e, t, r) {
  e = e || 1;
  var n = LiteGraph.getTime();
  this.globaltime = 1e-3 * (n - this.starttime);
  var s = this._nodes_executable ? this._nodes_executable : this._nodes;
  if (s) {
    if (r = r || s.length, t) {
      for (var l = 0; l < e; l++) {
        for (var a = 0; a < r; ++a) {
          var o = s[a];
          LiteGraph.use_deferred_actions && o._waiting_actions && o._waiting_actions.length && o.executePendingActions(), o.mode == LiteGraph.ALWAYS && o.onExecute && o.doExecute();
        }
        this.fixedtime += this.fixedtime_lapse, this.onExecuteStep && this.onExecuteStep();
      }
      this.onAfterExecute && this.onAfterExecute();
    } else
      try {
        for (var l = 0; l < e; l++) {
          for (var a = 0; a < r; ++a) {
            var o = s[a];
            LiteGraph.use_deferred_actions && o._waiting_actions && o._waiting_actions.length && o.executePendingActions(), o.mode == LiteGraph.ALWAYS && o.onExecute && o.onExecute();
          }
          this.fixedtime += this.fixedtime_lapse, this.onExecuteStep && this.onExecuteStep();
        }
        this.onAfterExecute && this.onAfterExecute(), this.errors_in_execution = !1;
      } catch (p) {
        if (this.errors_in_execution = !0, LiteGraph.throw_errors)
          throw p;
        LiteGraph.debug && console.log("Error during execution: " + p), this.stop();
      }
    var h = LiteGraph.getTime(), u = h - n;
    u == 0 && (u = 1), this.execution_time = 1e-3 * u, this.globaltime += 1e-3 * u, this.iteration += 1, this.elapsed_time = (h - this.last_update_time) * 1e-3, this.last_update_time = h, this.nodes_executing = [], this.nodes_actioning = [], this.nodes_executedAction = [];
  }
};
LGraph.prototype.updateExecutionOrder = function() {
  this._nodes_in_order = this.computeExecutionOrder(!1), this._nodes_executable = [];
  for (var e = 0; e < this._nodes_in_order.length; ++e)
    this._nodes_in_order[e].onExecute && this._nodes_executable.push(this._nodes_in_order[e]);
};
LGraph.prototype.computeExecutionOrder = function(e, t) {
  for (var r = [], n = [], s = {}, l = {}, a = {}, o = 0, L = this._nodes.length; o < L; ++o) {
    var h = this._nodes[o];
    if (!(e && !h.onExecute)) {
      s[h.id] = h;
      var u = 0;
      if (h.inputs)
        for (var p = 0, f = h.inputs.length; p < f; p++)
          h.inputs[p] && h.inputs[p].link != null && (u += 1);
      u == 0 ? (n.push(h), t && (h._level = 1)) : (t && (h._level = 0), a[h.id] = u);
    }
  }
  for (; n.length != 0; ) {
    var h = n.shift();
    if (r.push(h), delete s[h.id], !!h.outputs)
      for (var o = 0; o < h.outputs.length; o++) {
        var c = h.outputs[o];
        if (!(c == null || c.links == null || c.links.length == 0))
          for (var p = 0; p < c.links.length; p++) {
            var g = c.links[p], d = this.links[g];
            if (d && !l[d.id]) {
              var G = this.getNodeById(d.target_id);
              if (G == null) {
                l[d.id] = !0;
                continue;
              }
              t && (!G._level || G._level <= h._level) && (G._level = h._level + 1), l[d.id] = !0, a[G.id] -= 1, a[G.id] == 0 && n.push(G);
            }
          }
      }
  }
  for (var o in s)
    r.push(s[o]);
  r.length != this._nodes.length && LiteGraph.debug && console.warn("something went wrong, nodes missing");
  for (var L = r.length, o = 0; o < L; ++o)
    r[o].order = o;
  r = r.sort(function(m, b) {
    var _ = m.constructor.priority || m.priority || 0, C = b.constructor.priority || b.priority || 0;
    return _ == C ? m.order - b.order : _ - C;
  });
  for (var o = 0; o < L; ++o)
    r[o].order = o;
  return r;
};
LGraph.prototype.getAncestors = function(e) {
  for (var t = [], r = [e], n = {}; r.length; ) {
    var s = r.shift();
    if (s.inputs) {
      !n[s.id] && s != e && (n[s.id] = !0, t.push(s));
      for (var l = 0; l < s.inputs.length; ++l) {
        var a = s.getInputNode(l);
        a && t.indexOf(a) == -1 && r.push(a);
      }
    }
  }
  return t.sort(function(o, h) {
    return o.order - h.order;
  }), t;
};
LGraph.prototype.arrange = function(e, t) {
  e = e || 100;
  const r = this.computeExecutionOrder(!1, !0), n = [];
  for (let l = 0; l < r.length; ++l) {
    const a = r[l], o = a._level || 1;
    n[o] || (n[o] = []), n[o].push(a);
  }
  let s = e;
  for (let l = 0; l < n.length; ++l) {
    const a = n[l];
    if (!a)
      continue;
    let o = 100, h = e + LiteGraph.NODE_TITLE_HEIGHT;
    for (let u = 0; u < a.length; ++u) {
      const p = a[u];
      p.pos[0] = t == LiteGraph.VERTICAL_LAYOUT ? h : s, p.pos[1] = t == LiteGraph.VERTICAL_LAYOUT ? s : h;
      const f = t == LiteGraph.VERTICAL_LAYOUT ? 1 : 0;
      p.size[f] > o && (o = p.size[f]);
      const c = t == LiteGraph.VERTICAL_LAYOUT ? 0 : 1;
      h += p.size[c] + e + LiteGraph.NODE_TITLE_HEIGHT;
    }
    s += o + e;
  }
  this.setDirtyCanvas(!0, !0);
};
LGraph.prototype.getTime = function() {
  return this.globaltime;
};
LGraph.prototype.getFixedTime = function() {
  return this.fixedtime;
};
LGraph.prototype.getElapsedTime = function() {
  return this.elapsed_time;
};
LGraph.prototype.sendEventToAllNodes = function(e, t, r) {
  r = r || LiteGraph.ALWAYS;
  var n = this._nodes_in_order ? this._nodes_in_order : this._nodes;
  if (n)
    for (var s = 0, l = n.length; s < l; ++s) {
      var a = n[s];
      if (a.constructor === LiteGraph.Subgraph && e != "onExecute") {
        a.mode == r && a.sendEventToAllNodes(e, t, r);
        continue;
      }
      !a[e] || a.mode != r || (t === void 0 ? a[e]() : t && t.constructor === Array ? a[e].apply(a, t) : a[e](t));
    }
};
LGraph.prototype.sendActionToCanvas = function(e, t) {
  if (this.list_of_graphcanvas)
    for (var r = 0; r < this.list_of_graphcanvas.length; ++r) {
      var n = this.list_of_graphcanvas[r];
      n[e] && n[e].apply(n, t);
    }
};
LGraph.prototype.add = function(e, t) {
  if (e) {
    if (e.constructor === LGraphGroup) {
      this._groups.push(e), this.setDirtyCanvas(!0), this.change(), e.graph = this, this._version++;
      return;
    }
    if (e.id != -1 && this._nodes_by_id[e.id] != null && (console.warn(
      "LiteGraph: there is already a node with this ID, changing it"
    ), LiteGraph.use_uuids ? e.id = LiteGraph.uuidv4() : e.id = ++this.last_node_id), this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES)
      throw "LiteGraph: max number of nodes in a graph reached";
    return LiteGraph.use_uuids ? (e.id == null || e.id == -1) && (e.id = LiteGraph.uuidv4()) : e.id == null || e.id == -1 ? e.id = ++this.last_node_id : this.last_node_id < e.id && (this.last_node_id = e.id), e.graph = this, this._version++, this._nodes.push(e), this._nodes_by_id[e.id] = e, e.onAdded && e.onAdded(this), this.config.align_to_grid && e.alignToGrid(), t || this.updateExecutionOrder(), this.onNodeAdded && this.onNodeAdded(e), this.setDirtyCanvas(!0), this.change(), e;
  }
};
LGraph.prototype.remove = function(e) {
  if (e.constructor === LiteGraph.LGraphGroup) {
    var t = this._groups.indexOf(e);
    t != -1 && this._groups.splice(t, 1), e.graph = null, this._version++, this.setDirtyCanvas(!0, !0), this.change();
    return;
  }
  if (this._nodes_by_id[e.id] != null && !e.ignore_remove) {
    if (this.beforeChange(), e.inputs)
      for (var r = 0; r < e.inputs.length; r++) {
        var n = e.inputs[r];
        n.link != null && e.disconnectInput(r);
      }
    if (e.outputs)
      for (var r = 0; r < e.outputs.length; r++) {
        var n = e.outputs[r];
        n.links != null && n.links.length && e.disconnectOutput(r);
      }
    if (e.onRemoved && e.onRemoved(), e.graph = null, this._version++, this.list_of_graphcanvas)
      for (var r = 0; r < this.list_of_graphcanvas.length; ++r) {
        var s = this.list_of_graphcanvas[r];
        s.selected_nodes[e.id] && delete s.selected_nodes[e.id], s.node_dragged == e && (s.node_dragged = null);
      }
    var l = this._nodes.indexOf(e);
    l != -1 && this._nodes.splice(l, 1), delete this._nodes_by_id[e.id], this.onNodeRemoved && this.onNodeRemoved(e), this.sendActionToCanvas("checkPanels"), this.setDirtyCanvas(!0, !0), this.afterChange(), this.change(), this.updateExecutionOrder();
  }
};
LGraph.prototype.getNodeById = function(e) {
  return e == null ? null : this._nodes_by_id[e];
};
LGraph.prototype.findNodesByClass = function(e, t) {
  t = t || [], t.length = 0;
  for (var r = 0, n = this._nodes.length; r < n; ++r)
    this._nodes[r].constructor === e && t.push(this._nodes[r]);
  return t;
};
LGraph.prototype.findNodesByType = function(r, t) {
  var r = r.toLowerCase();
  t = t || [], t.length = 0;
  for (var n = 0, s = this._nodes.length; n < s; ++n)
    this._nodes[n].type.toLowerCase() == r && t.push(this._nodes[n]);
  return t;
};
LGraph.prototype.findNodeByTitle = function(e) {
  for (var t = 0, r = this._nodes.length; t < r; ++t)
    if (this._nodes[t].title == e)
      return this._nodes[t];
  return null;
};
LGraph.prototype.findNodesByTitle = function(e) {
  for (var t = [], r = 0, n = this._nodes.length; r < n; ++r)
    this._nodes[r].title == e && t.push(this._nodes[r]);
  return t;
};
LGraph.prototype.getNodeOnPos = function(e, t, r, n) {
  r = r || this._nodes;
  for (var s = null, l = r.length - 1; l >= 0; l--) {
    var a = r[l], o = a.constructor.title_mode == LiteGraph.NO_TITLE;
    if (a.isPointInside(e, t, n, o))
      return a;
  }
  return s;
};
LGraph.prototype.getGroupOnPos = function(e, t) {
  for (var r = this._groups.length - 1; r >= 0; r--) {
    var n = this._groups[r];
    if (n.isPointInside(e, t, 2, !0))
      return n;
  }
  return null;
};
LGraph.prototype.checkNodeTypes = function() {
  for (var e = 0; e < this._nodes.length; e++) {
    var t = this._nodes[e], r = LiteGraph.registered_node_types[t.type];
    if (t.constructor != r) {
      console.log("node being replaced by newer version: " + t.type);
      var n = LiteGraph.createNode(t.type);
      this._nodes[e] = n, n.configure(t.serialize()), n.graph = this, this._nodes_by_id[n.id] = n, t.inputs && (n.inputs = t.inputs.concat()), t.outputs && (n.outputs = t.outputs.concat());
    }
  }
  this.updateExecutionOrder();
};
LGraph.prototype.onAction = function(e, t, r) {
  this._input_nodes = this.findNodesByClass(
    LiteGraph.GraphInput,
    this._input_nodes
  );
  for (var n = 0; n < this._input_nodes.length; ++n) {
    var s = this._input_nodes[n];
    if (s.properties.name == e) {
      s.actionDo(e, t, r);
      break;
    }
  }
};
LGraph.prototype.trigger = function(e, t) {
  this.onTrigger && this.onTrigger(e, t);
};
LGraph.prototype.addInput = function(e, t, r) {
  var n = this.inputs[e];
  n || (this.beforeChange(), this.inputs[e] = { name: e, type: t, value: r }, this._version++, this.afterChange(), this.onInputAdded && this.onInputAdded(e, t), this.onInputsOutputsChange && this.onInputsOutputsChange());
};
LGraph.prototype.setInputData = function(e, t) {
  var r = this.inputs[e];
  r && (r.value = t);
};
LGraph.prototype.getInputData = function(e) {
  var t = this.inputs[e];
  return t ? t.value : null;
};
LGraph.prototype.renameInput = function(e, t) {
  if (t != e) {
    if (!this.inputs[e])
      return !1;
    if (this.inputs[t])
      return console.error("there is already one input with that name"), !1;
    this.inputs[t] = this.inputs[e], delete this.inputs[e], this._version++, this.onInputRenamed && this.onInputRenamed(e, t), this.onInputsOutputsChange && this.onInputsOutputsChange();
  }
};
LGraph.prototype.changeInputType = function(e, t) {
  if (!this.inputs[e])
    return !1;
  this.inputs[e].type && String(this.inputs[e].type).toLowerCase() == String(t).toLowerCase() || (this.inputs[e].type = t, this._version++, this.onInputTypeChanged && this.onInputTypeChanged(e, t));
};
LGraph.prototype.removeInput = function(e) {
  return this.inputs[e] ? (delete this.inputs[e], this._version++, this.onInputRemoved && this.onInputRemoved(e), this.onInputsOutputsChange && this.onInputsOutputsChange(), !0) : !1;
};
LGraph.prototype.addOutput = function(e, t, r) {
  this.outputs[e] = { name: e, type: t, value: r }, this._version++, this.onOutputAdded && this.onOutputAdded(e, t), this.onInputsOutputsChange && this.onInputsOutputsChange();
};
LGraph.prototype.setOutputData = function(e, t) {
  var r = this.outputs[e];
  r && (r.value = t);
};
LGraph.prototype.getOutputData = function(e) {
  var t = this.outputs[e];
  return t ? t.value : null;
};
LGraph.prototype.renameOutput = function(e, t) {
  if (!this.outputs[e])
    return !1;
  if (this.outputs[t])
    return console.error("there is already one output with that name"), !1;
  this.outputs[t] = this.outputs[e], delete this.outputs[e], this._version++, this.onOutputRenamed && this.onOutputRenamed(e, t), this.onInputsOutputsChange && this.onInputsOutputsChange();
};
LGraph.prototype.changeOutputType = function(e, t) {
  if (!this.outputs[e])
    return !1;
  this.outputs[e].type && String(this.outputs[e].type).toLowerCase() == String(t).toLowerCase() || (this.outputs[e].type = t, this._version++, this.onOutputTypeChanged && this.onOutputTypeChanged(e, t));
};
LGraph.prototype.removeOutput = function(e) {
  return this.outputs[e] ? (delete this.outputs[e], this._version++, this.onOutputRemoved && this.onOutputRemoved(e), this.onInputsOutputsChange && this.onInputsOutputsChange(), !0) : !1;
};
LGraph.prototype.triggerInput = function(e, t) {
  for (var r = this.findNodesByTitle(e), n = 0; n < r.length; ++n)
    r[n].onTrigger(t);
};
LGraph.prototype.setCallback = function(e, t) {
  for (var r = this.findNodesByTitle(e), n = 0; n < r.length; ++n)
    r[n].setTrigger(t);
};
LGraph.prototype.beforeChange = function(e) {
  this.onBeforeChange && this.onBeforeChange(this, e), this.sendActionToCanvas("onBeforeChange", this);
};
LGraph.prototype.afterChange = function(e) {
  this.onAfterChange && this.onAfterChange(this, e), this.sendActionToCanvas("onAfterChange", this);
};
LGraph.prototype.connectionChange = function(e, t) {
  this.updateExecutionOrder(), this.onConnectionChange && this.onConnectionChange(e), this._version++, this.sendActionToCanvas("onConnectionChange");
};
LGraph.prototype.isLive = function() {
  if (!this.list_of_graphcanvas)
    return !1;
  for (var e = 0; e < this.list_of_graphcanvas.length; ++e) {
    var t = this.list_of_graphcanvas[e];
    if (t.live_mode)
      return !0;
  }
  return !1;
};
LGraph.prototype.clearTriggeredSlots = function() {
  for (var e in this.links) {
    var t = this.links[e];
    t && t._last_time && (t._last_time = 0);
  }
};
LGraph.prototype.change = function() {
  LiteGraph.debug && console.log("Graph changed"), this.sendActionToCanvas("setDirty", [!0, !0]), this.on_change && this.on_change(this);
};
LGraph.prototype.setDirtyCanvas = function(e, t) {
  this.sendActionToCanvas("setDirty", [e, t]);
};
LGraph.prototype.removeLink = function(e) {
  var t = this.links[e];
  if (t) {
    var r = this.getNodeById(t.target_id);
    r && r.disconnectInput(t.target_slot);
  }
};
LGraph.prototype.serialize = function() {
  for (var e = [], t = 0, r = this._nodes.length; t < r; ++t)
    e.push(this._nodes[t].serialize());
  var n = [];
  for (var t in this.links) {
    var s = this.links[t];
    if (!s.serialize) {
      console.warn(
        "weird LLink bug, link info is not a LLink but a regular object"
      );
      var l = new LLink();
      for (var a in s)
        l[a] = s[a];
      this.links[t] = l, s = l;
    }
    n.push(s.serialize());
  }
  for (var o = [], t = 0; t < this._groups.length; ++t)
    o.push(this._groups[t].serialize());
  var h = {
    last_node_id: this.last_node_id,
    last_link_id: this.last_link_id,
    nodes: e,
    links: n,
    groups: o,
    config: this.config,
    extra: this.extra,
    version: LiteGraph.VERSION
  };
  return this.onSerialize && this.onSerialize(h), h;
};
LGraph.prototype.configure = function(e, t) {
  if (e) {
    t || this.clear();
    var r = e.nodes;
    if (e.links && e.links.constructor === Array) {
      for (var n = [], s = 0; s < e.links.length; ++s) {
        var l = e.links[s];
        if (!l) {
          console.warn("serialized graph link data contains errors, skipping.");
          continue;
        }
        var a = new LLink();
        a.configure(l), n[a.id] = a;
      }
      e.links = n;
    }
    for (var s in e)
      s == "nodes" || s == "groups" || (this[s] = e[s]);
    var o = !1;
    if (this._nodes = [], r) {
      for (var s = 0, h = r.length; s < h; ++s) {
        var u = r[s], p = LiteGraph.createNode(u.type, u.title);
        p || (LiteGraph.debug && console.log(
          "Node not found or has errors: " + u.type
        ), p = new LGraphNode(), p.last_serialization = u, p.has_errors = !0, o = !0), p.id = u.id, this.add(p, !0);
      }
      for (var s = 0, h = r.length; s < h; ++s) {
        var u = r[s], p = this.getNodeById(u.id);
        p && p.configure(u);
      }
    }
    if (this._groups.length = 0, e.groups)
      for (var s = 0; s < e.groups.length; ++s) {
        var f = new LiteGraph.LGraphGroup();
        f.configure(e.groups[s]), this.add(f);
      }
    return this.updateExecutionOrder(), this.extra = e.extra || {}, this.onConfigure && this.onConfigure(e), this._version++, this.setDirtyCanvas(!0, !0), o;
  }
};
LGraph.prototype.load = function(e, t) {
  var r = this;
  if (e.constructor === File || e.constructor === Blob) {
    var n = new FileReader();
    n.addEventListener("load", function(l) {
      var a = JSON.parse(l.target.result);
      r.configure(a), t && t();
    }), n.readAsText(e);
    return;
  }
  var s = new XMLHttpRequest();
  s.open("GET", e, !0), s.send(null), s.onload = function(l) {
    if (s.status !== 200) {
      console.error("Error loading graph:", s.status, s.response);
      return;
    }
    var a = JSON.parse(s.response);
    r.configure(a), t && t();
  }, s.onerror = function(l) {
    console.error("Error loading graph:", l);
  };
};
LGraph.prototype.onNodeTrace = function(e, t, r) {
};
function LLink(e, t, r, n, s, l) {
  new.target || console.trace("WARNING: Use new to construct a new LLink rather than calling it.  The current implementation is deprecated and will break in the next update."), this.id = e, this.type = t, this.origin_id = r, this.origin_slot = n, this.target_id = s, this.target_slot = l, this._data = null, this._pos = new Float32Array(2);
}
LLink.prototype.configure = function(e) {
  e.constructor === Array ? (this.id = e[0], this.origin_id = e[1], this.origin_slot = e[2], this.target_id = e[3], this.target_slot = e[4], this.type = e[5]) : (this.id = e.id, this.type = e.type, this.origin_id = e.origin_id, this.origin_slot = e.origin_slot, this.target_id = e.target_id, this.target_slot = e.target_slot);
};
LLink.prototype.serialize = function() {
  return [
    this.id,
    this.origin_id,
    this.origin_slot,
    this.target_id,
    this.target_slot,
    this.type
  ];
};
LiteGraph.LLink = LLink;
function LGraphNode(e) {
  new.target || console.trace("WARNING: Use new to construct a new LGraphNode rather than calling it.  The current implementation is deprecated and will break in the next update."), this._ctor(e);
}
global.LGraphNode = LiteGraph.LGraphNode = LGraphNode;
LGraphNode.prototype._ctor = function(e) {
  this.title = e || "Unnamed", this.size = [LiteGraph.NODE_WIDTH, 60], this.graph = null, this._pos = new Float32Array(10, 10), Object.defineProperty(this, "pos", {
    set: function(t) {
      !t || t.length < 2 || (this._pos[0] = t[0], this._pos[1] = t[1]);
    },
    get: function() {
      return this._pos;
    },
    enumerable: !0
  }), LiteGraph.use_uuids ? this.id = LiteGraph.uuidv4() : this.id = -1, this.type = null, this.inputs = [], this.outputs = [], this.connections = [], this.properties = {}, this.properties_info = [], this.flags = {};
};
LGraphNode.prototype.configure = function(e) {
  this.graph && this.graph._version++;
  for (var t in e) {
    if (t == "properties") {
      for (var r in e.properties)
        this.properties[r] = e.properties[r], this.onPropertyChanged && this.onPropertyChanged(r, e.properties[r]);
      continue;
    }
    e[t] != null && (typeof e[t] == "object" ? this[t] && this[t].configure ? this[t].configure(e[t]) : this[t] = LiteGraph.cloneObject(e[t], this[t]) : this[t] = e[t]);
  }
  if (e.title || (this.title = this.constructor.title), this.inputs)
    for (var n = 0; n < this.inputs.length; ++n) {
      var s = this.inputs[n], l = this.graph ? this.graph.links[s.link] : null;
      this.onConnectionsChange && this.onConnectionsChange(LiteGraph.INPUT, n, !0, l, s), this.onInputAdded && this.onInputAdded(s);
    }
  if (this.outputs)
    for (var n = 0; n < this.outputs.length; ++n) {
      var a = this.outputs[n];
      if (a.links) {
        for (var t = 0; t < a.links.length; ++t) {
          var l = this.graph ? this.graph.links[a.links[t]] : null;
          this.onConnectionsChange && this.onConnectionsChange(LiteGraph.OUTPUT, n, !0, l, a);
        }
        this.onOutputAdded && this.onOutputAdded(a);
      }
    }
  if (this.widgets) {
    for (var n = 0; n < this.widgets.length; ++n) {
      var o = this.widgets[n];
      o && o.options && o.options.property && this.properties[o.options.property] != null && (o.value = JSON.parse(JSON.stringify(this.properties[o.options.property])));
    }
    if (e.widgets_values)
      for (var n = 0; n < e.widgets_values.length; ++n)
        this.widgets[n] && (this.widgets[n].value = e.widgets_values[n]);
  }
  this.onConfigure && this.onConfigure(e);
};
LGraphNode.prototype.serialize = function() {
  var e = {
    id: this.id,
    type: this.type,
    pos: this.pos,
    size: this.size,
    flags: LiteGraph.cloneObject(this.flags),
    order: this.order,
    mode: this.mode
  };
  if (this.constructor === LGraphNode && this.last_serialization)
    return this.last_serialization;
  if (this.inputs && (e.inputs = this.inputs), this.outputs) {
    for (var t = 0; t < this.outputs.length; t++)
      delete this.outputs[t]._data;
    e.outputs = this.outputs;
  }
  if (this.title && this.title != this.constructor.title && (e.title = this.title), this.properties && (e.properties = LiteGraph.cloneObject(this.properties)), this.widgets && this.serialize_widgets) {
    e.widgets_values = [];
    for (var t = 0; t < this.widgets.length; ++t)
      this.widgets[t] ? e.widgets_values[t] = this.widgets[t].value : e.widgets_values[t] = null;
  }
  return e.type || (e.type = this.constructor.type), this.color && (e.color = this.color), this.bgcolor && (e.bgcolor = this.bgcolor), this.boxcolor && (e.boxcolor = this.boxcolor), this.shape && (e.shape = this.shape), this.onSerialize && this.onSerialize(e) && console.warn(
    "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
  ), e;
};
LGraphNode.prototype.clone = function() {
  var e = LiteGraph.createNode(this.type);
  if (!e)
    return null;
  var t = LiteGraph.cloneObject(this.serialize());
  if (t.inputs)
    for (var r = 0; r < t.inputs.length; ++r)
      t.inputs[r].link = null;
  if (t.outputs)
    for (var r = 0; r < t.outputs.length; ++r)
      t.outputs[r].links && (t.outputs[r].links.length = 0);
  return delete t.id, LiteGraph.use_uuids && (t.id = LiteGraph.uuidv4()), e.configure(t), e;
};
LGraphNode.prototype.toString = function() {
  return JSON.stringify(this.serialize());
};
LGraphNode.prototype.getTitle = function() {
  return this.title || this.constructor.title;
};
LGraphNode.prototype.setProperty = function(e, t) {
  if (this.properties || (this.properties = {}), t !== this.properties[e]) {
    var r = this.properties[e];
    if (this.properties[e] = t, this.onPropertyChanged && this.onPropertyChanged(e, t, r) === !1 && (this.properties[e] = r), this.widgets)
      for (var n = 0; n < this.widgets.length; ++n) {
        var s = this.widgets[n];
        if (s && s.options.property == e) {
          s.value = t;
          break;
        }
      }
  }
};
LGraphNode.prototype.setOutputData = function(e, t) {
  if (this.outputs && !(e == -1 || e >= this.outputs.length)) {
    var r = this.outputs[e];
    if (r && (r._data = t, this.outputs[e].links))
      for (var n = 0; n < this.outputs[e].links.length; n++) {
        var s = this.outputs[e].links[n], l = this.graph.links[s];
        l && (l.data = t);
      }
  }
};
LGraphNode.prototype.setOutputDataType = function(e, t) {
  if (this.outputs && !(e == -1 || e >= this.outputs.length)) {
    var r = this.outputs[e];
    if (r && (r.type = t, this.outputs[e].links))
      for (var n = 0; n < this.outputs[e].links.length; n++) {
        var s = this.outputs[e].links[n];
        this.graph.links[s].type = t;
      }
  }
};
LGraphNode.prototype.getInputData = function(e, t) {
  if (this.inputs && !(e >= this.inputs.length || this.inputs[e].link == null)) {
    var r = this.inputs[e].link, n = this.graph.links[r];
    if (!n)
      return null;
    if (!t)
      return n.data;
    var s = this.graph.getNodeById(n.origin_id);
    return s && (s.updateOutputData ? s.updateOutputData(n.origin_slot) : s.onExecute && s.onExecute()), n.data;
  }
};
LGraphNode.prototype.getInputDataType = function(e) {
  if (!this.inputs || e >= this.inputs.length || this.inputs[e].link == null)
    return null;
  var t = this.inputs[e].link, r = this.graph.links[t];
  if (!r)
    return null;
  var n = this.graph.getNodeById(r.origin_id);
  if (!n)
    return r.type;
  var s = n.outputs[r.origin_slot];
  return s ? s.type : null;
};
LGraphNode.prototype.getInputDataByName = function(e, t) {
  var r = this.findInputSlot(e);
  return r == -1 ? null : this.getInputData(r, t);
};
LGraphNode.prototype.isInputConnected = function(e) {
  return this.inputs ? e < this.inputs.length && this.inputs[e].link != null : !1;
};
LGraphNode.prototype.getInputInfo = function(e) {
  return this.inputs && e < this.inputs.length ? this.inputs[e] : null;
};
LGraphNode.prototype.getInputLink = function(e) {
  if (!this.inputs)
    return null;
  if (e < this.inputs.length) {
    var t = this.inputs[e];
    return this.graph.links[t.link];
  }
  return null;
};
LGraphNode.prototype.getInputNode = function(e) {
  if (!this.inputs || e >= this.inputs.length)
    return null;
  var t = this.inputs[e];
  if (!t || t.link === null)
    return null;
  var r = this.graph.links[t.link];
  return r ? this.graph.getNodeById(r.origin_id) : null;
};
LGraphNode.prototype.getInputOrProperty = function(e) {
  if (!this.inputs || !this.inputs.length)
    return this.properties ? this.properties[e] : null;
  for (var t = 0, r = this.inputs.length; t < r; ++t) {
    var n = this.inputs[t];
    if (e == n.name && n.link != null) {
      var s = this.graph.links[n.link];
      if (s)
        return s.data;
    }
  }
  return this.properties[e];
};
LGraphNode.prototype.getOutputData = function(e) {
  if (!this.outputs || e >= this.outputs.length)
    return null;
  var t = this.outputs[e];
  return t._data;
};
LGraphNode.prototype.getOutputInfo = function(e) {
  return this.outputs && e < this.outputs.length ? this.outputs[e] : null;
};
LGraphNode.prototype.isOutputConnected = function(e) {
  return this.outputs ? e < this.outputs.length && this.outputs[e].links && this.outputs[e].links.length : !1;
};
LGraphNode.prototype.isAnyOutputConnected = function() {
  if (!this.outputs)
    return !1;
  for (var e = 0; e < this.outputs.length; ++e)
    if (this.outputs[e].links && this.outputs[e].links.length)
      return !0;
  return !1;
};
LGraphNode.prototype.getOutputNodes = function(e) {
  if (!this.outputs || this.outputs.length == 0 || e >= this.outputs.length)
    return null;
  var t = this.outputs[e];
  if (!t.links || t.links.length == 0)
    return null;
  for (var r = [], n = 0; n < t.links.length; n++) {
    var s = t.links[n], l = this.graph.links[s];
    if (l) {
      var a = this.graph.getNodeById(l.target_id);
      a && r.push(a);
    }
  }
  return r;
};
LGraphNode.prototype.addOnTriggerInput = function() {
  var e = this.findInputSlot("onTrigger");
  if (e == -1) {
    //!trigS || 
    return this.addInput("onTrigger", LiteGraph.EVENT, { optional: !0, nameLocked: !0 }), this.findInputSlot("onTrigger");
  }
  return e;
};
LGraphNode.prototype.addOnExecutedOutput = function() {
  var e = this.findOutputSlot("onExecuted");
  if (e == -1) {
    //!trigS || 
    return this.addOutput("onExecuted", LiteGraph.ACTION, { optional: !0, nameLocked: !0 }), this.findOutputSlot("onExecuted");
  }
  return e;
};
LGraphNode.prototype.onAfterExecuteNode = function(e, t) {
  var r = this.findOutputSlot("onExecuted");
  r != -1 && this.triggerSlot(r, e, null, t);
};
LGraphNode.prototype.changeMode = function(e) {
  switch (e) {
    case LiteGraph.ON_EVENT:
      break;
    case LiteGraph.ON_TRIGGER:
      this.addOnTriggerInput(), this.addOnExecutedOutput();
      break;
    case LiteGraph.NEVER:
      break;
    case LiteGraph.ALWAYS:
      break;
    case LiteGraph.ON_REQUEST:
      break;
    default:
      return !1;
  }
  return this.mode = e, !0;
};
LGraphNode.prototype.executePendingActions = function() {
  if (!(!this._waiting_actions || !this._waiting_actions.length)) {
    for (var e = 0; e < this._waiting_actions.length; ++e) {
      var t = this._waiting_actions[e];
      this.onAction(t[0], t[1], t[2], t[3], t[4]);
    }
    this._waiting_actions.length = 0;
  }
};
LGraphNode.prototype.doExecute = function(e, t) {
  t = t || {}, this.onExecute && (t.action_call || (t.action_call = this.id + "_exec_" + Math.floor(Math.random() * 9999)), this.graph.nodes_executing[this.id] = !0, this.onExecute(e, t), this.graph.nodes_executing[this.id] = !1, this.exec_version = this.graph.iteration, t && t.action_call && (this.action_call = t.action_call, this.graph.nodes_executedAction[this.id] = t.action_call)), this.execute_triggered = 2, this.onAfterExecuteNode && this.onAfterExecuteNode(e, t);
};
LGraphNode.prototype.actionDo = function(e, t, r, n) {
  r = r || {}, this.onAction && (r.action_call || (r.action_call = this.id + "_" + (e || "action") + "_" + Math.floor(Math.random() * 9999)), this.graph.nodes_actioning[this.id] = e || "actioning", this.onAction(e, t, r, n), this.graph.nodes_actioning[this.id] = !1, r && r.action_call && (this.action_call = r.action_call, this.graph.nodes_executedAction[this.id] = r.action_call)), this.action_triggered = 2, this.onAfterExecuteNode && this.onAfterExecuteNode(t, r);
};
LGraphNode.prototype.trigger = function(e, t, r) {
  if (!(!this.outputs || !this.outputs.length)) {
    this.graph && (this.graph._last_trigger_time = LiteGraph.getTime());
    for (var n = 0; n < this.outputs.length; ++n) {
      var s = this.outputs[n];
      !s || s.type !== LiteGraph.EVENT || e && s.name != e || this.triggerSlot(n, t, null, r);
    }
  }
};
LGraphNode.prototype.triggerSlot = function(e, t, r, n) {
  if (n = n || {}, !!this.outputs) {
    if (e == null) {
      console.error("slot must be a number");
      return;
    }
    e.constructor !== Number && console.warn("slot must be a number, use node.trigger('name') if you want to use a string");
    var s = this.outputs[e];
    if (s) {
      var l = s.links;
      if (!(!l || !l.length)) {
        this.graph && (this.graph._last_trigger_time = LiteGraph.getTime());
        for (var a = 0; a < l.length; ++a) {
          var o = l[a];
          if (!(r != null && r != o)) {
            var h = this.graph.links[l[a]];
            if (h) {
              h._last_time = LiteGraph.getTime();
              var u = this.graph.getNodeById(h.target_id);
              if (u) {
                var p = u.inputs[h.target_slot];
                if (u.mode === LiteGraph.ON_TRIGGER)
                  n.action_call || (n.action_call = this.id + "_trigg_" + Math.floor(Math.random() * 9999)), u.onExecute && u.doExecute(t, n);
                else if (u.onAction) {
                  n.action_call || (n.action_call = this.id + "_act_" + Math.floor(Math.random() * 9999));
                  var p = u.inputs[h.target_slot];
                  LiteGraph.use_deferred_actions && u.onExecute ? (u._waiting_actions || (u._waiting_actions = []), u._waiting_actions.push([p.name, t, n, h.target_slot])) : u.actionDo(p.name, t, n, h.target_slot);
                }
              }
            }
          }
        }
      }
    }
  }
};
LGraphNode.prototype.clearTriggeredSlot = function(e, t) {
  if (this.outputs) {
    var r = this.outputs[e];
    if (r) {
      var n = r.links;
      if (!(!n || !n.length))
        for (var s = 0; s < n.length; ++s) {
          var l = n[s];
          if (!(t != null && t != l)) {
            var a = this.graph.links[n[s]];
            a && (a._last_time = 0);
          }
        }
    }
  }
};
LGraphNode.prototype.setSize = function(e) {
  this.size = e, this.onResize && this.onResize(this.size);
};
LGraphNode.prototype.addProperty = function(e, t, r, n) {
  var s = { name: e, type: r, default_value: t };
  if (n)
    for (var l in n)
      s[l] = n[l];
  return this.properties_info || (this.properties_info = []), this.properties_info.push(s), this.properties || (this.properties = {}), this.properties[e] = t, s;
};
LGraphNode.prototype.addOutput = function(e, t, r) {
  var n = { name: e, type: t, links: null };
  if (r)
    for (var s in r)
      n[s] = r[s];
  return this.outputs || (this.outputs = []), this.outputs.push(n), this.onOutputAdded && this.onOutputAdded(n), LiteGraph.auto_load_slot_types && LiteGraph.registerNodeAndSlotType(this, t, !0), this.setSize(this.computeSize()), this.setDirtyCanvas(!0, !0), n;
};
LGraphNode.prototype.addOutputs = function(e) {
  for (var t = 0; t < e.length; ++t) {
    var r = e[t], n = { name: r[0], type: r[1], link: null };
    if (e[2])
      for (var s in r[2])
        n[s] = r[2][s];
    this.outputs || (this.outputs = []), this.outputs.push(n), this.onOutputAdded && this.onOutputAdded(n), LiteGraph.auto_load_slot_types && LiteGraph.registerNodeAndSlotType(this, r[1], !0);
  }
  this.setSize(this.computeSize()), this.setDirtyCanvas(!0, !0);
};
LGraphNode.prototype.removeOutput = function(e) {
  this.disconnectOutput(e), this.outputs.splice(e, 1);
  for (var t = e; t < this.outputs.length; ++t)
    if (!(!this.outputs[t] || !this.outputs[t].links))
      for (var r = this.outputs[t].links, n = 0; n < r.length; ++n) {
        var s = this.graph.links[r[n]];
        s && (s.origin_slot -= 1);
      }
  this.setSize(this.computeSize()), this.onOutputRemoved && this.onOutputRemoved(e), this.setDirtyCanvas(!0, !0);
};
LGraphNode.prototype.addInput = function(e, t, r) {
  t = t || 0;
  var n = { name: e, type: t, link: null };
  if (r)
    for (var s in r)
      n[s] = r[s];
  return this.inputs || (this.inputs = []), this.inputs.push(n), this.setSize(this.computeSize()), this.onInputAdded && this.onInputAdded(n), LiteGraph.registerNodeAndSlotType(this, t), this.setDirtyCanvas(!0, !0), n;
};
LGraphNode.prototype.addInputs = function(e) {
  for (var t = 0; t < e.length; ++t) {
    var r = e[t], n = { name: r[0], type: r[1], link: null };
    if (e[2])
      for (var s in r[2])
        n[s] = r[2][s];
    this.inputs || (this.inputs = []), this.inputs.push(n), this.onInputAdded && this.onInputAdded(n), LiteGraph.registerNodeAndSlotType(this, r[1]);
  }
  this.setSize(this.computeSize()), this.setDirtyCanvas(!0, !0);
};
LGraphNode.prototype.removeInput = function(e) {
  this.disconnectInput(e);
  for (var t = this.inputs.splice(e, 1), r = e; r < this.inputs.length; ++r)
    if (this.inputs[r]) {
      var n = this.graph.links[this.inputs[r].link];
      n && (n.target_slot -= 1);
    }
  this.setSize(this.computeSize()), this.onInputRemoved && this.onInputRemoved(e, t[0]), this.setDirtyCanvas(!0, !0);
};
LGraphNode.prototype.addConnection = function(e, t, r, n) {
  var s = {
    name: e,
    type: t,
    pos: r,
    direction: n,
    links: null
  };
  return this.connections.push(s), s;
};
LGraphNode.prototype.computeSize = function(e) {
  if (this.constructor.size)
    return this.constructor.size.concat();
  var t = Math.max(
    this.inputs ? this.inputs.length : 1,
    this.outputs ? this.outputs.length : 1
  ), r = e || new Float32Array([0, 0]);
  t = Math.max(t, 1);
  var n = LiteGraph.NODE_TEXT_SIZE, s = d(this.title), l = 0, a = 0;
  if (this.inputs)
    for (var o = 0, h = this.inputs.length; o < h; ++o) {
      var u = this.inputs[o], p = u.label || u.name || "", f = d(p);
      l < f && (l = f);
    }
  if (this.outputs)
    for (var o = 0, h = this.outputs.length; o < h; ++o) {
      var c = this.outputs[o], p = c.label || c.name || "", f = d(p);
      a < f && (a = f);
    }
  r[0] = Math.max(l + a + 10, s), r[0] = Math.max(r[0], LiteGraph.NODE_WIDTH), this.widgets && this.widgets.length && (r[0] = Math.max(r[0], LiteGraph.NODE_WIDTH * 1.5)), r[1] = (this.constructor.slot_start_y || 0) + t * LiteGraph.NODE_SLOT_HEIGHT;
  var g = 0;
  if (this.widgets && this.widgets.length) {
    for (var o = 0, h = this.widgets.length; o < h; ++o)
      this.widgets[o].computeSize ? g += this.widgets[o].computeSize(r[0])[1] + 4 : g += LiteGraph.NODE_WIDGET_HEIGHT + 4;
    g += 8;
  }
  this.widgets_up ? r[1] = Math.max(r[1], g) : this.widgets_start_y != null ? r[1] = Math.max(r[1], g + this.widgets_start_y) : r[1] += g;
  function d(G) {
    return G ? n * G.length * 0.6 : 0;
  }
  return this.constructor.min_height && r[1] < this.constructor.min_height && (r[1] = this.constructor.min_height), r[1] += 6, r;
};
LGraphNode.prototype.getPropertyInfo = function(e) {
  var t = null;
  if (this.properties_info) {
    for (var r = 0; r < this.properties_info.length; ++r)
      if (this.properties_info[r].name == e) {
        t = this.properties_info[r];
        break;
      }
  }
  return this.constructor["@" + e] && (t = this.constructor["@" + e]), this.constructor.widgets_info && this.constructor.widgets_info[e] && (t = this.constructor.widgets_info[e]), !t && this.onGetPropertyInfo && (t = this.onGetPropertyInfo(e)), t || (t = {}), t.type || (t.type = typeof this.properties[e]), t.widget == "combo" && (t.type = "enum"), t;
};
LGraphNode.prototype.addWidget = function(e, t, r, n, s) {
  this.widgets || (this.widgets = []), !s && n && n.constructor === Object && (s = n, n = null), s && s.constructor === String && (s = { property: s }), n && n.constructor === String && (s || (s = {}), s.property = n, n = null), n && n.constructor !== Function && (console.warn("addWidget: callback must be a function"), n = null);
  var l = {
    type: e.toLowerCase(),
    name: t,
    value: r,
    callback: n,
    options: s || {}
  };
  if (l.options.y !== void 0 && (l.y = l.options.y), !n && !l.options.callback && !l.options.property && console.warn("LiteGraph addWidget(...) without a callback or property assigned"), e == "combo" && !l.options.values)
    throw "LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }";
  return this.widgets.push(l), this.setSize(this.computeSize()), l;
};
LGraphNode.prototype.addCustomWidget = function(e) {
  return this.widgets || (this.widgets = []), this.widgets.push(e), e;
};
LGraphNode.prototype.getBounding = function(e, t) {
  e = e || new Float32Array(4);
  const r = this.pos, n = this.flags.collapsed, s = this.size;
  let l = 0, a = 1, o = 0, h = 0;
  return t && (l = 4, a = 6 + l, o = 4, h = 5 + o), e[0] = r[0] - l, e[1] = r[1] - LiteGraph.NODE_TITLE_HEIGHT - o, e[2] = n ? (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) + a : s[0] + a, e[3] = n ? LiteGraph.NODE_TITLE_HEIGHT + h : s[1] + LiteGraph.NODE_TITLE_HEIGHT + h, this.onBounding && this.onBounding(e), e;
};
LGraphNode.prototype.isPointInside = function(e, t, r, n) {
  r = r || 0;
  var s = this.graph && this.graph.isLive() ? 0 : LiteGraph.NODE_TITLE_HEIGHT;
  if (n && (s = 0), this.flags && this.flags.collapsed) {
    if (isInsideRectangle(
      e,
      t,
      this.pos[0] - r,
      this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT - r,
      (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) + 2 * r,
      LiteGraph.NODE_TITLE_HEIGHT + 2 * r
    ))
      return !0;
  } else if (this.pos[0] - 4 - r < e && this.pos[0] + this.size[0] + 4 + r > e && this.pos[1] - s - r < t && this.pos[1] + this.size[1] + r > t)
    return !0;
  return !1;
};
LGraphNode.prototype.getSlotInPosition = function(e, t) {
  var r = new Float32Array(2);
  if (this.inputs)
    for (var n = 0, s = this.inputs.length; n < s; ++n) {
      var l = this.inputs[n];
      if (this.getConnectionPos(!0, n, r), isInsideRectangle(
        e,
        t,
        r[0] - 10,
        r[1] - 5,
        20,
        10
      ))
        return { input: l, slot: n, link_pos: r };
    }
  if (this.outputs)
    for (var n = 0, s = this.outputs.length; n < s; ++n) {
      var a = this.outputs[n];
      if (this.getConnectionPos(!1, n, r), isInsideRectangle(
        e,
        t,
        r[0] - 10,
        r[1] - 5,
        20,
        10
      ))
        return { output: a, slot: n, link_pos: r };
    }
  return null;
};
LGraphNode.prototype.findInputSlot = function(e, t) {
  if (!this.inputs)
    return -1;
  for (var r = 0, n = this.inputs.length; r < n; ++r)
    if (e == this.inputs[r].name)
      return t ? this.inputs[r] : r;
  return -1;
};
LGraphNode.prototype.findOutputSlot = function(e, t) {
  if (t = t || !1, !this.outputs)
    return -1;
  for (var r = 0, n = this.outputs.length; r < n; ++r)
    if (e == this.outputs[r].name)
      return t ? this.outputs[r] : r;
  return -1;
};
LGraphNode.prototype.findInputSlotFree = function(t) {
  var t = t || {}, r = {
    returnObj: !1,
    typesNotAccepted: []
  }, n = Object.assign(r, t);
  if (!this.inputs)
    return -1;
  for (var s = 0, l = this.inputs.length; s < l; ++s)
    if (!(this.inputs[s].link && this.inputs[s].link != null) && !(n.typesNotAccepted && n.typesNotAccepted.includes && n.typesNotAccepted.includes(this.inputs[s].type)))
      return n.returnObj ? this.inputs[s] : s;
  return -1;
};
LGraphNode.prototype.findOutputSlotFree = function(t) {
  var t = t || {}, r = {
    returnObj: !1,
    typesNotAccepted: []
  }, n = Object.assign(r, t);
  if (!this.outputs)
    return -1;
  for (var s = 0, l = this.outputs.length; s < l; ++s)
    if (!(this.outputs[s].links && this.outputs[s].links != null) && !(n.typesNotAccepted && n.typesNotAccepted.includes && n.typesNotAccepted.includes(this.outputs[s].type)))
      return n.returnObj ? this.outputs[s] : s;
  return -1;
};
LGraphNode.prototype.findInputSlotByType = function(e, t, r, n) {
  return this.findSlotByType(!0, e, t, r, n);
};
LGraphNode.prototype.findOutputSlotByType = function(e, t, r, n) {
  return this.findSlotByType(!1, e, t, r, n);
};
LGraphNode.prototype.findSlotByType = function(e, t, r, n, s) {
  e = e || !1, r = r || !1, n = n || !1, s = s || !1;
  var l = e ? this.inputs : this.outputs;
  if (!l)
    return -1;
  (t == "" || t == "*") && (t = 0);
  for (var a = 0, o = l.length; a < o; ++a) {
    var h = (t + "").toLowerCase().split(","), u = l[a].type == "0" || l[a].type == "*" ? "0" : l[a].type;
    u = (u + "").toLowerCase().split(",");
    for (var p = 0; p < h.length; p++)
      for (var f = 0; f < u.length; f++)
        if (h[p] == "_event_" && (h[p] = LiteGraph.EVENT), u[p] == "_event_" && (u[p] = LiteGraph.EVENT), h[p] == "*" && (h[p] = 0), u[p] == "*" && (u[p] = 0), h[p] == u[f]) {
          if (n && l[a].links && l[a].links !== null) continue;
          return r ? l[a] : a;
        }
  }
  if (n && !s)
    for (var a = 0, o = l.length; a < o; ++a) {
      var h = (t + "").toLowerCase().split(","), u = l[a].type == "0" || l[a].type == "*" ? "0" : l[a].type;
      u = (u + "").toLowerCase().split(",");
      for (var p = 0; p < h.length; p++)
        for (var f = 0; f < u.length; f++)
          if (h[p] == "*" && (h[p] = 0), u[p] == "*" && (u[p] = 0), h[p] == u[f])
            return r ? l[a] : a;
    }
  return -1;
};
LGraphNode.prototype.connectByType = function(e, t, r, s) {
  var s = s || {}, l = {
    createEventInCase: !0,
    firstFreeIfOutputGeneralInCase: !0,
    generalTypeInCase: !0
  }, a = Object.assign(l, s);
  t && t.constructor === Number && (t = this.graph.getNodeById(t));
  var o = t.findInputSlotByType(r, !1, !0);
  if (o >= 0 && o !== null)
    return this.connect(e, t, o);
  if (a.createEventInCase && r == LiteGraph.EVENT)
    return this.connect(e, t, -1);
  if (a.generalTypeInCase) {
    var o = t.findInputSlotByType(0, !1, !0, !0);
    if (o >= 0)
      return this.connect(e, t, o);
  }
  if (a.firstFreeIfOutputGeneralInCase && (r == 0 || r == "*" || r == "")) {
    var o = t.findInputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
    if (o >= 0)
      return this.connect(e, t, o);
  }
  return console.debug("no way to connect type: ", r, " to targetNODE ", t), null;
};
LGraphNode.prototype.connectByTypeOutput = function(e, t, r, s) {
  var s = s || {}, l = {
    createEventInCase: !0,
    firstFreeIfInputGeneralInCase: !0,
    generalTypeInCase: !0
  }, a = Object.assign(l, s);
  t && t.constructor === Number && (t = this.graph.getNodeById(t));
  var o = t.findOutputSlotByType(r, !1, !0);
  if (o >= 0 && o !== null)
    return t.connect(o, this, e);
  if (a.generalTypeInCase) {
    var o = t.findOutputSlotByType(0, !1, !0, !0);
    if (o >= 0)
      return t.connect(o, this, e);
  }
  if (a.createEventInCase && r == LiteGraph.EVENT && LiteGraph.do_add_triggers_slots) {
    var o = t.addOnExecutedOutput();
    return t.connect(o, this, e);
  }
  if (a.firstFreeIfInputGeneralInCase && (r == 0 || r == "*" || r == "")) {
    var o = t.findOutputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] });
    if (o >= 0)
      return t.connect(o, this, e);
  }
  return console.debug("no way to connect byOUT type: ", r, " to sourceNODE ", t), null;
};
LGraphNode.prototype.connect = function(e, t, r) {
  if (r = r || 0, !this.graph)
    return console.log(
      "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
    ), null;
  if (e.constructor === String) {
    if (e = this.findOutputSlot(e), e == -1)
      return LiteGraph.debug && console.log("Connect: Error, no slot of name " + e), null;
  } else if (!this.outputs || e >= this.outputs.length)
    return LiteGraph.debug && console.log("Connect: Error, slot number not found"), null;
  if (t && t.constructor === Number && (t = this.graph.getNodeById(t)), !t)
    throw "target node is null";
  if (t == this)
    return null;
  if (r.constructor === String) {
    if (r = t.findInputSlot(r), r == -1)
      return LiteGraph.debug && console.log(
        "Connect: Error, no slot of name " + r
      ), null;
  } else if (r === LiteGraph.EVENT)
    if (LiteGraph.do_add_triggers_slots)
      t.changeMode(LiteGraph.ON_TRIGGER), r = t.findInputSlot("onTrigger");
    else
      return null;
  else if (!t.inputs || r >= t.inputs.length)
    return LiteGraph.debug && console.log("Connect: Error, slot number not found"), null;
  var n = !1, s = t.inputs[r], l = null, a = this.outputs[e];
  if (!this.outputs[e])
    return null;
  if (t.onBeforeConnectInput && (r = t.onBeforeConnectInput(r)), r === !1 || r === null || !LiteGraph.isValidConnection(a.type, s.type))
    return this.setDirtyCanvas(!1, !0), n && this.graph.connectionChange(this, l), null;
  if (t.onConnectInput && t.onConnectInput(r, a.type, a, this, e) === !1 || this.onConnectOutput && this.onConnectOutput(e, s.type, s, t, r) === !1)
    return null;
  if (t.inputs[r] && t.inputs[r].link != null && (this.graph.beforeChange(), t.disconnectInput(r, { doProcessChange: !1 }), n = !0), a.links !== null && a.links.length)
    switch (a.type) {
      case LiteGraph.EVENT:
        LiteGraph.allow_multi_output_for_events || (this.graph.beforeChange(), this.disconnectOutput(e, !1, { doProcessChange: !1 }), n = !0);
        break;
    }
  var o;
  return LiteGraph.use_uuids ? o = LiteGraph.uuidv4() : o = ++this.graph.last_link_id, l = new LLink(
    o,
    s.type || a.type,
    this.id,
    e,
    t.id,
    r
  ), this.graph.links[l.id] = l, a.links == null && (a.links = []), a.links.push(l.id), t.inputs[r].link = l.id, this.graph && this.graph._version++, this.onConnectionsChange && this.onConnectionsChange(
    LiteGraph.OUTPUT,
    e,
    !0,
    l,
    a
  ), t.onConnectionsChange && t.onConnectionsChange(
    LiteGraph.INPUT,
    r,
    !0,
    l,
    s
  ), this.graph && this.graph.onNodeConnectionChange && (this.graph.onNodeConnectionChange(
    LiteGraph.INPUT,
    t,
    r,
    this,
    e
  ), this.graph.onNodeConnectionChange(
    LiteGraph.OUTPUT,
    this,
    e,
    t,
    r
  )), this.setDirtyCanvas(!1, !0), this.graph.afterChange(), this.graph.connectionChange(this, l), l;
};
LGraphNode.prototype.disconnectOutput = function(e, t) {
  if (e.constructor === String) {
    if (e = this.findOutputSlot(e), e == -1)
      return LiteGraph.debug && console.log("Connect: Error, no slot of name " + e), !1;
  } else if (!this.outputs || e >= this.outputs.length)
    return LiteGraph.debug && console.log("Connect: Error, slot number not found"), !1;
  var r = this.outputs[e];
  if (!r || !r.links || r.links.length == 0)
    return !1;
  if (t) {
    if (t.constructor === Number && (t = this.graph.getNodeById(t)), !t)
      throw "Target Node not found";
    for (var n = 0, s = r.links.length; n < s; n++) {
      var l = r.links[n], a = this.graph.links[l];
      if (a.target_id == t.id) {
        r.links.splice(n, 1);
        var o = t.inputs[a.target_slot];
        o.link = null, delete this.graph.links[l], this.graph && this.graph._version++, t.onConnectionsChange && t.onConnectionsChange(
          LiteGraph.INPUT,
          a.target_slot,
          !1,
          a,
          o
        ), this.onConnectionsChange && this.onConnectionsChange(
          LiteGraph.OUTPUT,
          e,
          !1,
          a,
          r
        ), this.graph && this.graph.onNodeConnectionChange && this.graph.onNodeConnectionChange(
          LiteGraph.OUTPUT,
          this,
          e
        ), this.graph && this.graph.onNodeConnectionChange && (this.graph.onNodeConnectionChange(
          LiteGraph.OUTPUT,
          this,
          e
        ), this.graph.onNodeConnectionChange(
          LiteGraph.INPUT,
          t,
          a.target_slot
        ));
        break;
      }
    }
  } else {
    for (var n = 0, s = r.links.length; n < s; n++) {
      var l = r.links[n], a = this.graph.links[l];
      if (a) {
        var t = this.graph.getNodeById(a.target_id), o = null;
        this.graph && this.graph._version++, t && (o = t.inputs[a.target_slot], o.link = null, t.onConnectionsChange && t.onConnectionsChange(
          LiteGraph.INPUT,
          a.target_slot,
          !1,
          a,
          o
        ), this.graph && this.graph.onNodeConnectionChange && this.graph.onNodeConnectionChange(
          LiteGraph.INPUT,
          t,
          a.target_slot
        )), delete this.graph.links[l], this.onConnectionsChange && this.onConnectionsChange(
          LiteGraph.OUTPUT,
          e,
          !1,
          a,
          r
        ), this.graph && this.graph.onNodeConnectionChange && (this.graph.onNodeConnectionChange(
          LiteGraph.OUTPUT,
          this,
          e
        ), this.graph.onNodeConnectionChange(
          LiteGraph.INPUT,
          t,
          a.target_slot
        ));
      }
    }
    r.links = null;
  }
  return this.setDirtyCanvas(!1, !0), this.graph.connectionChange(this), !0;
};
LGraphNode.prototype.disconnectInput = function(e) {
  if (e.constructor === String) {
    if (e = this.findInputSlot(e), e == -1)
      return LiteGraph.debug && console.log("Connect: Error, no slot of name " + e), !1;
  } else if (!this.inputs || e >= this.inputs.length)
    return LiteGraph.debug && console.log("Connect: Error, slot number not found"), !1;
  var t = this.inputs[e];
  if (!t)
    return !1;
  var r = this.inputs[e].link;
  if (r != null) {
    this.inputs[e].link = null;
    var n = this.graph.links[r];
    if (n) {
      var s = this.graph.getNodeById(n.origin_id);
      if (!s)
        return !1;
      var l = s.outputs[n.origin_slot];
      if (!l || !l.links || l.links.length == 0)
        return !1;
      for (var a = 0, o = l.links.length; a < o; a++)
        if (l.links[a] == r) {
          l.links.splice(a, 1);
          break;
        }
      delete this.graph.links[r], this.graph && this.graph._version++, this.onConnectionsChange && this.onConnectionsChange(
        LiteGraph.INPUT,
        e,
        !1,
        n,
        t
      ), s.onConnectionsChange && s.onConnectionsChange(
        LiteGraph.OUTPUT,
        a,
        !1,
        n,
        l
      ), this.graph && this.graph.onNodeConnectionChange && (this.graph.onNodeConnectionChange(
        LiteGraph.OUTPUT,
        s,
        a
      ), this.graph.onNodeConnectionChange(LiteGraph.INPUT, this, e));
    }
  }
  return this.setDirtyCanvas(!1, !0), this.graph && this.graph.connectionChange(this), !0;
};
LGraphNode.prototype.getConnectionPos = function(e, t, r) {
  r = r || new Float32Array(2);
  var n = 0;
  e && this.inputs && (n = this.inputs.length), !e && this.outputs && (n = this.outputs.length);
  var s = LiteGraph.NODE_SLOT_HEIGHT * 0.5;
  if (this.flags.collapsed) {
    var l = this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
    return this.horizontal ? (r[0] = this.pos[0] + l * 0.5, e ? r[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT : r[1] = this.pos[1]) : (e ? r[0] = this.pos[0] : r[0] = this.pos[0] + l, r[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5), r;
  }
  return e && t == -1 ? (r[0] = this.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * 0.5, r[1] = this.pos[1] + LiteGraph.NODE_TITLE_HEIGHT * 0.5, r) : e && n > t && this.inputs[t].pos ? (r[0] = this.pos[0] + this.inputs[t].pos[0], r[1] = this.pos[1] + this.inputs[t].pos[1], r) : !e && n > t && this.outputs[t].pos ? (r[0] = this.pos[0] + this.outputs[t].pos[0], r[1] = this.pos[1] + this.outputs[t].pos[1], r) : this.horizontal ? (r[0] = this.pos[0] + (t + 0.5) * (this.size[0] / n), e ? r[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT : r[1] = this.pos[1] + this.size[1], r) : (e ? r[0] = this.pos[0] + s : r[0] = this.pos[0] + this.size[0] + 1 - s, r[1] = this.pos[1] + (t + 0.7) * LiteGraph.NODE_SLOT_HEIGHT + (this.constructor.slot_start_y || 0), r);
};
LGraphNode.prototype.alignToGrid = function() {
  this.pos[0] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[0] / LiteGraph.CANVAS_GRID_SIZE), this.pos[1] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[1] / LiteGraph.CANVAS_GRID_SIZE);
};
LGraphNode.prototype.trace = function(e) {
  this.console || (this.console = []), this.console.push(e), this.console.length > LGraphNode.MAX_CONSOLE && this.console.shift(), this.graph.onNodeTrace && this.graph.onNodeTrace(this, e);
};
LGraphNode.prototype.setDirtyCanvas = function(e, t) {
  this.graph && this.graph.sendActionToCanvas("setDirty", [
    e,
    t
  ]);
};
LGraphNode.prototype.loadImage = function(e) {
  var t = new Image();
  t.src = LiteGraph.node_images_path + e, t.ready = !1;
  var r = this;
  return t.onload = function() {
    this.ready = !0, r.setDirtyCanvas(!0);
  }, t;
};
LGraphNode.prototype.captureInput = function(e) {
  if (!(!this.graph || !this.graph.list_of_graphcanvas))
    for (var t = this.graph.list_of_graphcanvas, r = 0; r < t.length; ++r) {
      var n = t[r];
      !e && n.node_capturing_input != this || (n.node_capturing_input = e ? this : null);
    }
};
LGraphNode.prototype.collapse = function(e) {
  this.graph._version++, !(this.constructor.collapsable === !1 && !e) && (this.flags.collapsed ? this.flags.collapsed = !1 : this.flags.collapsed = !0, this.setDirtyCanvas(!0, !0));
};
LGraphNode.prototype.pin = function(e) {
  this.graph._version++, e === void 0 ? this.flags.pinned = !this.flags.pinned : this.flags.pinned = e;
};
LGraphNode.prototype.localToScreen = function(e, t, r) {
  return [
    (e + this.pos[0]) * r.scale + r.offset[0],
    (t + this.pos[1]) * r.scale + r.offset[1]
  ];
};
function LGraphGroup(e) {
  new.target || console.trace("WARNING: Use new to construct a new LGraphGroup rather than calling it.  The current implementation is deprecated and will break in the next update."), this._ctor(e);
}
global.LGraphGroup = LiteGraph.LGraphGroup = LGraphGroup;
LGraphGroup.prototype._ctor = function(e) {
  this.title = e || "Group", this.font_size = 24, this.color = LGraphCanvas.node_colors.pale_blue ? LGraphCanvas.node_colors.pale_blue.groupcolor : "#AAA", this._bounding = new Float32Array([10, 10, 140, 80]), this._pos = this._bounding.subarray(0, 2), this._size = this._bounding.subarray(2, 4), this._nodes = [], this.graph = null, Object.defineProperty(this, "pos", {
    set: function(t) {
      !t || t.length < 2 || (this._pos[0] = t[0], this._pos[1] = t[1]);
    },
    get: function() {
      return this._pos;
    },
    enumerable: !0
  }), Object.defineProperty(this, "size", {
    set: function(t) {
      !t || t.length < 2 || (this._size[0] = Math.max(140, t[0]), this._size[1] = Math.max(80, t[1]));
    },
    get: function() {
      return this._size;
    },
    enumerable: !0
  });
};
LGraphGroup.prototype.configure = function(e) {
  this.title = e.title, this._bounding.set(e.bounding), this.color = e.color, e.font_size && (this.font_size = e.font_size);
};
LGraphGroup.prototype.serialize = function() {
  var e = this._bounding;
  return {
    title: this.title,
    bounding: [
      Math.round(e[0]),
      Math.round(e[1]),
      Math.round(e[2]),
      Math.round(e[3])
    ],
    color: this.color,
    font_size: this.font_size
  };
};
LGraphGroup.prototype.move = function(e, t, r) {
  if (this._pos[0] += e, this._pos[1] += t, !r)
    for (var n = 0; n < this._nodes.length; ++n) {
      var s = this._nodes[n];
      s.pos[0] += e, s.pos[1] += t;
    }
};
LGraphGroup.prototype.recomputeInsideNodes = function() {
  this._nodes.length = 0;
  for (var e = this.graph._nodes, t = new Float32Array(4), r = 0; r < e.length; ++r) {
    var n = e[r];
    n.getBounding(t), overlapBounding(this._bounding, t) && this._nodes.push(n);
  }
};
LGraphGroup.prototype.isPointInside = LGraphNode.prototype.isPointInside;
LGraphGroup.prototype.setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;
function DragAndScale(e, t) {
  new.target || console.trace("WARNING: Use new to construct a new DragAndScale rather than calling it.  The current implementation is deprecated and will break in the next update."), this.offset = new Float32Array([0, 0]), this.scale = 1, this.max_scale = 10, this.min_scale = 0.1, this.onredraw = null, this.enabled = !0, this.last_mouse = [0, 0], this.element = null, this.visible_area = new Float32Array(4), e && (this.element = e, t || this.bindEvents(e));
}
LiteGraph.DragAndScale = DragAndScale;
DragAndScale.prototype.bindEvents = function(e) {
  this.last_mouse = new Float32Array(2), this._binded_mouse_callback = this.onMouse.bind(this), LiteGraph.pointerListenerAdd(e, "down", this._binded_mouse_callback), LiteGraph.pointerListenerAdd(e, "move", this._binded_mouse_callback), LiteGraph.pointerListenerAdd(e, "up", this._binded_mouse_callback), e.addEventListener(
    "mousewheel",
    this._binded_mouse_callback,
    !1
  ), e.addEventListener("wheel", this._binded_mouse_callback, !1);
};
DragAndScale.prototype.computeVisibleArea = function(e) {
  if (!this.element) {
    this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
    return;
  }
  var t = this.element.width, r = this.element.height, n = -this.offset[0], s = -this.offset[1];
  e && (n += e[0] / this.scale, s += e[1] / this.scale, t = e[2], r = e[3]);
  var l = n + t / this.scale, a = s + r / this.scale;
  this.visible_area[0] = n, this.visible_area[1] = s, this.visible_area[2] = l - n, this.visible_area[3] = a - s;
};
DragAndScale.prototype.onMouse = function(e) {
  if (this.enabled) {
    var t = this.element, r = t.getBoundingClientRect(), n = e.clientX - r.left, s = e.clientY - r.top;
    e.canvasx = n, e.canvasy = s, e.dragging = this.dragging;
    var l = !this.viewport || this.viewport && n >= this.viewport[0] && n < this.viewport[0] + this.viewport[2] && s >= this.viewport[1] && s < this.viewport[1] + this.viewport[3], a = !1;
    if (this.onmouse && (a = this.onmouse(e)), e.type == LiteGraph.pointerevents_method + "down" && l)
      this.dragging = !0, LiteGraph.pointerListenerRemove(t, "move", this._binded_mouse_callback), LiteGraph.pointerListenerAdd(document, "move", this._binded_mouse_callback), LiteGraph.pointerListenerAdd(document, "up", this._binded_mouse_callback);
    else if (e.type == LiteGraph.pointerevents_method + "move") {
      if (!a) {
        var o = n - this.last_mouse[0], h = s - this.last_mouse[1];
        this.dragging && this.mouseDrag(o, h);
      }
    } else e.type == LiteGraph.pointerevents_method + "up" ? (this.dragging = !1, LiteGraph.pointerListenerRemove(document, "move", this._binded_mouse_callback), LiteGraph.pointerListenerRemove(document, "up", this._binded_mouse_callback), LiteGraph.pointerListenerAdd(t, "move", this._binded_mouse_callback)) : l && (e.type == "mousewheel" || e.type == "wheel" || e.type == "DOMMouseScroll") && (e.eventType = "mousewheel", e.type == "wheel" ? e.wheel = -e.deltaY : e.wheel = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60, e.delta = e.wheelDelta ? e.wheelDelta / 40 : e.deltaY ? -e.deltaY / 3 : 0, this.changeDeltaScale(1 + e.delta * 0.05));
    if (this.last_mouse[0] = n, this.last_mouse[1] = s, l)
      return e.preventDefault(), e.stopPropagation(), !1;
  }
};
DragAndScale.prototype.toCanvasContext = function(e) {
  e.scale(this.scale, this.scale), e.translate(this.offset[0], this.offset[1]);
};
DragAndScale.prototype.convertOffsetToCanvas = function(e) {
  return [
    (e[0] + this.offset[0]) * this.scale,
    (e[1] + this.offset[1]) * this.scale
  ];
};
DragAndScale.prototype.convertCanvasToOffset = function(e, t) {
  return t = t || [0, 0], t[0] = e[0] / this.scale - this.offset[0], t[1] = e[1] / this.scale - this.offset[1], t;
};
DragAndScale.prototype.mouseDrag = function(e, t) {
  this.offset[0] += e / this.scale, this.offset[1] += t / this.scale, this.onredraw && this.onredraw(this);
};
DragAndScale.prototype.changeScale = function(e, t) {
  if (e < this.min_scale ? e = this.min_scale : e > this.max_scale && (e = this.max_scale), e != this.scale && this.element) {
    var r = this.element.getBoundingClientRect();
    if (r) {
      t = t || [
        r.width * 0.5,
        r.height * 0.5
      ];
      var n = this.convertCanvasToOffset(t);
      this.scale = e, Math.abs(this.scale - 1) < 0.01 && (this.scale = 1);
      var s = this.convertCanvasToOffset(t), l = [
        s[0] - n[0],
        s[1] - n[1]
      ];
      this.offset[0] += l[0], this.offset[1] += l[1], this.onredraw && this.onredraw(this);
    }
  }
};
DragAndScale.prototype.changeDeltaScale = function(e, t) {
  this.changeScale(this.scale * e, t);
};
DragAndScale.prototype.reset = function() {
  this.scale = 1, this.offset[0] = 0, this.offset[1] = 0;
};
function LGraphCanvas(e, t, r) {
  new.target || console.trace("WARNING: Use new to construct a new LGraphCanvas rather than calling it.  The current implementation is deprecated and will break in the next update."), this.options = r = r || {}, this.background_image = LGraphCanvas.DEFAULT_BACKGROUND_IMAGE, e && e.constructor === String && (e = document.querySelector(e)), this.ds = new DragAndScale(), this.zoom_modify_alpha = !0, this.title_text_font = "" + LiteGraph.NODE_TEXT_SIZE + "px Arial", this.inner_text_font = "normal " + LiteGraph.NODE_SUBTEXT_SIZE + "px Arial", this.node_title_color = LiteGraph.NODE_TITLE_COLOR, this.default_link_color = LiteGraph.LINK_COLOR, this.default_connection_color = {
    input_off: "#778",
    input_on: "#7F7",
    //"#BBD"
    output_off: "#778",
    output_on: "#7F7"
    //"#BBD"
  }, this.default_connection_color_byType = {
    /*number: "#7F7",
            string: "#77F",
            boolean: "#F77",*/
  }, this.default_connection_color_byTypeOff = {
    /*number: "#474",
            string: "#447",
            boolean: "#744",*/
  }, this.highquality_render = !0, this.use_gradients = !1, this.editor_alpha = 1, this.pause_rendering = !1, this.clear_background = !0, this.clear_background_color = "#222", this.read_only = !1, this.render_only_selected = !0, this.live_mode = !1, this.show_info = !0, this.allow_dragcanvas = !0, this.allow_dragnodes = !0, this.allow_interaction = !0, this.multi_select = !1, this.allow_searchbox = !0, this.allow_reconnect_links = !0, this.align_to_grid = !1, this.drag_mode = !1, this.dragging_rectangle = null, this.filter = null, this.set_canvas_dirty_on_mouse_event = !0, this.always_render_background = !1, this.render_shadows = !0, this.render_canvas_border = !0, this.render_connections_shadows = !1, this.render_connections_border = !0, this.render_curved_connections = !1, this.render_connection_arrows = !1, this.render_collapsed_slots = !0, this.render_execution_order = !1, this.render_title_colored = !0, this.render_link_tooltip = !0, this.links_render_mode = LiteGraph.SPLINE_LINK, this.mouse = [0, 0], this.graph_mouse = [0, 0], this.canvas_mouse = this.graph_mouse, this.onSearchBox = null, this.onSearchBoxSelection = null, this.onMouse = null, this.onDrawBackground = null, this.onDrawForeground = null, this.onDrawOverlay = null, this.onDrawLinkTooltip = null, this.onNodeMoved = null, this.onSelectionChange = null, this.onConnectingChange = null, this.onBeforeChange = null, this.onAfterChange = null, this.connections_width = 3, this.round_radius = 8, this.current_node = null, this.node_widget = null, this.over_link_center = null, this.last_mouse_position = [0, 0], this.visible_area = this.ds.visible_area, this.visible_links = [], this.viewport = r.viewport || null, t && t.attachCanvas(this), this.setCanvas(e, r.skip_events), this.clear(), r.skip_render || this.startRendering(), this.autoresize = r.autoresize;
}
global.LGraphCanvas = LiteGraph.LGraphCanvas = LGraphCanvas;
LGraphCanvas.DEFAULT_BACKGROUND_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=";
LGraphCanvas.link_type_colors = {
  "-1": LiteGraph.EVENT_LINK_COLOR,
  number: "#AAA",
  node: "#DCA"
};
LGraphCanvas.gradients = {};
LGraphCanvas.prototype.clear = function() {
  this.frame = 0, this.last_draw_time = 0, this.render_time = 0, this.fps = 0, this.dragging_rectangle = null, this.selected_nodes = {}, this.selected_group = null, this.visible_nodes = [], this.node_dragged = null, this.node_over = null, this.node_capturing_input = null, this.connecting_node = null, this.highlighted_links = {}, this.dragging_canvas = !1, this.dirty_canvas = !0, this.dirty_bgcanvas = !0, this.dirty_area = null, this.node_in_panel = null, this.node_widget = null, this.last_mouse = [0, 0], this.last_mouseclick = 0, this.pointer_is_down = !1, this.pointer_is_double = !1, this.visible_area.set([0, 0, 0, 0]), this.onClear && this.onClear();
};
LGraphCanvas.prototype.setGraph = function(e, t) {
  if (this.graph != e) {
    if (t || this.clear(), !e && this.graph) {
      this.graph.detachCanvas(this);
      return;
    }
    e.attachCanvas(this), this._graph_stack && (this._graph_stack = null), this.setDirty(!0, !0);
  }
};
LGraphCanvas.prototype.getTopGraph = function() {
  return this._graph_stack.length ? this._graph_stack[0] : this.graph;
};
LGraphCanvas.prototype.openSubgraph = function(e) {
  if (!e)
    throw "graph cannot be null";
  if (this.graph == e)
    throw "graph cannot be the same";
  this.clear(), this.graph && (this._graph_stack || (this._graph_stack = []), this._graph_stack.push(this.graph)), e.attachCanvas(this), this.checkPanels(), this.setDirty(!0, !0);
};
LGraphCanvas.prototype.closeSubgraph = function() {
  if (!(!this._graph_stack || this._graph_stack.length == 0)) {
    var e = this.graph._subgraph_node, t = this._graph_stack.pop();
    this.selected_nodes = {}, this.highlighted_links = {}, t.attachCanvas(this), this.setDirty(!0, !0), e && (this.centerOnNode(e), this.selectNodes([e])), this.ds.offset = [0, 0], this.ds.scale = 1;
  }
};
LGraphCanvas.prototype.getCurrentGraph = function() {
  return this.graph;
};
LGraphCanvas.prototype.setCanvas = function(e, t) {
  if (e && e.constructor === String && (e = document.getElementById(e), !e))
    throw "Error creating LiteGraph canvas: Canvas not found";
  if (e !== this.canvas && (!e && this.canvas && (t || this.unbindEvents()), this.canvas = e, this.ds.element = e, !!e)) {
    if (e.className += " lgraphcanvas", e.data = this, e.tabindex = "1", this.bgcanvas = null, this.bgcanvas || (this.bgcanvas = document.createElement("canvas"), this.bgcanvas.width = this.canvas.width, this.bgcanvas.height = this.canvas.height), e.getContext == null)
      throw e.localName != "canvas" ? "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " + e.localName : "This browser doesn't support Canvas";
    var r = this.ctx = e.getContext("2d");
    r == null && (e.webgl_enabled || console.warn(
      "This canvas seems to be WebGL, enabling WebGL renderer"
    ), this.enableWebGL()), t || this.bindEvents();
  }
};
LGraphCanvas.prototype._doNothing = function(t) {
  return t.preventDefault(), !1;
};
LGraphCanvas.prototype._doReturnTrue = function(t) {
  return t.preventDefault(), !0;
};
LGraphCanvas.prototype.bindEvents = function() {
  if (this._events_binded) {
    console.warn("LGraphCanvas: events already binded");
    return;
  }
  var e = this.canvas, t = this.getCanvasWindow(), r = t.document;
  this._mousedown_callback = this.processMouseDown.bind(this), this._mousewheel_callback = this.processMouseWheel.bind(this), this._mousemove_callback = this.processMouseMove.bind(this), this._mouseup_callback = this.processMouseUp.bind(this), LiteGraph.pointerListenerAdd(e, "down", this._mousedown_callback, !0), e.addEventListener("mousewheel", this._mousewheel_callback, !1), LiteGraph.pointerListenerAdd(e, "up", this._mouseup_callback, !0), LiteGraph.pointerListenerAdd(e, "move", this._mousemove_callback), e.addEventListener("contextmenu", this._doNothing), e.addEventListener(
    "DOMMouseScroll",
    this._mousewheel_callback,
    !1
  ), this._key_callback = this.processKey.bind(this), e.setAttribute("tabindex", 1), e.addEventListener("keydown", this._key_callback, !0), r.addEventListener("keyup", this._key_callback, !0), this._ondrop_callback = this.processDrop.bind(this), e.addEventListener("dragover", this._doNothing, !1), e.addEventListener("dragend", this._doNothing, !1), e.addEventListener("drop", this._ondrop_callback, !1), e.addEventListener("dragenter", this._doReturnTrue, !1), this._events_binded = !0;
};
LGraphCanvas.prototype.unbindEvents = function() {
  if (!this._events_binded) {
    console.warn("LGraphCanvas: no events binded");
    return;
  }
  var e = this.getCanvasWindow(), t = e.document;
  LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousedown_callback), LiteGraph.pointerListenerRemove(this.canvas, "up", this._mousedown_callback), LiteGraph.pointerListenerRemove(this.canvas, "down", this._mousedown_callback), this.canvas.removeEventListener(
    "mousewheel",
    this._mousewheel_callback
  ), this.canvas.removeEventListener(
    "DOMMouseScroll",
    this._mousewheel_callback
  ), this.canvas.removeEventListener("keydown", this._key_callback), t.removeEventListener("keyup", this._key_callback), this.canvas.removeEventListener("contextmenu", this._doNothing), this.canvas.removeEventListener("drop", this._ondrop_callback), this.canvas.removeEventListener("dragenter", this._doReturnTrue), this._mousedown_callback = null, this._mousewheel_callback = null, this._key_callback = null, this._ondrop_callback = null, this._events_binded = !1;
};
LGraphCanvas.getFileExtension = function(e) {
  var t = e.indexOf("?");
  t != -1 && (e = e.substr(0, t));
  var r = e.lastIndexOf(".");
  return r == -1 ? "" : e.substr(r + 1).toLowerCase();
};
LGraphCanvas.prototype.enableWebGL = function() {
  if (typeof GL > "u")
    throw "litegl.js must be included to use a WebGL canvas";
  if (typeof enableWebGLCanvas > "u")
    throw "webglCanvas.js must be included to use this feature";
  this.gl = this.ctx = enableWebGLCanvas(this.canvas), this.ctx.webgl = !0, this.bgcanvas = this.canvas, this.bgctx = this.gl, this.canvas.webgl_enabled = !0;
};
LGraphCanvas.prototype.setDirty = function(e, t) {
  e && (this.dirty_canvas = !0), t && (this.dirty_bgcanvas = !0);
};
LGraphCanvas.prototype.getCanvasWindow = function() {
  if (!this.canvas)
    return window;
  var e = this.canvas.ownerDocument;
  return e.defaultView || e.parentWindow;
};
LGraphCanvas.prototype.startRendering = function() {
  if (this.is_rendering)
    return;
  this.is_rendering = !0, e.call(this);
  function e() {
    this.pause_rendering || this.draw();
    var t = this.getCanvasWindow();
    this.is_rendering && t.requestAnimationFrame(e.bind(this));
  }
};
LGraphCanvas.prototype.stopRendering = function() {
  this.is_rendering = !1;
};
LGraphCanvas.prototype.blockClick = function() {
  this.block_click = !0, this.last_mouseclick = 0;
};
LGraphCanvas.prototype.processMouseDown = function(e) {
  if (this.set_canvas_dirty_on_mouse_event && (this.dirty_canvas = !0), !!this.graph) {
    this.adjustMouseEvent(e);
    var t = this.getCanvasWindow();
    t.document, LGraphCanvas.active_canvas = this;
    var r = this, n = e.clientX, s = e.clientY;
    this.ds.viewport = this.viewport;
    var l = !this.viewport || this.viewport && n >= this.viewport[0] && n < this.viewport[0] + this.viewport[2] && s >= this.viewport[1] && s < this.viewport[1] + this.viewport[3];
    if (this.options.skip_events || (LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousemove_callback), LiteGraph.pointerListenerAdd(t.document, "move", this._mousemove_callback, !0), LiteGraph.pointerListenerAdd(t.document, "up", this._mouseup_callback, !0)), !!l) {
      var a = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5), o = !1, h = LiteGraph.getTime(), u = e.isPrimary === void 0 || !e.isPrimary, p = h - this.last_mouseclick < 300;
      if (this.mouse[0] = e.clientX, this.mouse[1] = e.clientY, this.graph_mouse[0] = e.canvasX, this.graph_mouse[1] = e.canvasY, this.last_click_position = [this.mouse[0], this.mouse[1]], this.pointer_is_down && u ? this.pointer_is_double = !0 : this.pointer_is_double = !1, this.pointer_is_down = !0, this.canvas.focus(), LiteGraph.closeAllContextMenus(t), !(this.onMouse && this.onMouse(e) == !0)) {
        if (e.which == 1 && !this.pointer_is_double) {
          e.ctrlKey && (this.dragging_rectangle = new Float32Array(4), this.dragging_rectangle[0] = e.canvasX, this.dragging_rectangle[1] = e.canvasY, this.dragging_rectangle[2] = 1, this.dragging_rectangle[3] = 1, o = !0), LiteGraph.alt_drag_do_clone_nodes && e.altKey && a && this.allow_interaction && !o && !this.read_only && (cloned = a.clone(), cloned && (cloned.pos[0] += 5, cloned.pos[1] += 5, this.graph.add(cloned, !1, { doCalcSize: !1 }), a = cloned, o = !0, b || (this.allow_dragnodes && (this.graph.beforeChange(), this.node_dragged = a), this.selected_nodes[a.id] || this.processNodeSelected(a, e))));
          var f = !1;
          if (a && (this.allow_interaction || a.flags.allow_interaction) && !o && !this.read_only) {
            if (!this.live_mode && !a.flags.pinned && this.bringToFront(a), this.allow_interaction && !this.connecting_node && !a.flags.collapsed && !this.live_mode)
              if (!o && a.resizable !== !1 && isInsideRectangle(
                e.canvasX,
                e.canvasY,
                a.pos[0] + a.size[0] - 5,
                a.pos[1] + a.size[1] - 5,
                10,
                10
              ))
                this.graph.beforeChange(), this.resizing_node = a, this.canvas.style.cursor = "se-resize", o = !0;
              else {
                if (a.outputs)
                  for (var c = 0, g = a.outputs.length; c < g; ++c) {
                    var d = a.outputs[c], G = a.getConnectionPos(!1, c);
                    if (isInsideRectangle(
                      e.canvasX,
                      e.canvasY,
                      G[0] - 15,
                      G[1] - 10,
                      30,
                      20
                    )) {
                      this.connecting_node = a, this.connecting_output = d, this.connecting_output.slot_index = c, this.connecting_pos = a.getConnectionPos(!1, c), this.connecting_slot = c, LiteGraph.shift_click_do_break_link_from && e.shiftKey && a.disconnectOutput(c), p ? a.onOutputDblClick && a.onOutputDblClick(c, e) : a.onOutputClick && a.onOutputClick(c, e), o = !0;
                      break;
                    }
                  }
                if (a.inputs)
                  for (var c = 0, g = a.inputs.length; c < g; ++c) {
                    var L = a.inputs[c], G = a.getConnectionPos(!0, c);
                    if (isInsideRectangle(
                      e.canvasX,
                      e.canvasY,
                      G[0] - 15,
                      G[1] - 10,
                      30,
                      20
                    )) {
                      if (p ? a.onInputDblClick && a.onInputDblClick(c, e) : a.onInputClick && a.onInputClick(c, e), L.link !== null) {
                        var m = this.graph.links[L.link];
                        LiteGraph.click_do_break_link_to && (a.disconnectInput(c), this.dirty_bgcanvas = !0, o = !0), (this.allow_reconnect_links || //this.move_destination_link_without_shift ||
                        e.shiftKey) && (LiteGraph.click_do_break_link_to || a.disconnectInput(c), this.connecting_node = this.graph._nodes_by_id[m.origin_id], this.connecting_slot = m.origin_slot, this.connecting_output = this.connecting_node.outputs[this.connecting_slot], this.connecting_pos = this.connecting_node.getConnectionPos(!1, this.connecting_slot), this.dirty_bgcanvas = !0, o = !0);
                      }
                      o || (this.connecting_node = a, this.connecting_input = L, this.connecting_input.slot_index = c, this.connecting_pos = a.getConnectionPos(!0, c), this.connecting_slot = c, this.dirty_bgcanvas = !0, o = !0);
                    }
                  }
              }
            if (!o) {
              var b = !1;
              a && a.flags && a.flags.pinned && (b = !0);
              var _ = [e.canvasX - a.pos[0], e.canvasY - a.pos[1]], C = this.processNodeWidgets(a, this.graph_mouse, e);
              if (C && (b = !0, this.node_widget = [a, C]), this.allow_interaction && p && this.selected_nodes[a.id] && (a.onDblClick && a.onDblClick(e, _, this), this.processNodeDblClicked(a), b = !0), a.onMouseDown && a.onMouseDown(e, _, this))
                b = !0;
              else {
                if (a.subgraph && !a.skip_subgraph_button && !a.flags.collapsed && _[0] > a.size[0] - LiteGraph.NODE_TITLE_HEIGHT && _[1] < 0) {
                  var r = this;
                  setTimeout(function() {
                    r.openSubgraph(a.subgraph);
                  }, 10);
                }
                this.live_mode && (f = !0, b = !0);
              }
              b ? a.is_selected || this.processNodeSelected(a, e) : (this.allow_dragnodes && (this.graph.beforeChange(), this.node_dragged = a), this.processNodeSelected(a, e)), this.dirty_canvas = !0;
            }
          } else if (!o) {
            if (!this.read_only)
              for (var c = 0; c < this.visible_links.length; ++c) {
                var N = this.visible_links[c], I = N._pos;
                if (!(!I || e.canvasX < I[0] - 4 || e.canvasX > I[0] + 4 || e.canvasY < I[1] - 4 || e.canvasY > I[1] + 4)) {
                  this.showLinkMenu(N, e), this.over_link_center = null;
                  break;
                }
              }
            if (this.selected_group = this.graph.getGroupOnPos(e.canvasX, e.canvasY), this.selected_group_resizing = !1, this.selected_group && !this.read_only) {
              e.ctrlKey && (this.dragging_rectangle = null);
              var D = distance([e.canvasX, e.canvasY], [this.selected_group.pos[0] + this.selected_group.size[0], this.selected_group.pos[1] + this.selected_group.size[1]]);
              D * this.ds.scale < 10 ? this.selected_group_resizing = !0 : this.selected_group.recomputeInsideNodes();
            }
            p && !this.read_only && this.allow_searchbox && (this.showSearchBox(e), e.preventDefault(), e.stopPropagation()), f = !0;
          }
          !o && f && this.allow_dragcanvas && (this.dragging_canvas = !0);
        } else if (e.which == 2) {
          if (LiteGraph.middle_click_slot_add_default_node && a && this.allow_interaction && !o && !this.read_only && !this.connecting_node && !a.flags.collapsed && !this.live_mode) {
            var P = !1, A = !1, k = !1;
            if (a.outputs)
              for (var c = 0, g = a.outputs.length; c < g; ++c) {
                var d = a.outputs[c], G = a.getConnectionPos(!1, c);
                if (isInsideRectangle(e.canvasX, e.canvasY, G[0] - 15, G[1] - 10, 30, 20)) {
                  P = d, A = c, k = !0;
                  break;
                }
              }
            if (a.inputs)
              for (var c = 0, g = a.inputs.length; c < g; ++c) {
                var L = a.inputs[c], G = a.getConnectionPos(!0, c);
                if (isInsideRectangle(e.canvasX, e.canvasY, G[0] - 15, G[1] - 10, 30, 20)) {
                  P = L, A = c, k = !1;
                  break;
                }
              }
            if (P && A !== !1) {
              var E = 0.5 - (A + 1) / (k ? a.outputs.length : a.inputs.length), O = a.getBounding(), T = [
                k ? O[0] + O[2] : O[0],
                e.canvasY - 80
                // + node_bounding[0]/this.canvas.width*66 // vertical "derive"
              ];
              this.createDefaultNodeForSlot({
                nodeFrom: k ? a : null,
                slotFrom: k ? A : null,
                nodeTo: k ? null : a,
                slotTo: k ? null : A,
                position: T,
                nodeType: "AUTO",
                posAdd: [k ? 30 : -30, -E * 130],
                posSizeFix: [k ? 0 : -1, 0]
                //-alphaPosY*2*/
              }), o = !0;
            }
          }
          !o && this.allow_dragcanvas && (this.dragging_canvas = !0);
        } else (e.which == 3 || this.pointer_is_double) && this.allow_interaction && !o && !this.read_only && (a && (Object.keys(this.selected_nodes).length && (this.selected_nodes[a.id] || e.shiftKey || e.ctrlKey || e.metaKey) ? this.selected_nodes[a.id] || this.selectNodes([a], !0) : this.selectNodes([a])), this.processContextMenu(a, e));
        return this.last_mouse[0] = e.clientX, this.last_mouse[1] = e.clientY, this.last_mouseclick = LiteGraph.getTime(), this.last_mouse_dragging = !0, this.graph.change(), (!t.document.activeElement || t.document.activeElement.nodeName.toLowerCase() != "input" && t.document.activeElement.nodeName.toLowerCase() != "textarea") && e.preventDefault(), e.stopPropagation(), this.onMouseDown && this.onMouseDown(e), !1;
      }
    }
  }
};
LGraphCanvas.prototype.processMouseMove = function(e) {
  if (this.autoresize && this.resize(), this.set_canvas_dirty_on_mouse_event && (this.dirty_canvas = !0), !!this.graph) {
    LGraphCanvas.active_canvas = this, this.adjustMouseEvent(e);
    var t = [e.clientX, e.clientY];
    this.mouse[0] = t[0], this.mouse[1] = t[1];
    var r = [
      t[0] - this.last_mouse[0],
      t[1] - this.last_mouse[1]
    ];
    if (this.last_mouse = t, this.graph_mouse[0] = e.canvasX, this.graph_mouse[1] = e.canvasY, this.block_click)
      return e.preventDefault(), !1;
    e.dragging = this.last_mouse_dragging, this.node_widget && (this.processNodeWidgets(
      this.node_widget[0],
      this.graph_mouse,
      e,
      this.node_widget[1]
    ), this.dirty_canvas = !0);
    var n = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
    if (this.dragging_rectangle)
      this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0], this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1], this.dirty_canvas = !0;
    else if (this.selected_group && !this.read_only) {
      if (this.selected_group_resizing)
        this.selected_group.size = [
          e.canvasX - this.selected_group.pos[0],
          e.canvasY - this.selected_group.pos[1]
        ];
      else {
        var s = r[0] / this.ds.scale, l = r[1] / this.ds.scale;
        this.selected_group.move(s, l, e.ctrlKey), this.selected_group._nodes.length && (this.dirty_canvas = !0);
      }
      this.dirty_bgcanvas = !0;
    } else if (this.dragging_canvas)
      this.ds.offset[0] += r[0] / this.ds.scale, this.ds.offset[1] += r[1] / this.ds.scale, this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
    else if ((this.allow_interaction || n && n.flags.allow_interaction) && !this.read_only) {
      this.connecting_node && (this.dirty_canvas = !0);
      for (var a = 0, o = this.graph._nodes.length; a < o; ++a)
        this.graph._nodes[a].mouseOver && n != this.graph._nodes[a] && (this.graph._nodes[a].mouseOver = !1, this.node_over && this.node_over.onMouseLeave && this.node_over.onMouseLeave(e), this.node_over = null, this.dirty_canvas = !0);
      if (n) {
        if (n.redraw_on_mouse && (this.dirty_canvas = !0), n.mouseOver || (n.mouseOver = !0, this.node_over = n, this.dirty_canvas = !0, n.onMouseEnter && n.onMouseEnter(e)), n.onMouseMove && n.onMouseMove(e, [e.canvasX - n.pos[0], e.canvasY - n.pos[1]], this), this.connecting_node) {
          if (this.connecting_output) {
            var h = this._highlight_input || [0, 0];
            if (!this.isOverNodeBox(n, e.canvasX, e.canvasY)) {
              var u = this.isOverNodeInput(n, e.canvasX, e.canvasY, h);
              if (u != -1 && n.inputs[u]) {
                var p = n.inputs[u].type;
                LiteGraph.isValidConnection(this.connecting_output.type, p) && (this._highlight_input = h, this._highlight_input_slot = n.inputs[u]);
              } else
                this._highlight_input = null, this._highlight_input_slot = null;
            }
          } else if (this.connecting_input) {
            var h = this._highlight_output || [0, 0];
            if (!this.isOverNodeBox(n, e.canvasX, e.canvasY)) {
              var u = this.isOverNodeOutput(n, e.canvasX, e.canvasY, h);
              if (u != -1 && n.outputs[u]) {
                var p = n.outputs[u].type;
                LiteGraph.isValidConnection(this.connecting_input.type, p) && (this._highlight_output = h);
              } else
                this._highlight_output = null;
            }
          }
        }
        this.canvas && (isInsideRectangle(
          e.canvasX,
          e.canvasY,
          n.pos[0] + n.size[0] - 5,
          n.pos[1] + n.size[1] - 5,
          5,
          5
        ) ? this.canvas.style.cursor = "se-resize" : this.canvas.style.cursor = "crosshair");
      } else {
        for (var f = null, a = 0; a < this.visible_links.length; ++a) {
          var c = this.visible_links[a], g = c._pos;
          if (!(!g || e.canvasX < g[0] - 4 || e.canvasX > g[0] + 4 || e.canvasY < g[1] - 4 || e.canvasY > g[1] + 4)) {
            f = c;
            break;
          }
        }
        f != this.over_link_center && (this.over_link_center = f, this.dirty_canvas = !0), this.canvas && (this.canvas.style.cursor = "");
      }
      if (this.node_capturing_input && this.node_capturing_input != n && this.node_capturing_input.onMouseMove && this.node_capturing_input.onMouseMove(e, [e.canvasX - this.node_capturing_input.pos[0], e.canvasY - this.node_capturing_input.pos[1]], this), this.node_dragged && !this.live_mode) {
        for (var a in this.selected_nodes) {
          var d = this.selected_nodes[a];
          d.pos[0] += r[0] / this.ds.scale, d.pos[1] += r[1] / this.ds.scale, d.is_selected || this.processNodeSelected(d, e);
        }
        this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
      }
      if (this.resizing_node && !this.live_mode) {
        var G = [e.canvasX - this.resizing_node.pos[0], e.canvasY - this.resizing_node.pos[1]], L = this.resizing_node.computeSize();
        G[0] = Math.max(L[0], G[0]), G[1] = Math.max(L[1], G[1]), this.resizing_node.setSize(G), this.canvas.style.cursor = "se-resize", this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
      }
    }
    return e.preventDefault(), !1;
  }
};
LGraphCanvas.prototype.processMouseUp = function(e) {
  var t = e.isPrimary === void 0 || e.isPrimary;
  if (!t)
    return !1;
  if (this.set_canvas_dirty_on_mouse_event && (this.dirty_canvas = !0), !!this.graph) {
    var r = this.getCanvasWindow(), n = r.document;
    LGraphCanvas.active_canvas = this, this.options.skip_events || (LiteGraph.pointerListenerRemove(n, "move", this._mousemove_callback, !0), LiteGraph.pointerListenerAdd(this.canvas, "move", this._mousemove_callback, !0), LiteGraph.pointerListenerRemove(n, "up", this._mouseup_callback, !0)), this.adjustMouseEvent(e);
    var s = LiteGraph.getTime();
    if (e.click_time = s - this.last_mouseclick, this.last_mouse_dragging = !1, this.last_click_position = null, this.block_click && (this.block_click = !1), e.which == 1) {
      if (this.node_widget && this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e), this.node_widget = null, this.selected_group) {
        var l = this.selected_group.pos[0] - Math.round(this.selected_group.pos[0]), a = this.selected_group.pos[1] - Math.round(this.selected_group.pos[1]);
        this.selected_group.move(l, a, e.ctrlKey), this.selected_group.pos[0] = Math.round(
          this.selected_group.pos[0]
        ), this.selected_group.pos[1] = Math.round(
          this.selected_group.pos[1]
        ), this.selected_group._nodes.length && (this.dirty_canvas = !0), this.selected_group = null;
      }
      this.selected_group_resizing = !1;
      var o = this.graph.getNodeOnPos(
        e.canvasX,
        e.canvasY,
        this.visible_nodes
      );
      if (this.dragging_rectangle) {
        if (this.graph) {
          var h = this.graph._nodes, u = new Float32Array(4), p = Math.abs(this.dragging_rectangle[2]), f = Math.abs(this.dragging_rectangle[3]), c = this.dragging_rectangle[2] < 0 ? this.dragging_rectangle[0] - p : this.dragging_rectangle[0], g = this.dragging_rectangle[3] < 0 ? this.dragging_rectangle[1] - f : this.dragging_rectangle[1];
          if (this.dragging_rectangle[0] = c, this.dragging_rectangle[1] = g, this.dragging_rectangle[2] = p, this.dragging_rectangle[3] = f, !o || p > 10 && f > 10) {
            for (var d = [], G = 0; G < h.length; ++G) {
              var L = h[G];
              L.getBounding(u), overlapBounding(
                this.dragging_rectangle,
                u
              ) && d.push(L);
            }
            d.length && this.selectNodes(d, e.shiftKey);
          } else
            this.selectNodes([o], e.shiftKey || e.ctrlKey);
        }
        this.dragging_rectangle = null;
      } else if (this.connecting_node) {
        this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
        var m = this.connecting_output || this.connecting_input, b = m.type;
        if (o) {
          if (this.connecting_output) {
            var _ = this.isOverNodeInput(
              o,
              e.canvasX,
              e.canvasY
            );
            _ != -1 ? this.connecting_node.connect(this.connecting_slot, o, _) : this.connecting_node.connectByType(this.connecting_slot, o, b);
          } else if (this.connecting_input) {
            var _ = this.isOverNodeOutput(
              o,
              e.canvasX,
              e.canvasY
            );
            _ != -1 ? o.connect(_, this.connecting_node, this.connecting_slot) : this.connecting_node.connectByTypeOutput(this.connecting_slot, o, b);
          }
        } else
          LiteGraph.release_link_on_empty_shows_menu && (e.shiftKey && this.allow_searchbox ? this.connecting_output ? this.showSearchBox(e, { node_from: this.connecting_node, slot_from: this.connecting_output, type_filter_in: this.connecting_output.type }) : this.connecting_input && this.showSearchBox(e, { node_to: this.connecting_node, slot_from: this.connecting_input, type_filter_out: this.connecting_input.type }) : this.connecting_output ? this.showConnectionMenu({ nodeFrom: this.connecting_node, slotFrom: this.connecting_output, e }) : this.connecting_input && this.showConnectionMenu({ nodeTo: this.connecting_node, slotTo: this.connecting_input, e }));
        this.connecting_output = null, this.connecting_input = null, this.connecting_pos = null, this.connecting_node = null, this.connecting_slot = -1;
      } else if (this.resizing_node)
        this.dirty_canvas = !0, this.dirty_bgcanvas = !0, this.graph.afterChange(this.resizing_node), this.resizing_node = null;
      else if (this.node_dragged) {
        var o = this.node_dragged;
        o && e.click_time < 300 && isInsideRectangle(e.canvasX, e.canvasY, o.pos[0], o.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT) && o.collapse(), this.dirty_canvas = !0, this.dirty_bgcanvas = !0, this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]), this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]), (this.graph.config.align_to_grid || this.align_to_grid) && this.node_dragged.alignToGrid(), this.onNodeMoved && this.onNodeMoved(this.node_dragged), this.graph.afterChange(this.node_dragged), this.node_dragged = null;
      } else {
        var o = this.graph.getNodeOnPos(
          e.canvasX,
          e.canvasY,
          this.visible_nodes
        );
        !o && e.click_time < 300 && this.deselectAllNodes(), this.dirty_canvas = !0, this.dragging_canvas = !1, this.node_over && this.node_over.onMouseUp && this.node_over.onMouseUp(e, [e.canvasX - this.node_over.pos[0], e.canvasY - this.node_over.pos[1]], this), this.node_capturing_input && this.node_capturing_input.onMouseUp && this.node_capturing_input.onMouseUp(e, [
          e.canvasX - this.node_capturing_input.pos[0],
          e.canvasY - this.node_capturing_input.pos[1]
        ]);
      }
    } else e.which == 2 ? (this.dirty_canvas = !0, this.dragging_canvas = !1) : e.which == 3 && (this.dirty_canvas = !0, this.dragging_canvas = !1);
    return t && (this.pointer_is_down = !1, this.pointer_is_double = !1), this.graph.change(), e.stopPropagation(), e.preventDefault(), !1;
  }
};
LGraphCanvas.prototype.processMouseWheel = function(e) {
  if (!(!this.graph || !this.allow_dragcanvas)) {
    var t = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;
    this.adjustMouseEvent(e);
    var r = e.clientX, n = e.clientY, s = !this.viewport || this.viewport && r >= this.viewport[0] && r < this.viewport[0] + this.viewport[2] && n >= this.viewport[1] && n < this.viewport[1] + this.viewport[3];
    if (s) {
      var l = this.ds.scale;
      return t > 0 ? l *= 1.1 : t < 0 && (l *= 1 / 1.1), this.ds.changeScale(l, [e.clientX, e.clientY]), this.graph.change(), e.preventDefault(), !1;
    }
  }
};
LGraphCanvas.prototype.isOverNodeBox = function(e, t, r) {
  var n = LiteGraph.NODE_TITLE_HEIGHT;
  return !!isInsideRectangle(
    t,
    r,
    e.pos[0] + 2,
    e.pos[1] + 2 - n,
    n - 4,
    n - 4
  );
};
LGraphCanvas.prototype.isOverNodeInput = function(e, t, r, n) {
  if (e.inputs)
    for (var s = 0, l = e.inputs.length; s < l; ++s) {
      e.inputs[s];
      var a = e.getConnectionPos(!0, s), o = !1;
      if (e.horizontal ? o = isInsideRectangle(
        t,
        r,
        a[0] - 5,
        a[1] - 10,
        10,
        20
      ) : o = isInsideRectangle(
        t,
        r,
        a[0] - 10,
        a[1] - 5,
        40,
        10
      ), o)
        return n && (n[0] = a[0], n[1] = a[1]), s;
    }
  return -1;
};
LGraphCanvas.prototype.isOverNodeOutput = function(e, t, r, n) {
  if (e.outputs)
    for (var s = 0, l = e.outputs.length; s < l; ++s) {
      e.outputs[s];
      var a = e.getConnectionPos(!1, s), o = !1;
      if (e.horizontal ? o = isInsideRectangle(
        t,
        r,
        a[0] - 5,
        a[1] - 10,
        10,
        20
      ) : o = isInsideRectangle(
        t,
        r,
        a[0] - 10,
        a[1] - 5,
        40,
        10
      ), o)
        return n && (n[0] = a[0], n[1] = a[1]), s;
    }
  return -1;
};
LGraphCanvas.prototype.processKey = function(e) {
  if (this.graph) {
    var t = !1;
    if (e.target.localName != "input") {
      if (e.type == "keydown") {
        if (e.keyCode == 32 && (this.dragging_canvas = !0, t = !0), e.keyCode == 27 && (this.node_panel && this.node_panel.close(), this.options_panel && this.options_panel.close(), t = !0), e.keyCode == 65 && e.ctrlKey && (this.selectNodes(), t = !0), e.keyCode === 67 && (e.metaKey || e.ctrlKey) && !e.shiftKey && this.selected_nodes && (this.copyToClipboard(), t = !0), e.keyCode === 86 && (e.metaKey || e.ctrlKey) && this.pasteFromClipboard(e.shiftKey), (e.keyCode == 46 || e.keyCode == 8) && e.target.localName != "input" && e.target.localName != "textarea" && (this.deleteSelectedNodes(), t = !0), this.selected_nodes)
          for (var r in this.selected_nodes)
            this.selected_nodes[r].onKeyDown && this.selected_nodes[r].onKeyDown(e);
      } else if (e.type == "keyup" && (e.keyCode == 32 && (this.dragging_canvas = !1), this.selected_nodes))
        for (var r in this.selected_nodes)
          this.selected_nodes[r].onKeyUp && this.selected_nodes[r].onKeyUp(e);
      if (this.graph.change(), t)
        return e.preventDefault(), e.stopImmediatePropagation(), !1;
    }
  }
};
LGraphCanvas.prototype.copyToClipboard = function(e) {
  var t = {
    nodes: [],
    links: []
  }, r = 0, n = [];
  e || (e = this.selected_nodes);
  for (var s in e) {
    var l = e[s];
    l.clonable !== !1 && (l._relative_id = r, n.push(l), r += 1);
  }
  for (var s = 0; s < n.length; ++s) {
    var l = n[s];
    if (l.clonable !== !1) {
      var a = l.clone();
      if (!a) {
        console.warn("node type not found: " + l.type);
        continue;
      }
      if (t.nodes.push(a.serialize()), l.inputs && l.inputs.length)
        for (var o = 0; o < l.inputs.length; ++o) {
          var h = l.inputs[o];
          if (!(!h || h.link == null)) {
            var u = this.graph.links[h.link];
            if (u) {
              var p = this.graph.getNodeById(
                u.origin_id
              );
              p && t.links.push([
                p._relative_id,
                u.origin_slot,
                //j,
                l._relative_id,
                u.target_slot,
                p.id
              ]);
            }
          }
        }
    }
  }
  localStorage.setItem(
    "litegrapheditor_clipboard",
    JSON.stringify(t)
  );
};
LGraphCanvas.prototype.pasteFromClipboard = function(e = !1) {
  if (!(!LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && e)) {
    var t = localStorage.getItem("litegrapheditor_clipboard");
    if (t) {
      this.graph.beforeChange();
      for (var r = JSON.parse(t), n = !1, s = !1, l = 0; l < r.nodes.length; ++l)
        n ? (n[0] > r.nodes[l].pos[0] && (n[0] = r.nodes[l].pos[0], s[0] = l), n[1] > r.nodes[l].pos[1] && (n[1] = r.nodes[l].pos[1], s[1] = l)) : (n = [r.nodes[l].pos[0], r.nodes[l].pos[1]], s = [l, l]);
      for (var a = [], l = 0; l < r.nodes.length; ++l) {
        var o = r.nodes[l], h = LiteGraph.createNode(o.type);
        h && (h.configure(o), h.pos[0] += this.graph_mouse[0] - n[0], h.pos[1] += this.graph_mouse[1] - n[1], this.graph.add(h, { doProcessChange: !1 }), a.push(h));
      }
      for (var l = 0; l < r.links.length; ++l) {
        var u = r.links[l], p = void 0, f = u[0];
        if (f != null)
          p = a[f];
        else if (LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs && e) {
          var c = u[4];
          c && (p = this.graph.getNodeById(c));
        }
        var g = a[u[2]];
        p && g ? p.connect(u[1], g, u[3]) : console.warn("Warning, nodes missing on pasting");
      }
      this.selectNodes(a), this.graph.afterChange();
    }
  }
};
LGraphCanvas.prototype.processDrop = function(e) {
  e.preventDefault(), this.adjustMouseEvent(e);
  var t = e.clientX, r = e.clientY, n = !this.viewport || this.viewport && t >= this.viewport[0] && t < this.viewport[0] + this.viewport[2] && r >= this.viewport[1] && r < this.viewport[1] + this.viewport[3];
  if (n) {
    var s = [e.canvasX, e.canvasY], l = this.graph ? this.graph.getNodeOnPos(s[0], s[1]) : null;
    if (!l) {
      var a = null;
      this.onDropItem && (a = this.onDropItem(event)), a || this.checkDropItem(e);
      return;
    }
    if (l.onDropFile || l.onDropData) {
      var o = e.dataTransfer.files;
      if (o && o.length)
        for (var h = 0; h < o.length; h++) {
          var u = e.dataTransfer.files[0], p = u.name;
          if (LGraphCanvas.getFileExtension(p), l.onDropFile && l.onDropFile(u), l.onDropData) {
            var f = new FileReader();
            f.onload = function(g) {
              var d = g.target.result;
              l.onDropData(d, p, u);
            };
            var c = u.type.split("/")[0];
            c == "text" || c == "" ? f.readAsText(u) : c == "image" ? f.readAsDataURL(u) : f.readAsArrayBuffer(u);
          }
        }
    }
    return l.onDropItem && l.onDropItem(event) ? !0 : this.onDropItem ? this.onDropItem(event) : !1;
  }
};
LGraphCanvas.prototype.checkDropItem = function(e) {
  if (e.dataTransfer.files.length) {
    var t = e.dataTransfer.files[0], r = LGraphCanvas.getFileExtension(t.name).toLowerCase(), n = LiteGraph.node_types_by_file_extension[r];
    if (n) {
      this.graph.beforeChange();
      var s = LiteGraph.createNode(n.type);
      s.pos = [e.canvasX, e.canvasY], this.graph.add(s), s.onDropFile && s.onDropFile(t), this.graph.afterChange();
    }
  }
};
LGraphCanvas.prototype.processNodeDblClicked = function(e) {
  this.onShowNodePanel ? this.onShowNodePanel(e) : this.showShowNodePanel(e), this.onNodeDblClicked && this.onNodeDblClicked(e), this.setDirty(!0);
};
LGraphCanvas.prototype.processNodeSelected = function(e, t) {
  this.selectNode(e, t && (t.shiftKey || t.ctrlKey || this.multi_select)), this.onNodeSelected && this.onNodeSelected(e);
};
LGraphCanvas.prototype.selectNode = function(e, t) {
  e == null ? this.deselectAllNodes() : this.selectNodes([e], t);
};
LGraphCanvas.prototype.selectNodes = function(e, t) {
  t || this.deselectAllNodes(), e = e || this.graph._nodes, typeof e == "string" && (e = [e]);
  for (var r in e) {
    var n = e[r];
    if (n.is_selected) {
      this.deselectNode(n);
      continue;
    }
    if (!n.is_selected && n.onSelected && n.onSelected(), n.is_selected = !0, this.selected_nodes[n.id] = n, n.inputs)
      for (var s = 0; s < n.inputs.length; ++s)
        this.highlighted_links[n.inputs[s].link] = !0;
    if (n.outputs)
      for (var s = 0; s < n.outputs.length; ++s) {
        var l = n.outputs[s];
        if (l.links)
          for (var a = 0; a < l.links.length; ++a)
            this.highlighted_links[l.links[a]] = !0;
      }
  }
  this.onSelectionChange && this.onSelectionChange(this.selected_nodes), this.setDirty(!0);
};
LGraphCanvas.prototype.deselectNode = function(e) {
  if (e.is_selected) {
    if (e.onDeselected && e.onDeselected(), e.is_selected = !1, this.onNodeDeselected && this.onNodeDeselected(e), e.inputs)
      for (var t = 0; t < e.inputs.length; ++t)
        delete this.highlighted_links[e.inputs[t].link];
    if (e.outputs)
      for (var t = 0; t < e.outputs.length; ++t) {
        var r = e.outputs[t];
        if (r.links)
          for (var n = 0; n < r.links.length; ++n)
            delete this.highlighted_links[r.links[n]];
      }
  }
};
LGraphCanvas.prototype.deselectAllNodes = function() {
  if (this.graph) {
    for (var e = this.graph._nodes, t = 0, r = e.length; t < r; ++t) {
      var n = e[t];
      n.is_selected && (n.onDeselected && n.onDeselected(), n.is_selected = !1, this.onNodeDeselected && this.onNodeDeselected(n));
    }
    this.selected_nodes = {}, this.current_node = null, this.highlighted_links = {}, this.onSelectionChange && this.onSelectionChange(this.selected_nodes), this.setDirty(!0);
  }
};
LGraphCanvas.prototype.deleteSelectedNodes = function() {
  this.graph.beforeChange();
  for (var e in this.selected_nodes) {
    var t = this.selected_nodes[e];
    if (!t.block_delete) {
      if (t.inputs && t.inputs.length && t.outputs && t.outputs.length && LiteGraph.isValidConnection(t.inputs[0].type, t.outputs[0].type) && t.inputs[0].link && t.outputs[0].links && t.outputs[0].links.length) {
        var r = t.graph.links[t.inputs[0].link], n = t.graph.links[t.outputs[0].links[0]], s = t.getInputNode(0), l = t.getOutputNodes(0)[0];
        s && l && s.connect(r.origin_slot, l, n.target_slot);
      }
      this.graph.remove(t), this.onNodeDeselected && this.onNodeDeselected(t);
    }
  }
  this.selected_nodes = {}, this.current_node = null, this.highlighted_links = {}, this.setDirty(!0), this.graph.afterChange();
};
LGraphCanvas.prototype.centerOnNode = function(e) {
  this.ds.offset[0] = -e.pos[0] - e.size[0] * 0.5 + this.canvas.width * 0.5 / this.ds.scale, this.ds.offset[1] = -e.pos[1] - e.size[1] * 0.5 + this.canvas.height * 0.5 / this.ds.scale, this.setDirty(!0, !0);
};
LGraphCanvas.prototype.adjustMouseEvent = function(e) {
  var t = 0, r = 0;
  if (this.canvas) {
    var n = this.canvas.getBoundingClientRect();
    t = e.clientX - n.left, r = e.clientY - n.top;
  } else
    t = e.clientX, r = e.clientY;
  e.deltaX = t - this.last_mouse_position[0], e.deltaY = r - this.last_mouse_position[1], this.last_mouse_position[0] = t, this.last_mouse_position[1] = r, e.canvasX = t / this.ds.scale - this.ds.offset[0], e.canvasY = r / this.ds.scale - this.ds.offset[1];
};
LGraphCanvas.prototype.setZoom = function(e, t) {
  this.ds.changeScale(e, t), this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
};
LGraphCanvas.prototype.convertOffsetToCanvas = function(e, t) {
  return this.ds.convertOffsetToCanvas(e, t);
};
LGraphCanvas.prototype.convertCanvasToOffset = function(e, t) {
  return this.ds.convertCanvasToOffset(e, t);
};
LGraphCanvas.prototype.convertEventToCanvasOffset = function(e) {
  var t = this.canvas.getBoundingClientRect();
  return this.convertCanvasToOffset([
    e.clientX - t.left,
    e.clientY - t.top
  ]);
};
LGraphCanvas.prototype.bringToFront = function(e) {
  var t = this.graph._nodes.indexOf(e);
  t != -1 && (this.graph._nodes.splice(t, 1), this.graph._nodes.push(e));
};
LGraphCanvas.prototype.sendToBack = function(e) {
  var t = this.graph._nodes.indexOf(e);
  t != -1 && (this.graph._nodes.splice(t, 1), this.graph._nodes.unshift(e));
};
var temp = new Float32Array(4);
LGraphCanvas.prototype.computeVisibleNodes = function(e, t) {
  var r = t || [];
  r.length = 0, e = e || this.graph._nodes;
  for (var n = 0, s = e.length; n < s; ++n) {
    var l = e[n];
    this.live_mode && !l.onDrawBackground && !l.onDrawForeground || overlapBounding(this.visible_area, l.getBounding(temp, !0)) && r.push(l);
  }
  return r;
};
LGraphCanvas.prototype.draw = function(e, t) {
  if (!(!this.canvas || this.canvas.width == 0 || this.canvas.height == 0)) {
    var r = LiteGraph.getTime();
    this.render_time = (r - this.last_draw_time) * 1e-3, this.last_draw_time = r, this.graph && this.ds.computeVisibleArea(this.viewport), (this.dirty_bgcanvas || t || this.always_render_background || this.graph && this.graph._last_trigger_time && r - this.graph._last_trigger_time < 1e3) && this.drawBackCanvas(), (this.dirty_canvas || e) && this.drawFrontCanvas(), this.fps = this.render_time ? 1 / this.render_time : 0, this.frame += 1;
  }
};
LGraphCanvas.prototype.drawFrontCanvas = function() {
  this.dirty_canvas = !1, this.ctx || (this.ctx = this.bgcanvas.getContext("2d"));
  var e = this.ctx;
  if (e) {
    var t = this.canvas;
    e.start2D && !this.viewport && (e.start2D(), e.restore(), e.setTransform(1, 0, 0, 1, 0, 0));
    var r = this.viewport || this.dirty_area;
    if (r && (e.save(), e.beginPath(), e.rect(r[0], r[1], r[2], r[3]), e.clip()), this.clear_background && (r ? e.clearRect(r[0], r[1], r[2], r[3]) : e.clearRect(0, 0, t.width, t.height)), this.bgcanvas == this.canvas ? this.drawBackCanvas() : e.drawImage(this.bgcanvas, 0, 0), this.onRender && this.onRender(t, e), this.show_info && this.renderInfo(e, r ? r[0] : 0, r ? r[1] : 0), this.graph) {
      e.save(), this.ds.toCanvasContext(e);
      for (var n = this.computeVisibleNodes(
        null,
        this.visible_nodes
      ), s = 0; s < n.length; ++s) {
        var l = n[s];
        e.save(), e.translate(l.pos[0], l.pos[1]), this.drawNode(l, e), e.restore();
      }
      if (this.render_execution_order && this.drawExecutionOrder(e), this.graph.config.links_ontop && (this.live_mode || this.drawConnections(e)), this.connecting_pos != null) {
        e.lineWidth = this.connections_width;
        var a = null, o = this.connecting_output || this.connecting_input, h = o.type, u = o.dir;
        u == null && (this.connecting_output ? u = this.connecting_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT : u = this.connecting_node.horizontal ? LiteGraph.UP : LiteGraph.LEFT);
        var p = o.shape;
        switch (h) {
          case LiteGraph.EVENT:
            a = LiteGraph.EVENT_LINK_COLOR;
            break;
          default:
            a = LiteGraph.CONNECTING_LINK_COLOR;
        }
        if (this.renderLink(
          e,
          this.connecting_pos,
          [this.graph_mouse[0], this.graph_mouse[1]],
          null,
          !1,
          null,
          a,
          u,
          LiteGraph.CENTER
        ), e.beginPath(), h === LiteGraph.EVENT || p === LiteGraph.BOX_SHAPE ? (e.rect(
          this.connecting_pos[0] - 6 + 0.5,
          this.connecting_pos[1] - 5 + 0.5,
          14,
          10
        ), e.fill(), e.beginPath(), e.rect(
          this.graph_mouse[0] - 6 + 0.5,
          this.graph_mouse[1] - 5 + 0.5,
          14,
          10
        )) : p === LiteGraph.ARROW_SHAPE ? (e.moveTo(this.connecting_pos[0] + 8, this.connecting_pos[1] + 0.5), e.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] + 6 + 0.5), e.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] - 6 + 0.5), e.closePath()) : (e.arc(
          this.connecting_pos[0],
          this.connecting_pos[1],
          4,
          0,
          Math.PI * 2
        ), e.fill(), e.beginPath(), e.arc(
          this.graph_mouse[0],
          this.graph_mouse[1],
          4,
          0,
          Math.PI * 2
        )), e.fill(), e.fillStyle = "#ffcc00", this._highlight_input) {
          e.beginPath();
          var f = this._highlight_input_slot.shape;
          f === LiteGraph.ARROW_SHAPE ? (e.moveTo(this._highlight_input[0] + 8, this._highlight_input[1] + 0.5), e.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] + 6 + 0.5), e.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] - 6 + 0.5), e.closePath()) : e.arc(
            this._highlight_input[0],
            this._highlight_input[1],
            6,
            0,
            Math.PI * 2
          ), e.fill();
        }
        this._highlight_output && (e.beginPath(), f === LiteGraph.ARROW_SHAPE ? (e.moveTo(this._highlight_output[0] + 8, this._highlight_output[1] + 0.5), e.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] + 6 + 0.5), e.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] - 6 + 0.5), e.closePath()) : e.arc(
          this._highlight_output[0],
          this._highlight_output[1],
          6,
          0,
          Math.PI * 2
        ), e.fill());
      }
      this.dragging_rectangle && (e.strokeStyle = "#FFF", e.strokeRect(
        this.dragging_rectangle[0],
        this.dragging_rectangle[1],
        this.dragging_rectangle[2],
        this.dragging_rectangle[3]
      )), this.over_link_center && this.render_link_tooltip ? this.drawLinkTooltip(e, this.over_link_center) : this.onDrawLinkTooltip && this.onDrawLinkTooltip(e, null), this.onDrawForeground && this.onDrawForeground(e, this.visible_rect), e.restore();
    }
    this._graph_stack && this._graph_stack.length && this.drawSubgraphPanel(e), this.onDrawOverlay && this.onDrawOverlay(e), r && e.restore(), e.finish2D && e.finish2D();
  }
};
LGraphCanvas.prototype.drawSubgraphPanel = function(e) {
  var t = this.graph, r = t._subgraph_node;
  if (!r) {
    console.warn("subgraph without subnode");
    return;
  }
  this.drawSubgraphPanelLeft(t, r, e), this.drawSubgraphPanelRight(t, r, e);
};
LGraphCanvas.prototype.drawSubgraphPanelLeft = function(e, t, r) {
  var n = t.inputs ? t.inputs.length : 0, s = 200, l = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);
  if (r.fillStyle = "#111", r.globalAlpha = 0.8, r.beginPath(), r.roundRect(10, 10, s, (n + 1) * l + 50, [8]), r.fill(), r.globalAlpha = 1, r.fillStyle = "#888", r.font = "14px Arial", r.textAlign = "left", r.fillText("Graph Inputs", 20, 34), this.drawButton(s - 20, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }
  var a = 50;
  if (r.font = "14px Arial", t.inputs)
    for (var o = 0; o < t.inputs.length; ++o) {
      var h = t.inputs[o];
      if (!h.not_subgraph_input) {
        if (this.drawButton(20, a + 2, s - 20, l - 2)) {
          var u = t.constructor.input_node_type || "graph/input";
          this.graph.beforeChange();
          var p = LiteGraph.createNode(u);
          p ? (e.add(p), this.block_click = !1, this.last_click_position = null, this.selectNodes([p]), this.node_dragged = p, this.dragging_canvas = !1, p.setProperty("name", h.name), p.setProperty("type", h.type), this.node_dragged.pos[0] = this.graph_mouse[0] - 5, this.node_dragged.pos[1] = this.graph_mouse[1] - 5, this.graph.afterChange()) : console.error("graph input node not found:", u);
        }
        r.fillStyle = "#9C9", r.beginPath(), r.arc(s - 16, a + l * 0.5, 5, 0, 2 * Math.PI), r.fill(), r.fillStyle = "#AAA", r.fillText(h.name, 30, a + l * 0.75), r.fillStyle = "#777", r.fillText(h.type, 130, a + l * 0.75), a += l;
      }
    }
  this.drawButton(20, a + 2, s - 20, l - 2, "+", "#151515", "#222") && this.showSubgraphPropertiesDialog(t);
};
LGraphCanvas.prototype.drawSubgraphPanelRight = function(e, t, r) {
  var n = t.outputs ? t.outputs.length : 0, s = this.bgcanvas.width, l = 200, a = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);
  r.fillStyle = "#111", r.globalAlpha = 0.8, r.beginPath(), r.roundRect(s - l - 10, 10, l, (n + 1) * a + 50, [8]), r.fill(), r.globalAlpha = 1, r.fillStyle = "#888", r.font = "14px Arial", r.textAlign = "left";
  var o = "Graph Outputs", h = r.measureText(o).width;
  if (r.fillText(o, s - h - 20, 34), this.drawButton(s - l, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }
  var u = 50;
  if (r.font = "14px Arial", t.outputs)
    for (var p = 0; p < t.outputs.length; ++p) {
      var f = t.outputs[p];
      if (!f.not_subgraph_input) {
        if (this.drawButton(s - l, u + 2, l - 20, a - 2)) {
          var c = t.constructor.output_node_type || "graph/output";
          this.graph.beforeChange();
          var g = LiteGraph.createNode(c);
          g ? (e.add(g), this.block_click = !1, this.last_click_position = null, this.selectNodes([g]), this.node_dragged = g, this.dragging_canvas = !1, g.setProperty("name", f.name), g.setProperty("type", f.type), this.node_dragged.pos[0] = this.graph_mouse[0] - 5, this.node_dragged.pos[1] = this.graph_mouse[1] - 5, this.graph.afterChange()) : console.error("graph input node not found:", c);
        }
        r.fillStyle = "#9C9", r.beginPath(), r.arc(s - l + 16, u + a * 0.5, 5, 0, 2 * Math.PI), r.fill(), r.fillStyle = "#AAA", r.fillText(f.name, s - l + 30, u + a * 0.75), r.fillStyle = "#777", r.fillText(f.type, s - l + 130, u + a * 0.75), u += a;
      }
    }
  this.drawButton(s - l, u + 2, l - 20, a - 2, "+", "#151515", "#222") && this.showSubgraphPropertiesDialogRight(t);
};
LGraphCanvas.prototype.drawButton = function(e, t, r, n, s, l, a, o) {
  var h = this.ctx;
  l = l || LiteGraph.NODE_DEFAULT_COLOR, a = a || "#555", o = o || LiteGraph.NODE_TEXT_COLOR;
  var u = this.ds.convertOffsetToCanvas(this.graph_mouse), p = LiteGraph.isInsideRectangle(u[0], u[1], e, t, r, n);
  if (u = this.last_click_position ? [this.last_click_position[0], this.last_click_position[1]] : null, u) {
    var f = this.canvas.getBoundingClientRect();
    u[0] -= f.left, u[1] -= f.top;
  }
  var c = u && LiteGraph.isInsideRectangle(u[0], u[1], e, t, r, n);
  h.fillStyle = p ? a : l, c && (h.fillStyle = "#AAA"), h.beginPath(), h.roundRect(e, t, r, n, [4]), h.fill(), s != null && s.constructor == String && (h.fillStyle = o, h.textAlign = "center", h.font = (n * 0.65 | 0) + "px Arial", h.fillText(s, e + r * 0.5, t + n * 0.75), h.textAlign = "left");
  var g = c && !this.block_click;
  return c && this.blockClick(), g;
};
LGraphCanvas.prototype.isAreaClicked = function(e, t, r, n, s) {
  var l = this.mouse;
  LiteGraph.isInsideRectangle(l[0], l[1], e, t, r, n), l = this.last_click_position;
  var a = l && LiteGraph.isInsideRectangle(l[0], l[1], e, t, r, n), o = a && !this.block_click;
  return a && s && this.blockClick(), o;
};
LGraphCanvas.prototype.renderInfo = function(e, t, r) {
  t = t || 10, r = r || this.canvas.offsetHeight - 80, e.save(), e.translate(t, r), e.font = "10px Arial", e.fillStyle = "#888", e.textAlign = "left", this.graph ? (e.fillText("T: " + this.graph.globaltime.toFixed(2) + "s", 5, 13 * 1), e.fillText("I: " + this.graph.iteration, 5, 13 * 2), e.fillText("N: " + this.graph._nodes.length + " [" + this.visible_nodes.length + "]", 5, 13 * 3), e.fillText("V: " + this.graph._version, 5, 13 * 4), e.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 5)) : e.fillText("No graph selected", 5, 13 * 1), e.restore();
};
LGraphCanvas.prototype.drawBackCanvas = function() {
  var e = this.bgcanvas;
  (e.width != this.canvas.width || e.height != this.canvas.height) && (e.width = this.canvas.width, e.height = this.canvas.height), this.bgctx || (this.bgctx = this.bgcanvas.getContext("2d"));
  var t = this.bgctx;
  t.start && t.start();
  var r = this.viewport || [0, 0, t.canvas.width, t.canvas.height];
  if (this.clear_background && t.clearRect(r[0], r[1], r[2], r[3]), this._graph_stack && this._graph_stack.length) {
    t.save(), this._graph_stack[this._graph_stack.length - 1];
    var n = this.graph._subgraph_node;
    t.strokeStyle = n.bgcolor, t.lineWidth = 10, t.strokeRect(1, 1, e.width - 2, e.height - 2), t.lineWidth = 1, t.font = "40px Arial", t.textAlign = "center", t.fillStyle = n.bgcolor || "#AAA";
    for (var s = "", l = 1; l < this._graph_stack.length; ++l)
      s += this._graph_stack[l]._subgraph_node.getTitle() + " >> ";
    t.fillText(
      s + n.getTitle(),
      e.width * 0.5,
      40
    ), t.restore();
  }
  var a = !1;
  if (this.onRenderBackground && (a = this.onRenderBackground(e, t)), this.viewport || (t.restore(), t.setTransform(1, 0, 0, 1, 0, 0)), this.visible_links.length = 0, this.graph) {
    if (t.save(), this.ds.toCanvasContext(t), this.ds.scale < 1.5 && !a && this.clear_background_color && (t.fillStyle = this.clear_background_color, t.fillRect(
      this.visible_area[0],
      this.visible_area[1],
      this.visible_area[2],
      this.visible_area[3]
    )), this.background_image && this.ds.scale > 0.5 && !a) {
      if (this.zoom_modify_alpha ? t.globalAlpha = (1 - 0.5 / this.ds.scale) * this.editor_alpha : t.globalAlpha = this.editor_alpha, t.imageSmoothingEnabled = t.imageSmoothingEnabled = !1, !this._bg_img || this._bg_img.name != this.background_image) {
        this._bg_img = new Image(), this._bg_img.name = this.background_image, this._bg_img.src = this.background_image;
        var o = this;
        this._bg_img.onload = function() {
          o.draw(!0, !0);
        };
      }
      var h = null;
      this._pattern == null && this._bg_img.width > 0 ? (h = t.createPattern(this._bg_img, "repeat"), this._pattern_img = this._bg_img, this._pattern = h) : h = this._pattern, h && (t.fillStyle = h, t.fillRect(
        this.visible_area[0],
        this.visible_area[1],
        this.visible_area[2],
        this.visible_area[3]
      ), t.fillStyle = "transparent"), t.globalAlpha = 1, t.imageSmoothingEnabled = t.imageSmoothingEnabled = !0;
    }
    this.graph._groups.length && !this.live_mode && this.drawGroups(e, t), this.onDrawBackground && this.onDrawBackground(t, this.visible_area), this.onBackgroundRender && (console.error(
      "WARNING! onBackgroundRender deprecated, now is named onDrawBackground "
    ), this.onBackgroundRender = null), this.render_canvas_border && (t.strokeStyle = "#235", t.strokeRect(0, 0, e.width, e.height)), this.render_connections_shadows ? (t.shadowColor = "#000", t.shadowOffsetX = 0, t.shadowOffsetY = 0, t.shadowBlur = 6) : t.shadowColor = "rgba(0,0,0,0)", this.live_mode || this.drawConnections(t), t.shadowColor = "rgba(0,0,0,0)", t.restore();
  }
  t.finish && t.finish(), this.dirty_bgcanvas = !1, this.dirty_canvas = !0;
};
var temp_vec2 = new Float32Array(2);
LGraphCanvas.prototype.drawNode = function(e, t) {
  this.current_node = e;
  var r = e.color || e.constructor.color || LiteGraph.NODE_DEFAULT_COLOR, n = e.bgcolor || e.constructor.bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;
  e.mouseOver;
  var s = this.ds.scale < 0.6;
  if (this.live_mode) {
    e.flags.collapsed || (t.shadowColor = "transparent", e.onDrawForeground && e.onDrawForeground(t, this, this.canvas));
    return;
  }
  var l = this.editor_alpha;
  if (t.globalAlpha = l, this.render_shadows && !s ? (t.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR, t.shadowOffsetX = 2 * this.ds.scale, t.shadowOffsetY = 2 * this.ds.scale, t.shadowBlur = 3 * this.ds.scale) : t.shadowColor = "transparent", !(e.flags.collapsed && e.onDrawCollapsed && e.onDrawCollapsed(t, this) == !0)) {
    var a = e._shape || LiteGraph.BOX_SHAPE, o = temp_vec2;
    temp_vec2.set(e.size);
    var h = e.horizontal;
    if (e.flags.collapsed) {
      t.font = this.inner_text_font;
      var u = e.getTitle ? e.getTitle() : e.title;
      u != null && (e._collapsed_width = Math.min(
        e.size[0],
        t.measureText(u).width + LiteGraph.NODE_TITLE_HEIGHT * 2
      ), o[0] = e._collapsed_width, o[1] = 0);
    }
    e.clip_area && (t.save(), t.beginPath(), a == LiteGraph.BOX_SHAPE ? t.rect(0, 0, o[0], o[1]) : a == LiteGraph.ROUND_SHAPE ? t.roundRect(0, 0, o[0], o[1], [10]) : a == LiteGraph.CIRCLE_SHAPE && t.arc(
      o[0] * 0.5,
      o[1] * 0.5,
      o[0] * 0.5,
      0,
      Math.PI * 2
    ), t.clip()), e.has_errors && (n = "red"), this.drawNodeShape(
      e,
      t,
      o,
      r,
      n,
      e.is_selected,
      e.mouseOver
    ), t.shadowColor = "transparent", e.onDrawForeground && e.onDrawForeground(t, this, this.canvas), t.textAlign = h ? "center" : "left", t.font = this.inner_text_font;
    var p = !s, f = this.connecting_output, c = this.connecting_input;
    t.lineWidth = 1;
    var g = 0, d = new Float32Array(2);
    if (e.flags.collapsed) {
      if (this.render_collapsed_slots) {
        var D = null, P = null;
        if (e.inputs)
          for (var G = 0; G < e.inputs.length; G++) {
            var L = e.inputs[G];
            if (L.link != null) {
              D = L;
              break;
            }
          }
        if (e.outputs)
          for (var G = 0; G < e.outputs.length; G++) {
            var L = e.outputs[G];
            !L.links || !L.links.length || (P = L);
          }
        if (D) {
          var A = 0, k = LiteGraph.NODE_TITLE_HEIGHT * -0.5;
          h && (A = e._collapsed_width * 0.5, k = -LiteGraph.NODE_TITLE_HEIGHT), t.fillStyle = "#686", t.beginPath(), L.type === LiteGraph.EVENT || L.shape === LiteGraph.BOX_SHAPE ? t.rect(A - 7 + 0.5, k - 4, 14, 8) : L.shape === LiteGraph.ARROW_SHAPE ? (t.moveTo(A + 8, k), t.lineTo(A + -4, k - 4), t.lineTo(A + -4, k + 4), t.closePath()) : t.arc(A, k, 4, 0, Math.PI * 2), t.fill();
        }
        if (P) {
          var A = e._collapsed_width, k = LiteGraph.NODE_TITLE_HEIGHT * -0.5;
          h && (A = e._collapsed_width * 0.5, k = 0), t.fillStyle = "#686", t.strokeStyle = "black", t.beginPath(), L.type === LiteGraph.EVENT || L.shape === LiteGraph.BOX_SHAPE ? t.rect(A - 7 + 0.5, k - 4, 14, 8) : L.shape === LiteGraph.ARROW_SHAPE ? (t.moveTo(A + 6, k), t.lineTo(A - 6, k - 4), t.lineTo(A - 6, k + 4), t.closePath()) : t.arc(A, k, 4, 0, Math.PI * 2), t.fill();
        }
      }
    } else {
      if (e.inputs)
        for (var G = 0; G < e.inputs.length; G++) {
          var L = e.inputs[G], m = L.type, b = L.shape;
          t.globalAlpha = l, this.connecting_output && !LiteGraph.isValidConnection(L.type, f.type) && (t.globalAlpha = 0.4 * l), t.fillStyle = L.link != null ? L.color_on || this.default_connection_color_byType[m] || this.default_connection_color.input_on : L.color_off || this.default_connection_color_byTypeOff[m] || this.default_connection_color_byType[m] || this.default_connection_color.input_off;
          var _ = e.getConnectionPos(!0, G, d);
          _[0] -= e.pos[0], _[1] -= e.pos[1], g < _[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5 && (g = _[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5), t.beginPath(), m == "array" && (b = LiteGraph.GRID_SHAPE);
          var C = !0;
          if (L.type === LiteGraph.EVENT || L.shape === LiteGraph.BOX_SHAPE ? h ? t.rect(
            _[0] - 5 + 0.5,
            _[1] - 8 + 0.5,
            10,
            14
          ) : t.rect(
            _[0] - 6 + 0.5,
            _[1] - 5 + 0.5,
            14,
            10
          ) : b === LiteGraph.ARROW_SHAPE ? (t.moveTo(_[0] + 8, _[1] + 0.5), t.lineTo(_[0] - 4, _[1] + 6 + 0.5), t.lineTo(_[0] - 4, _[1] - 6 + 0.5), t.closePath()) : b === LiteGraph.GRID_SHAPE ? (t.rect(_[0] - 4, _[1] - 4, 2, 2), t.rect(_[0] - 1, _[1] - 4, 2, 2), t.rect(_[0] + 2, _[1] - 4, 2, 2), t.rect(_[0] - 4, _[1] - 1, 2, 2), t.rect(_[0] - 1, _[1] - 1, 2, 2), t.rect(_[0] + 2, _[1] - 1, 2, 2), t.rect(_[0] - 4, _[1] + 2, 2, 2), t.rect(_[0] - 1, _[1] + 2, 2, 2), t.rect(_[0] + 2, _[1] + 2, 2, 2), C = !1) : s ? t.rect(_[0] - 4, _[1] - 4, 8, 8) : t.arc(_[0], _[1], 4, 0, Math.PI * 2), t.fill(), p) {
            var N = L.label != null ? L.label : L.name;
            N && (t.fillStyle = LiteGraph.NODE_TEXT_COLOR, h || L.dir == LiteGraph.UP ? t.fillText(N, _[0], _[1] - 10) : t.fillText(N, _[0] + 10, _[1] + 5));
          }
        }
      if (t.textAlign = h ? "center" : "right", t.strokeStyle = "black", e.outputs)
        for (var G = 0; G < e.outputs.length; G++) {
          var L = e.outputs[G], m = L.type, b = L.shape;
          this.connecting_input && !LiteGraph.isValidConnection(m, c.type) && (t.globalAlpha = 0.4 * l);
          var _ = e.getConnectionPos(!1, G, d);
          _[0] -= e.pos[0], _[1] -= e.pos[1], g < _[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5 && (g = _[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5), t.fillStyle = L.links && L.links.length ? L.color_on || this.default_connection_color_byType[m] || this.default_connection_color.output_on : L.color_off || this.default_connection_color_byTypeOff[m] || this.default_connection_color_byType[m] || this.default_connection_color.output_off, t.beginPath(), m == "array" && (b = LiteGraph.GRID_SHAPE);
          var C = !0;
          if (m === LiteGraph.EVENT || b === LiteGraph.BOX_SHAPE ? h ? t.rect(
            _[0] - 5 + 0.5,
            _[1] - 8 + 0.5,
            10,
            14
          ) : t.rect(
            _[0] - 6 + 0.5,
            _[1] - 5 + 0.5,
            14,
            10
          ) : b === LiteGraph.ARROW_SHAPE ? (t.moveTo(_[0] + 8, _[1] + 0.5), t.lineTo(_[0] - 4, _[1] + 6 + 0.5), t.lineTo(_[0] - 4, _[1] - 6 + 0.5), t.closePath()) : b === LiteGraph.GRID_SHAPE ? (t.rect(_[0] - 4, _[1] - 4, 2, 2), t.rect(_[0] - 1, _[1] - 4, 2, 2), t.rect(_[0] + 2, _[1] - 4, 2, 2), t.rect(_[0] - 4, _[1] - 1, 2, 2), t.rect(_[0] - 1, _[1] - 1, 2, 2), t.rect(_[0] + 2, _[1] - 1, 2, 2), t.rect(_[0] - 4, _[1] + 2, 2, 2), t.rect(_[0] - 1, _[1] + 2, 2, 2), t.rect(_[0] + 2, _[1] + 2, 2, 2), C = !1) : s ? t.rect(_[0] - 4, _[1] - 4, 8, 8) : t.arc(_[0], _[1], 4, 0, Math.PI * 2), t.fill(), !s && C && t.stroke(), p) {
            var N = L.label != null ? L.label : L.name;
            N && (t.fillStyle = LiteGraph.NODE_TEXT_COLOR, h || L.dir == LiteGraph.DOWN ? t.fillText(N, _[0], _[1] - 8) : t.fillText(N, _[0] - 10, _[1] + 5));
          }
        }
      if (t.textAlign = "left", t.globalAlpha = 1, e.widgets) {
        var I = g;
        (h || e.widgets_up) && (I = 2), e.widgets_start_y != null && (I = e.widgets_start_y), this.drawNodeWidgets(
          e,
          I,
          t,
          this.node_widget && this.node_widget[0] == e ? this.node_widget[1] : null
        );
      }
    }
    e.clip_area && t.restore(), t.globalAlpha = 1;
  }
};
LGraphCanvas.prototype.drawLinkTooltip = function(e, t) {
  var r = t._pos;
  if (e.fillStyle = "black", e.beginPath(), e.arc(r[0], r[1], 3, 0, Math.PI * 2), e.fill(), t.data != null && !(this.onDrawLinkTooltip && this.onDrawLinkTooltip(e, t, this) == !0)) {
    var n = t.data, s = null;
    if (n.constructor === Number ? s = n.toFixed(2) : n.constructor === String ? s = '"' + n + '"' : n.constructor === Boolean ? s = String(n) : n.toToolTip ? s = n.toToolTip() : s = "[" + n.constructor.name + "]", s != null) {
      s = s.substr(0, 30), e.font = "14px Courier New";
      var l = e.measureText(s), a = l.width + 20, o = 24;
      e.shadowColor = "black", e.shadowOffsetX = 2, e.shadowOffsetY = 2, e.shadowBlur = 3, e.fillStyle = "#454", e.beginPath(), e.roundRect(r[0] - a * 0.5, r[1] - 15 - o, a, o, [3]), e.moveTo(r[0] - 10, r[1] - 15), e.lineTo(r[0] + 10, r[1] - 15), e.lineTo(r[0], r[1] - 5), e.fill(), e.shadowColor = "transparent", e.textAlign = "center", e.fillStyle = "#CEC", e.fillText(s, r[0], r[1] - 15 - o * 0.3);
    }
  }
};
var tmp_area = new Float32Array(4);
LGraphCanvas.prototype.drawNodeShape = function(e, t, r, n, s, l, a) {
  t.strokeStyle = n, t.fillStyle = s;
  var o = LiteGraph.NODE_TITLE_HEIGHT, h = this.ds.scale < 0.5, u = e._shape || e.constructor.shape || LiteGraph.ROUND_SHAPE, p = e.constructor.title_mode, f = !0;
  p == LiteGraph.TRANSPARENT_TITLE || p == LiteGraph.NO_TITLE ? f = !1 : p == LiteGraph.AUTOHIDE_TITLE && a && (f = !0);
  var c = tmp_area;
  c[0] = 0, c[1] = f ? -o : 0, c[2] = r[0] + 1, c[3] = f ? r[1] + o : r[1];
  var g = t.globalAlpha;
  if (t.beginPath(), u == LiteGraph.BOX_SHAPE || h ? t.fillRect(c[0], c[1], c[2], c[3]) : u == LiteGraph.ROUND_SHAPE || u == LiteGraph.CARD_SHAPE ? t.roundRect(
    c[0],
    c[1],
    c[2],
    c[3],
    u == LiteGraph.CARD_SHAPE ? [this.round_radius, this.round_radius, 0, 0] : [this.round_radius]
  ) : u == LiteGraph.CIRCLE_SHAPE && t.arc(
    r[0] * 0.5,
    r[1] * 0.5,
    r[0] * 0.5,
    0,
    Math.PI * 2
  ), t.fill(), !e.flags.collapsed && f && (t.shadowColor = "transparent", t.fillStyle = "rgba(0,0,0,0.2)", t.fillRect(0, -1, c[2], 2)), t.shadowColor = "transparent", e.onDrawBackground && e.onDrawBackground(t, this, this.canvas, this.graph_mouse), f || p == LiteGraph.TRANSPARENT_TITLE) {
    if (e.onDrawTitleBar)
      e.onDrawTitleBar(t, o, r, this.ds.scale, n);
    else if (p != LiteGraph.TRANSPARENT_TITLE && (e.constructor.title_color || this.render_title_colored)) {
      var d = e.constructor.title_color || n;
      if (e.flags.collapsed && (t.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR), this.use_gradients) {
        var G = LGraphCanvas.gradients[d];
        G || (G = LGraphCanvas.gradients[d] = t.createLinearGradient(0, 0, 400, 0), G.addColorStop(0, d), G.addColorStop(1, "#000")), t.fillStyle = G;
      } else
        t.fillStyle = d;
      t.beginPath(), u == LiteGraph.BOX_SHAPE || h ? t.rect(0, -o, r[0] + 1, o) : (u == LiteGraph.ROUND_SHAPE || u == LiteGraph.CARD_SHAPE) && t.roundRect(
        0,
        -o,
        r[0] + 1,
        o,
        e.flags.collapsed ? [this.round_radius] : [this.round_radius, this.round_radius, 0, 0]
      ), t.fill(), t.shadowColor = "transparent";
    }
    var L = !1;
    LiteGraph.node_box_coloured_by_mode && LiteGraph.NODE_MODES_COLORS[e.mode] && (L = LiteGraph.NODE_MODES_COLORS[e.mode]), LiteGraph.node_box_coloured_when_on && (L = e.action_triggered ? "#FFF" : e.execute_triggered ? "#AAA" : L);
    var m = 10;
    if (e.onDrawTitleBox ? e.onDrawTitleBox(t, o, r, this.ds.scale) : u == LiteGraph.ROUND_SHAPE || u == LiteGraph.CIRCLE_SHAPE || u == LiteGraph.CARD_SHAPE ? (h && (t.fillStyle = "black", t.beginPath(), t.arc(
      o * 0.5,
      o * -0.5,
      m * 0.5 + 1,
      0,
      Math.PI * 2
    ), t.fill()), t.fillStyle = e.boxcolor || L || LiteGraph.NODE_DEFAULT_BOXCOLOR, h ? t.fillRect(o * 0.5 - m * 0.5, o * -0.5 - m * 0.5, m, m) : (t.beginPath(), t.arc(
      o * 0.5,
      o * -0.5,
      m * 0.5,
      0,
      Math.PI * 2
    ), t.fill())) : (h && (t.fillStyle = "black", t.fillRect(
      (o - m) * 0.5 - 1,
      (o + m) * -0.5 - 1,
      m + 2,
      m + 2
    )), t.fillStyle = e.boxcolor || L || LiteGraph.NODE_DEFAULT_BOXCOLOR, t.fillRect(
      (o - m) * 0.5,
      (o + m) * -0.5,
      m,
      m
    )), t.globalAlpha = g, e.onDrawTitleText && e.onDrawTitleText(
      t,
      o,
      r,
      this.ds.scale,
      this.title_text_font,
      l
    ), !h) {
      t.font = this.title_text_font;
      var b = String(e.getTitle());
      b && (l ? t.fillStyle = LiteGraph.NODE_SELECTED_TITLE_COLOR : t.fillStyle = e.constructor.title_text_color || this.node_title_color, e.flags.collapsed ? (t.textAlign = "left", t.measureText(b), t.fillText(
        b.substr(0, 20),
        //avoid urls too long
        o,
        // + measure.width * 0.5,
        LiteGraph.NODE_TITLE_TEXT_Y - o
      ), t.textAlign = "left") : (t.textAlign = "left", t.fillText(
        b,
        o,
        LiteGraph.NODE_TITLE_TEXT_Y - o
      )));
    }
    if (!e.flags.collapsed && e.subgraph && !e.skip_subgraph_button) {
      var _ = LiteGraph.NODE_TITLE_HEIGHT, C = e.size[0] - _, N = LiteGraph.isInsideRectangle(this.graph_mouse[0] - e.pos[0], this.graph_mouse[1] - e.pos[1], C + 2, -_ + 2, _ - 4, _ - 4);
      t.fillStyle = N ? "#888" : "#555", u == LiteGraph.BOX_SHAPE || h ? t.fillRect(C + 2, -_ + 2, _ - 4, _ - 4) : (t.beginPath(), t.roundRect(C + 2, -_ + 2, _ - 4, _ - 4, [4]), t.fill()), t.fillStyle = "#333", t.beginPath(), t.moveTo(C + _ * 0.2, -_ * 0.6), t.lineTo(C + _ * 0.8, -_ * 0.6), t.lineTo(C + _ * 0.5, -_ * 0.3), t.fill();
    }
    e.onDrawTitle && e.onDrawTitle(t);
  }
  l && (e.onBounding && e.onBounding(c), p == LiteGraph.TRANSPARENT_TITLE && (c[1] -= o, c[3] += o), t.lineWidth = 1, t.globalAlpha = 0.8, t.beginPath(), u == LiteGraph.BOX_SHAPE ? t.rect(
    -6 + c[0],
    -6 + c[1],
    12 + c[2],
    12 + c[3]
  ) : u == LiteGraph.ROUND_SHAPE || u == LiteGraph.CARD_SHAPE && e.flags.collapsed ? t.roundRect(
    -6 + c[0],
    -6 + c[1],
    12 + c[2],
    12 + c[3],
    [this.round_radius * 2]
  ) : u == LiteGraph.CARD_SHAPE ? t.roundRect(
    -6 + c[0],
    -6 + c[1],
    12 + c[2],
    12 + c[3],
    [this.round_radius * 2, 2, this.round_radius * 2, 2]
  ) : u == LiteGraph.CIRCLE_SHAPE && t.arc(
    r[0] * 0.5,
    r[1] * 0.5,
    r[0] * 0.5 + 6,
    0,
    Math.PI * 2
  ), t.strokeStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR, t.stroke(), t.strokeStyle = n, t.globalAlpha = 1), e.execute_triggered > 0 && e.execute_triggered--, e.action_triggered > 0 && e.action_triggered--;
};
var margin_area = new Float32Array(4), link_bounding = new Float32Array(4), tempA = new Float32Array(2), tempB = new Float32Array(2);
LGraphCanvas.prototype.drawConnections = function(e) {
  var t = LiteGraph.getTime(), r = this.visible_area;
  margin_area[0] = r[0] - 20, margin_area[1] = r[1] - 20, margin_area[2] = r[2] + 40, margin_area[3] = r[3] + 40, e.lineWidth = this.connections_width, e.fillStyle = "#AAA", e.strokeStyle = "#AAA", e.globalAlpha = this.editor_alpha;
  for (var n = this.graph._nodes, s = 0, l = n.length; s < l; ++s) {
    var a = n[s];
    if (!(!a.inputs || !a.inputs.length))
      for (var o = 0; o < a.inputs.length; ++o) {
        var h = a.inputs[o];
        if (!(!h || h.link == null)) {
          var u = h.link, p = this.graph.links[u];
          if (p) {
            var f = this.graph.getNodeById(p.origin_id);
            if (f != null) {
              var c = p.origin_slot, g = null;
              c == -1 ? g = [
                f.pos[0] + 10,
                f.pos[1] + 10
              ] : g = f.getConnectionPos(
                !1,
                c,
                tempA
              );
              var d = a.getConnectionPos(!0, o, tempB);
              if (link_bounding[0] = g[0], link_bounding[1] = g[1], link_bounding[2] = d[0] - g[0], link_bounding[3] = d[1] - g[1], link_bounding[2] < 0 && (link_bounding[0] += link_bounding[2], link_bounding[2] = Math.abs(link_bounding[2])), link_bounding[3] < 0 && (link_bounding[1] += link_bounding[3], link_bounding[3] = Math.abs(link_bounding[3])), !!overlapBounding(link_bounding, margin_area)) {
                var G = f.outputs[c], L = a.inputs[o];
                if (!(!G || !L)) {
                  var m = G.dir || (f.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT), b = L.dir || (a.horizontal ? LiteGraph.UP : LiteGraph.LEFT);
                  if (this.renderLink(
                    e,
                    g,
                    d,
                    p,
                    !1,
                    0,
                    null,
                    m,
                    b
                  ), p && p._last_time && t - p._last_time < 1e3) {
                    var _ = 2 - (t - p._last_time) * 2e-3, C = e.globalAlpha;
                    e.globalAlpha = C * _, this.renderLink(
                      e,
                      g,
                      d,
                      p,
                      !0,
                      _,
                      "white",
                      m,
                      b
                    ), e.globalAlpha = C;
                  }
                }
              }
            }
          }
        }
      }
  }
  e.globalAlpha = 1;
};
LGraphCanvas.prototype.renderLink = function(e, t, r, n, s, l, a, o, h, u) {
  n && this.visible_links.push(n), !a && n && (a = n.color || LGraphCanvas.link_type_colors[n.type]), a || (a = this.default_link_color), n != null && this.highlighted_links[n.id] && (a = "#FFF"), o = o || LiteGraph.RIGHT, h = h || LiteGraph.LEFT;
  var p = distance(t, r);
  this.render_connections_border && this.ds.scale > 0.6 && (e.lineWidth = this.connections_width + 4), e.lineJoin = "round", u = u || 1, u > 1 && (e.lineWidth = 0.5), e.beginPath();
  for (var f = 0; f < u; f += 1) {
    var c = (f - (u - 1) * 0.5) * 5;
    if (this.links_render_mode == LiteGraph.SPLINE_LINK) {
      e.moveTo(t[0], t[1] + c);
      var g = 0, d = 0, G = 0, L = 0;
      switch (o) {
        case LiteGraph.LEFT:
          g = p * -0.25;
          break;
        case LiteGraph.RIGHT:
          g = p * 0.25;
          break;
        case LiteGraph.UP:
          d = p * -0.25;
          break;
        case LiteGraph.DOWN:
          d = p * 0.25;
          break;
      }
      switch (h) {
        case LiteGraph.LEFT:
          G = p * -0.25;
          break;
        case LiteGraph.RIGHT:
          G = p * 0.25;
          break;
        case LiteGraph.UP:
          L = p * -0.25;
          break;
        case LiteGraph.DOWN:
          L = p * 0.25;
          break;
      }
      e.bezierCurveTo(
        t[0] + g,
        t[1] + d + c,
        r[0] + G,
        r[1] + L + c,
        r[0],
        r[1] + c
      );
    } else if (this.links_render_mode == LiteGraph.LINEAR_LINK) {
      e.moveTo(t[0], t[1] + c);
      var g = 0, d = 0, G = 0, L = 0;
      switch (o) {
        case LiteGraph.LEFT:
          g = -1;
          break;
        case LiteGraph.RIGHT:
          g = 1;
          break;
        case LiteGraph.UP:
          d = -1;
          break;
        case LiteGraph.DOWN:
          d = 1;
          break;
      }
      switch (h) {
        case LiteGraph.LEFT:
          G = -1;
          break;
        case LiteGraph.RIGHT:
          G = 1;
          break;
        case LiteGraph.UP:
          L = -1;
          break;
        case LiteGraph.DOWN:
          L = 1;
          break;
      }
      var m = 15;
      e.lineTo(
        t[0] + g * m,
        t[1] + d * m + c
      ), e.lineTo(
        r[0] + G * m,
        r[1] + L * m + c
      ), e.lineTo(r[0], r[1] + c);
    } else if (this.links_render_mode == LiteGraph.STRAIGHT_LINK) {
      e.moveTo(t[0], t[1]);
      var b = t[0], _ = t[1], C = r[0], N = r[1];
      o == LiteGraph.RIGHT ? b += 10 : _ += 10, h == LiteGraph.LEFT ? C -= 10 : N -= 10, e.lineTo(b, _), e.lineTo((b + C) * 0.5, _), e.lineTo((b + C) * 0.5, N), e.lineTo(C, N), e.lineTo(r[0], r[1]);
    } else
      return;
  }
  this.render_connections_border && this.ds.scale > 0.6 && !s && (e.strokeStyle = "rgba(0,0,0,0.5)", e.stroke()), e.lineWidth = this.connections_width, e.fillStyle = e.strokeStyle = a, e.stroke();
  var I = this.computeConnectionPoint(t, r, 0.5, o, h);
  if (n && n._pos && (n._pos[0] = I[0], n._pos[1] = I[1]), this.ds.scale >= 0.6 && this.highquality_render && h != LiteGraph.CENTER) {
    if (this.render_connection_arrows) {
      var D = this.computeConnectionPoint(
        t,
        r,
        0.25,
        o,
        h
      ), P = this.computeConnectionPoint(
        t,
        r,
        0.26,
        o,
        h
      ), A = this.computeConnectionPoint(
        t,
        r,
        0.75,
        o,
        h
      ), k = this.computeConnectionPoint(
        t,
        r,
        0.76,
        o,
        h
      ), E = 0, O = 0;
      this.render_curved_connections ? (E = -Math.atan2(P[0] - D[0], P[1] - D[1]), O = -Math.atan2(k[0] - A[0], k[1] - A[1])) : O = E = r[1] > t[1] ? 0 : Math.PI, e.save(), e.translate(D[0], D[1]), e.rotate(E), e.beginPath(), e.moveTo(-5, -3), e.lineTo(0, 7), e.lineTo(5, -3), e.fill(), e.restore(), e.save(), e.translate(A[0], A[1]), e.rotate(O), e.beginPath(), e.moveTo(-5, -3), e.lineTo(0, 7), e.lineTo(5, -3), e.fill(), e.restore();
    }
    e.beginPath(), e.arc(I[0], I[1], 5, 0, Math.PI * 2), e.fill();
  }
  if (l) {
    e.fillStyle = a;
    for (var f = 0; f < 5; ++f) {
      var T = (LiteGraph.getTime() * 1e-3 + f * 0.2) % 1, I = this.computeConnectionPoint(
        t,
        r,
        T,
        o,
        h
      );
      e.beginPath(), e.arc(I[0], I[1], 5, 0, 2 * Math.PI), e.fill();
    }
  }
};
LGraphCanvas.prototype.computeConnectionPoint = function(e, t, r, n, s) {
  n = n || LiteGraph.RIGHT, s = s || LiteGraph.LEFT;
  var l = distance(e, t), a = e, o = [e[0], e[1]], h = [t[0], t[1]], u = t;
  switch (n) {
    case LiteGraph.LEFT:
      o[0] += l * -0.25;
      break;
    case LiteGraph.RIGHT:
      o[0] += l * 0.25;
      break;
    case LiteGraph.UP:
      o[1] += l * -0.25;
      break;
    case LiteGraph.DOWN:
      o[1] += l * 0.25;
      break;
  }
  switch (s) {
    case LiteGraph.LEFT:
      h[0] += l * -0.25;
      break;
    case LiteGraph.RIGHT:
      h[0] += l * 0.25;
      break;
    case LiteGraph.UP:
      h[1] += l * -0.25;
      break;
    case LiteGraph.DOWN:
      h[1] += l * 0.25;
      break;
  }
  var p = (1 - r) * (1 - r) * (1 - r), f = 3 * ((1 - r) * (1 - r)) * r, c = 3 * (1 - r) * (r * r), g = r * r * r, d = p * a[0] + f * o[0] + c * h[0] + g * u[0], G = p * a[1] + f * o[1] + c * h[1] + g * u[1];
  return [d, G];
};
LGraphCanvas.prototype.drawExecutionOrder = function(e) {
  e.shadowColor = "transparent", e.globalAlpha = 0.25, e.textAlign = "center", e.strokeStyle = "white", e.globalAlpha = 0.75;
  for (var t = this.visible_nodes, r = 0; r < t.length; ++r) {
    var n = t[r];
    e.fillStyle = "black", e.fillRect(
      n.pos[0] - LiteGraph.NODE_TITLE_HEIGHT,
      n.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
      LiteGraph.NODE_TITLE_HEIGHT,
      LiteGraph.NODE_TITLE_HEIGHT
    ), n.order == 0 && e.strokeRect(
      n.pos[0] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
      n.pos[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
      LiteGraph.NODE_TITLE_HEIGHT,
      LiteGraph.NODE_TITLE_HEIGHT
    ), e.fillStyle = "#FFF", e.fillText(
      n.order,
      n.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * -0.5,
      n.pos[1] - 6
    );
  }
  e.globalAlpha = 1;
};
LGraphCanvas.prototype.drawNodeWidgets = function(e, t, r, n) {
  if (!e.widgets || !e.widgets.length)
    return 0;
  var s = e.size[0], l = e.widgets;
  t += 2;
  var a = LiteGraph.NODE_WIDGET_HEIGHT, o = this.ds.scale > 0.5;
  r.save(), r.globalAlpha = this.editor_alpha;
  for (var h = LiteGraph.WIDGET_OUTLINE_COLOR, u = LiteGraph.WIDGET_BGCOLOR, p = LiteGraph.WIDGET_TEXT_COLOR, f = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR, c = 15, g = 0; g < l.length; ++g) {
    var d = l[g], G = t;
    d.y && (G = d.y), d.last_y = G, r.strokeStyle = h, r.fillStyle = "#222", r.textAlign = "left", d.disabled && (r.globalAlpha *= 0.5);
    var L = d.width || s;
    switch (d.type) {
      case "button":
        r.fillStyle = u, d.clicked && (r.fillStyle = "#AAA", d.clicked = !1, this.dirty_canvas = !0), r.fillRect(c, G, L - c * 2, a), o && !d.disabled && r.strokeRect(c, G, L - c * 2, a), o && (r.textAlign = "center", r.fillStyle = p, r.fillText(d.label || d.name, L * 0.5, G + a * 0.7));
        break;
      case "toggle":
        if (r.textAlign = "left", r.strokeStyle = h, r.fillStyle = u, r.beginPath(), o ? r.roundRect(c, G, L - c * 2, a, [a * 0.5]) : r.rect(c, G, L - c * 2, a), r.fill(), o && !d.disabled && r.stroke(), r.fillStyle = d.value ? "#89A" : "#333", r.beginPath(), r.arc(L - c * 2, G + a * 0.5, a * 0.36, 0, Math.PI * 2), r.fill(), o) {
          r.fillStyle = f;
          const I = d.label || d.name;
          I != null && r.fillText(I, c * 2, G + a * 0.7), r.fillStyle = d.value ? p : f, r.textAlign = "right", r.fillText(
            d.value ? d.options.on || "true" : d.options.off || "false",
            L - 40,
            G + a * 0.7
          );
        }
        break;
      case "slider":
        r.fillStyle = u, r.fillRect(c, G, L - c * 2, a);
        var m = d.options.max - d.options.min, b = (d.value - d.options.min) / m;
        if (b < 0 && (b = 0), b > 1 && (b = 1), r.fillStyle = d.options.hasOwnProperty("slider_color") ? d.options.slider_color : n == d ? "#89A" : "#678", r.fillRect(c, G, b * (L - c * 2), a), o && !d.disabled && r.strokeRect(c, G, L - c * 2, a), d.marker) {
          var _ = (d.marker - d.options.min) / m;
          _ < 0 && (_ = 0), _ > 1 && (_ = 1), r.fillStyle = d.options.hasOwnProperty("marker_color") ? d.options.marker_color : "#AA9", r.fillRect(c + _ * (L - c * 2), G, 2, a);
        }
        o && (r.textAlign = "center", r.fillStyle = p, r.fillText(
          d.label || d.name + "  " + Number(d.value).toFixed(
            d.options.precision != null ? d.options.precision : 3
          ),
          L * 0.5,
          G + a * 0.7
        ));
        break;
      case "number":
      case "combo":
        if (r.textAlign = "left", r.strokeStyle = h, r.fillStyle = u, r.beginPath(), o ? r.roundRect(c, G, L - c * 2, a, [a * 0.5]) : r.rect(c, G, L - c * 2, a), r.fill(), o)
          if (d.disabled || r.stroke(), r.fillStyle = p, d.disabled || (r.beginPath(), r.moveTo(c + 16, G + 5), r.lineTo(c + 6, G + a * 0.5), r.lineTo(c + 16, G + a - 5), r.fill(), r.beginPath(), r.moveTo(L - c - 16, G + 5), r.lineTo(L - c - 6, G + a * 0.5), r.lineTo(L - c - 16, G + a - 5), r.fill()), r.fillStyle = f, r.fillText(d.label || d.name, c * 2 + 5, G + a * 0.7), r.fillStyle = p, r.textAlign = "right", d.type == "number")
            r.fillText(
              Number(d.value).toFixed(
                d.options.precision !== void 0 ? d.options.precision : 3
              ),
              L - c * 2 - 20,
              G + a * 0.7
            );
          else {
            var C = d.value;
            if (d.options.values) {
              var N = d.options.values;
              N.constructor === Function && (N = N()), N && N.constructor !== Array && (C = N[d.value]);
            }
            r.fillText(
              C,
              L - c * 2 - 20,
              G + a * 0.7
            );
          }
        break;
      case "string":
      case "text":
        if (r.textAlign = "left", r.strokeStyle = h, r.fillStyle = u, r.beginPath(), o ? r.roundRect(c, G, L - c * 2, a, [a * 0.5]) : r.rect(c, G, L - c * 2, a), r.fill(), o) {
          d.disabled || r.stroke(), r.save(), r.beginPath(), r.rect(c, G, L - c * 2, a), r.clip(), r.fillStyle = f;
          const I = d.label || d.name;
          I != null && r.fillText(I, c * 2, G + a * 0.7), r.fillStyle = p, r.textAlign = "right", r.fillText(String(d.value).substr(0, 30), L - c * 2, G + a * 0.7), r.restore();
        }
        break;
      default:
        d.draw && d.draw(r, e, L, G, a);
        break;
    }
    t += (d.computeSize ? d.computeSize(L)[1] : a) + 4, r.globalAlpha = this.editor_alpha;
  }
  r.restore(), r.textAlign = "left";
};
LGraphCanvas.prototype.processNodeWidgets = function(node, pos, event, active_widget) {
  if (!node.widgets || !node.widgets.length || !this.allow_interaction && !node.flags.allow_interaction)
    return null;
  for (var x = pos[0] - node.pos[0], y = pos[1] - node.pos[1], width = node.size[0], deltaX = event.deltaX || event.deltax || 0, that = this, ref_window = this.getCanvasWindow(), i = 0; i < node.widgets.length; ++i) {
    var w = node.widgets[i];
    if (!(!w || w.disabled)) {
      var widget_height = w.computeSize ? w.computeSize(width)[1] : LiteGraph.NODE_WIDGET_HEIGHT, widget_width = w.width || width;
      if (!(w != active_widget && (x < 6 || x > widget_width - 12 || y < w.last_y || y > w.last_y + widget_height || w.last_y === void 0))) {
        var old_value = w.value;
        switch (w.type) {
          case "button":
            event.type === LiteGraph.pointerevents_method + "down" && (w.callback && setTimeout(function() {
              w.callback(w, that, node, pos, event);
            }, 20), w.clicked = !0, this.dirty_canvas = !0);
            break;
          case "slider":
            var old_value = w.value, nvalue = clamp((x - 15) / (widget_width - 30), 0, 1);
            if (w.options.read_only) break;
            w.value = w.options.min + (w.options.max - w.options.min) * nvalue, old_value != w.value && setTimeout(function() {
              inner_value_change(w, w.value);
            }, 20), this.dirty_canvas = !0;
            break;
          case "number":
          case "combo":
            var old_value = w.value, delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0, allow_scroll = !0;
            if (delta && x > -3 && x < widget_width + 3 && (allow_scroll = !1), allow_scroll && event.type == LiteGraph.pointerevents_method + "move" && w.type == "number")
              deltaX && (w.value += deltaX * 0.1 * (w.options.step || 1)), w.options.min != null && w.value < w.options.min && (w.value = w.options.min), w.options.max != null && w.value > w.options.max && (w.value = w.options.max);
            else if (event.type == LiteGraph.pointerevents_method + "down") {
              var values = w.options.values;
              values && values.constructor === Function && (values = w.options.values(w, node));
              var values_list = null;
              w.type != "number" && (values_list = values.constructor === Array ? values : Object.keys(values));
              var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
              if (w.type == "number")
                w.value += delta * 0.1 * (w.options.step || 1), w.options.min != null && w.value < w.options.min && (w.value = w.options.min), w.options.max != null && w.value > w.options.max && (w.value = w.options.max);
              else if (delta) {
                var index = -1;
                this.last_mouseclick = 0, values.constructor === Object ? index = values_list.indexOf(String(w.value)) + delta : index = values_list.indexOf(w.value) + delta, index >= values_list.length && (index = values_list.length - 1), index < 0 && (index = 0), values.constructor === Array ? w.value = values[index] : w.value = index;
              } else {
                let t = function(r, n, s) {
                  return values != values_list && (r = text_values.indexOf(r)), this.value = r, inner_value_change(this, r), that.dirty_canvas = !0, !1;
                };
                var text_values = values != values_list ? Object.values(values) : values;
                new LiteGraph.ContextMenu(
                  text_values,
                  {
                    scale: Math.max(1, this.ds.scale),
                    event,
                    className: "dark",
                    callback: t.bind(w)
                  },
                  ref_window
                );
              }
            } else if (event.type == LiteGraph.pointerevents_method + "up" && w.type == "number") {
              var delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
              event.click_time < 200 && delta == 0 && this.prompt(
                "Value",
                w.value,
                (function(v) {
                  if (/^[0-9+\-*/()\s]+|\d+\.\d+$/.test(v))
                    try {
                      v = eval(v);
                    } catch (e) {
                      console.log(e);
                    }
                  this.value = Number(v), inner_value_change(this, this.value);
                }).bind(w),
                event
              );
            }
            old_value != w.value && setTimeout(
              (function() {
                inner_value_change(this, this.value);
              }).bind(w),
              20
            ), this.dirty_canvas = !0;
            break;
          case "toggle":
            event.type == LiteGraph.pointerevents_method + "down" && (w.value = !w.value, setTimeout(function() {
              inner_value_change(w, w.value);
            }, 20));
            break;
          case "string":
          case "text":
            event.type == LiteGraph.pointerevents_method + "down" && this.prompt(
              "Value",
              w.value,
              (function(e) {
                inner_value_change(this, e);
              }).bind(w),
              event,
              w.options ? w.options.multiline : !1
            );
            break;
          default:
            w.mouse && (this.dirty_canvas = w.mouse(event, [x, y], node));
            break;
        }
        return old_value != w.value && (node.onWidgetChanged && node.onWidgetChanged(w.name, w.value, old_value, w), node.graph._version++), w;
      }
    }
  }
  function inner_value_change(e, t) {
    e.type == "number" && (t = Number(t)), e.value = t, e.options && e.options.property && node.properties[e.options.property] !== void 0 && node.setProperty(e.options.property, t), e.callback && e.callback(e.value, that, node, pos, event);
  }
  return null;
};
LGraphCanvas.prototype.drawGroups = function(e, t) {
  if (this.graph) {
    var r = this.graph._groups;
    t.save(), t.globalAlpha = 0.5 * this.editor_alpha;
    for (var n = 0; n < r.length; ++n) {
      var s = r[n];
      if (overlapBounding(this.visible_area, s._bounding)) {
        t.fillStyle = s.color || "#335", t.strokeStyle = s.color || "#335";
        var l = s._pos, a = s._size;
        t.globalAlpha = 0.25 * this.editor_alpha, t.beginPath(), t.rect(l[0] + 0.5, l[1] + 0.5, a[0], a[1]), t.fill(), t.globalAlpha = this.editor_alpha, t.stroke(), t.beginPath(), t.moveTo(l[0] + a[0], l[1] + a[1]), t.lineTo(l[0] + a[0] - 10, l[1] + a[1]), t.lineTo(l[0] + a[0], l[1] + a[1] - 10), t.fill();
        var o = s.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE;
        t.font = o + "px Arial", t.textAlign = "left", t.fillText(s.title, l[0] + 4, l[1] + o);
      }
    }
    t.restore();
  }
};
LGraphCanvas.prototype.adjustNodesSize = function() {
  for (var e = this.graph._nodes, t = 0; t < e.length; ++t)
    e[t].size = e[t].computeSize();
  this.setDirty(!0, !0);
};
LGraphCanvas.prototype.resize = function(e, t) {
  if (!e && !t) {
    var r = this.canvas.parentNode;
    e = r.offsetWidth, t = r.offsetHeight;
  }
  this.canvas.width == e && this.canvas.height == t || (this.canvas.width = e, this.canvas.height = t, this.bgcanvas.width = this.canvas.width, this.bgcanvas.height = this.canvas.height, this.setDirty(!0, !0));
};
LGraphCanvas.prototype.switchLiveMode = function(e) {
  if (!e) {
    this.live_mode = !this.live_mode, this.dirty_canvas = !0, this.dirty_bgcanvas = !0;
    return;
  }
  var t = this, r = this.live_mode ? 1.1 : 0.9;
  this.live_mode && (this.live_mode = !1, this.editor_alpha = 0.1);
  var n = setInterval(function() {
    t.editor_alpha *= r, t.dirty_canvas = !0, t.dirty_bgcanvas = !0, r < 1 && t.editor_alpha < 0.01 && (clearInterval(n), r < 1 && (t.live_mode = !0)), r > 1 && t.editor_alpha > 0.99 && (clearInterval(n), t.editor_alpha = 1);
  }, 1);
};
LGraphCanvas.prototype.onNodeSelectionChange = function(e) {
};
LGraphCanvas.onGroupAdd = function(e, t, r) {
  var n = LGraphCanvas.active_canvas;
  n.getCanvasWindow();
  var s = new LiteGraph.LGraphGroup();
  s.pos = n.convertEventToCanvasOffset(r), n.graph.add(s);
};
LGraphCanvas.getBoundaryNodes = function(e) {
  let t = null, r = null, n = null, s = null;
  for (const l in e) {
    const a = e[l], [o, h] = a.pos, [u, p] = a.size;
    (t === null || h < t.pos[1]) && (t = a), (r === null || o + u > r.pos[0] + r.size[0]) && (r = a), (n === null || h + p > n.pos[1] + n.size[1]) && (n = a), (s === null || o < s.pos[0]) && (s = a);
  }
  return {
    top: t,
    right: r,
    bottom: n,
    left: s
  };
};
LGraphCanvas.prototype.boundaryNodesForSelection = function() {
  return LGraphCanvas.getBoundaryNodes(Object.values(this.selected_nodes));
};
LGraphCanvas.alignNodes = function(e, t, r) {
  if (!e)
    return;
  const n = LGraphCanvas.active_canvas;
  let s = [];
  r === void 0 ? s = LGraphCanvas.getBoundaryNodes(e) : s = {
    top: r,
    right: r,
    bottom: r,
    left: r
  };
  for (const [l, a] of Object.entries(n.selected_nodes))
    switch (t) {
      case "right":
        a.pos[0] = s.right.pos[0] + s.right.size[0] - a.size[0];
        break;
      case "left":
        a.pos[0] = s.left.pos[0];
        break;
      case "top":
        a.pos[1] = s.top.pos[1];
        break;
      case "bottom":
        a.pos[1] = s.bottom.pos[1] + s.bottom.size[1] - a.size[1];
        break;
    }
  n.dirty_canvas = !0, n.dirty_bgcanvas = !0;
};
LGraphCanvas.onNodeAlign = function(e, t, r, n, s) {
  new LiteGraph.ContextMenu(["Top", "Bottom", "Left", "Right"], {
    event: r,
    callback: l,
    parentMenu: n
  });
  function l(a) {
    LGraphCanvas.alignNodes(LGraphCanvas.active_canvas.selected_nodes, a.toLowerCase(), s);
  }
};
LGraphCanvas.onGroupAlign = function(e, t, r, n) {
  new LiteGraph.ContextMenu(["Top", "Bottom", "Left", "Right"], {
    event: r,
    callback: s,
    parentMenu: n
  });
  function s(l) {
    LGraphCanvas.alignNodes(LGraphCanvas.active_canvas.selected_nodes, l.toLowerCase());
  }
};
LGraphCanvas.onMenuAdd = function(e, t, r, n, s) {
  var l = LGraphCanvas.active_canvas, a = l.getCanvasWindow(), o = l.graph;
  if (!o)
    return;
  function h(u, p) {
    var f = LiteGraph.getNodeTypesCategories(l.filter || o.filter).filter(function(d) {
      return d.startsWith(u);
    }), c = [];
    f.map(function(d) {
      if (d) {
        var G = new RegExp("^(" + u + ")"), L = d.replace(G, "").split("/")[0], m = u === "" ? L + "/" : u + L + "/", b = L;
        b.indexOf("::") != -1 && (b = b.split("::")[1]);
        var _ = c.findIndex(function(C) {
          return C.value === m;
        });
        _ === -1 && c.push({ value: m, content: b, has_submenu: !0, callback: function(C, N, I, D) {
          h(C.value, D);
        } });
      }
    });
    var g = LiteGraph.getNodeTypesInCategory(u.slice(0, -1), l.filter || o.filter);
    g.map(function(d) {
      if (!d.skip_list) {
        var G = {
          value: d.type,
          content: d.title,
          has_submenu: !1,
          callback: function(L, m, b, _) {
            var C = _.getFirstEvent();
            l.graph.beforeChange();
            var N = LiteGraph.createNode(L.value);
            N && (N.pos = l.convertEventToCanvasOffset(C), l.graph.add(N)), s && s(N), l.graph.afterChange();
          }
        };
        c.push(G);
      }
    }), new LiteGraph.ContextMenu(c, { event: r, parentMenu: p }, a);
  }
  return h("", n), !1;
};
LGraphCanvas.onMenuCollapseAll = function() {
};
LGraphCanvas.onMenuNodeEdit = function() {
};
LGraphCanvas.showMenuNodeOptionalInputs = function(e, h, r, n, s) {
  if (!s)
    return;
  var l = this, a = LGraphCanvas.active_canvas, o = a.getCanvasWindow(), h = s.optional_inputs;
  s.onGetInputs && (h = s.onGetInputs());
  var u = [];
  if (h)
    for (var p = 0; p < h.length; p++) {
      var f = h[p];
      if (!f) {
        u.push(null);
        continue;
      }
      var c = f[0];
      f[2] || (f[2] = {}), f[2].label && (c = f[2].label), f[2].removable = !0;
      var g = { content: c, value: f };
      f[1] == LiteGraph.ACTION && (g.className = "event"), u.push(g);
    }
  if (s.onMenuNodeInputs) {
    var d = s.onMenuNodeInputs(u);
    d && (u = d);
  }
  if (!u.length) {
    console.log("no input entries");
    return;
  }
  new LiteGraph.ContextMenu(
    u,
    {
      event: r,
      callback: G,
      parentMenu: n,
      node: s
    },
    o
  );
  function G(L, m, b) {
    s && (L.callback && L.callback.call(l, s, L, m, b), L.value && (s.graph.beforeChange(), s.addInput(L.value[0], L.value[1], L.value[2]), s.onNodeInputAdd && s.onNodeInputAdd(L.value), s.setDirtyCanvas(!0, !0), s.graph.afterChange()));
  }
  return !1;
};
LGraphCanvas.showMenuNodeOptionalOutputs = function(e, h, r, n, s) {
  if (!s)
    return;
  var l = this, a = LGraphCanvas.active_canvas, o = a.getCanvasWindow(), h = s.optional_outputs;
  s.onGetOutputs && (h = s.onGetOutputs());
  var u = [];
  if (h)
    for (var p = 0; p < h.length; p++) {
      var f = h[p];
      if (!f) {
        u.push(null);
        continue;
      }
      if (!(s.flags && s.flags.skip_repeated_outputs && s.findOutputSlot(f[0]) != -1)) {
        var c = f[0];
        f[2] || (f[2] = {}), f[2].label && (c = f[2].label), f[2].removable = !0;
        var g = { content: c, value: f };
        f[1] == LiteGraph.EVENT && (g.className = "event"), u.push(g);
      }
    }
  if (this.onMenuNodeOutputs && (u = this.onMenuNodeOutputs(u)), LiteGraph.do_add_triggers_slots && s.findOutputSlot("onExecuted") == -1 && u.push({ content: "On Executed", value: ["onExecuted", LiteGraph.EVENT, { nameLocked: !0 }], className: "event" }), s.onMenuNodeOutputs) {
    var d = s.onMenuNodeOutputs(u);
    d && (u = d);
  }
  if (!u.length)
    return;
  new LiteGraph.ContextMenu(
    u,
    {
      event: r,
      callback: G,
      parentMenu: n,
      node: s
    },
    o
  );
  function G(L, m, b) {
    if (s && (L.callback && L.callback.call(l, s, L, m, b), !!L.value)) {
      var _ = L.value[1];
      if (_ && (_.constructor === Object || _.constructor === Array)) {
        var C = [];
        for (var N in _)
          C.push({ content: N, value: _[N] });
        return new LiteGraph.ContextMenu(C, {
          event: m,
          callback: G,
          parentMenu: n,
          node: s
        }), !1;
      } else
        s.graph.beforeChange(), s.addOutput(L.value[0], L.value[1], L.value[2]), s.onNodeOutputAdd && s.onNodeOutputAdd(L.value), s.setDirtyCanvas(!0, !0), s.graph.afterChange();
    }
  }
  return !1;
};
LGraphCanvas.onShowMenuNodeProperties = function(e, t, r, n, s) {
  if (!s || !s.properties)
    return;
  var l = LGraphCanvas.active_canvas, a = l.getCanvasWindow(), o = [];
  for (var h in s.properties) {
    var e = s.properties[h] !== void 0 ? s.properties[h] : " ";
    typeof e == "object" && (e = JSON.stringify(e));
    var u = s.getPropertyInfo(h);
    (u.type == "enum" || u.type == "combo") && (e = LGraphCanvas.getPropertyPrintableValue(e, u.values)), e = LGraphCanvas.decodeHTML(e), o.push({
      content: "<span class='property_name'>" + (u.label ? u.label : h) + "</span><span class='property_value'>" + e + "</span>",
      value: h
    });
  }
  if (!o.length)
    return;
  new LiteGraph.ContextMenu(
    o,
    {
      event: r,
      callback: p,
      parentMenu: n,
      allow_html: !0,
      node: s
    },
    a
  );
  function p(f, c, g, d) {
    if (s) {
      var G = this.getBoundingClientRect();
      l.showEditPropertyValue(s, f.value, {
        position: [G.left, G.top]
      });
    }
  }
  return !1;
};
LGraphCanvas.decodeHTML = function(e) {
  var t = document.createElement("div");
  return t.innerText = e, t.innerHTML;
};
LGraphCanvas.onMenuResizeNode = function(e, t, r, n, s) {
  if (s) {
    var l = function(h) {
      h.size = h.computeSize(), h.onResize && h.onResize(h.size);
    }, a = LGraphCanvas.active_canvas;
    if (!a.selected_nodes || Object.keys(a.selected_nodes).length <= 1)
      l(s);
    else
      for (var o in a.selected_nodes)
        l(a.selected_nodes[o]);
    s.setDirtyCanvas(!0, !0);
  }
};
LGraphCanvas.prototype.showLinkMenu = function(e, t) {
  var r = this, n = r.graph.getNodeById(e.origin_id), s = r.graph.getNodeById(e.target_id), l = !1;
  n && n.outputs && n.outputs[e.origin_slot] && (l = n.outputs[e.origin_slot].type);
  var a = !1;
  s && s.outputs && s.outputs[e.target_slot] && (a = s.inputs[e.target_slot].type);
  var o = ["Add Node", null, "Delete", null], h = new LiteGraph.ContextMenu(o, {
    event: t,
    title: e.data != null ? e.data.constructor.name : null,
    callback: u
  });
  function u(p, f, c) {
    switch (p) {
      case "Add Node":
        LGraphCanvas.onMenuAdd(null, null, c, h, function(g) {
          !g.inputs || !g.inputs.length || !g.outputs || !g.outputs.length || n.connectByType(e.origin_slot, g, l) && (g.connectByType(e.target_slot, s, a), g.pos[0] -= g.size[0] * 0.5);
        });
        break;
      case "Delete":
        r.graph.removeLink(e.id);
        break;
    }
  }
  return !1;
};
LGraphCanvas.prototype.createDefaultNodeForSlot = function(t) {
  var t = t || {}, r = Object.assign(
    {
      nodeFrom: null,
      slotFrom: null,
      nodeTo: null,
      slotTo: null,
      position: [],
      nodeType: null,
      posAdd: [0, 0],
      posSizeFix: [0, 0]
      // alpha, adjust the position x,y based on the new node size w,h
    },
    t
  ), n = this, s = r.nodeFrom && r.slotFrom !== null, l = !s && r.nodeTo && r.slotTo !== null;
  if (!s && !l)
    return console.warn("No data passed to createDefaultNodeForSlot " + r.nodeFrom + " " + r.slotFrom + " " + r.nodeTo + " " + r.slotTo), !1;
  if (!r.nodeType)
    return console.warn("No type to createDefaultNodeForSlot"), !1;
  var a = s ? r.nodeFrom : r.nodeTo, o = s ? r.slotFrom : r.slotTo, h = !1;
  switch (typeof o) {
    case "string":
      h = s ? a.findOutputSlot(o, !1) : a.findInputSlot(o, !1), o = s ? a.outputs[o] : a.inputs[o];
      break;
    case "object":
      h = s ? a.findOutputSlot(o.name) : a.findInputSlot(o.name);
      break;
    case "number":
      h = o, o = s ? a.outputs[o] : a.inputs[o];
      break;
    case "undefined":
    default:
      return console.warn("Cant get slot information " + o), !1;
  }
  (o === !1 || h === !1) && console.warn("createDefaultNodeForSlot bad slotX " + o + " " + h);
  var u = o.type == LiteGraph.EVENT ? "_event_" : o.type, p = s ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
  if (p && p[u]) {
    if (o.link, nodeNewType = !1, typeof p[u] == "object" || Array.isArray(p[u])) {
      for (var f in p[u])
        if (r.nodeType == p[u][f] || r.nodeType == "AUTO") {
          nodeNewType = p[u][f];
          break;
        }
    } else
      (r.nodeType == p[u] || r.nodeType == "AUTO") && (nodeNewType = p[u]);
    if (nodeNewType) {
      var c = !1;
      typeof nodeNewType == "object" && nodeNewType.node && (c = nodeNewType, nodeNewType = nodeNewType.node);
      var g = LiteGraph.createNode(nodeNewType);
      if (g) {
        if (c) {
          if (c.properties)
            for (var d in c.properties)
              g.addProperty(d, c.properties[d]);
          if (c.inputs) {
            g.inputs = [];
            for (var d in c.inputs)
              g.addOutput(
                c.inputs[d][0],
                c.inputs[d][1]
              );
          }
          if (c.outputs) {
            g.outputs = [];
            for (var d in c.outputs)
              g.addOutput(
                c.outputs[d][0],
                c.outputs[d][1]
              );
          }
          c.title && (g.title = c.title), c.json && g.configure(c.json);
        }
        return n.graph.add(g), g.pos = [
          r.position[0] + r.posAdd[0] + (r.posSizeFix[0] ? r.posSizeFix[0] * g.size[0] : 0),
          r.position[1] + r.posAdd[1] + (r.posSizeFix[1] ? r.posSizeFix[1] * g.size[1] : 0)
        ], s ? r.nodeFrom.connectByType(h, g, u) : r.nodeTo.connectByTypeOutput(h, g, u), !0;
      } else
        console.log("failed creating " + nodeNewType);
    }
  }
  return !1;
};
LGraphCanvas.prototype.showConnectionMenu = function(t) {
  var t = t || {}, r = Object.assign(
    {
      nodeFrom: null,
      slotFrom: null,
      nodeTo: null,
      slotTo: null,
      e: null
    },
    t
  ), n = this, s = r.nodeFrom && r.slotFrom, l = !s && r.nodeTo && r.slotTo;
  if (!s && !l)
    return console.warn("No data passed to showConnectionMenu"), !1;
  var a = s ? r.nodeFrom : r.nodeTo, o = s ? r.slotFrom : r.slotTo, h = !1;
  switch (typeof o) {
    case "string":
      h = s ? a.findOutputSlot(o, !1) : a.findInputSlot(o, !1), o = s ? a.outputs[o] : a.inputs[o];
      break;
    case "object":
      h = s ? a.findOutputSlot(o.name) : a.findInputSlot(o.name);
      break;
    case "number":
      h = o, o = s ? a.outputs[o] : a.inputs[o];
      break;
    default:
      return console.warn("Cant get slot information " + o), !1;
  }
  var u = ["Add Node", null];
  n.allow_searchbox && (u.push("Search"), u.push(null));
  var p = o.type == LiteGraph.EVENT ? "_event_" : o.type, f = s ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
  if (f && f[p])
    if (typeof f[p] == "object" || Array.isArray(f[p]))
      for (var c in f[p])
        u.push(f[p][c]);
    else
      u.push(f[p]);
  var g = new LiteGraph.ContextMenu(u, {
    event: r.e,
    title: (o && o.name != "" ? o.name + (p ? " | " : "") : "") + (o && p ? p : ""),
    callback: d
  });
  function d(G, L, m) {
    switch (G) {
      case "Add Node":
        LGraphCanvas.onMenuAdd(null, null, m, g, function(b) {
          s ? r.nodeFrom.connectByType(h, b, p) : r.nodeTo.connectByTypeOutput(h, b, p);
        });
        break;
      case "Search":
        s ? n.showSearchBox(m, { node_from: r.nodeFrom, slot_from: o, type_filter_in: p }) : n.showSearchBox(m, { node_to: r.nodeTo, slot_from: o, type_filter_out: p });
        break;
      default:
        n.createDefaultNodeForSlot(Object.assign(r, {
          position: [r.e.canvasX, r.e.canvasY],
          nodeType: G
        }));
        break;
    }
  }
  return !1;
};
LGraphCanvas.onShowPropertyEditor = function(e, t, r, n, s) {
  var l = e.property || "title", a = s[l], o = document.createElement("div");
  o.is_modified = !1, o.className = "graphdialog", o.innerHTML = "<span class='name'></span><input autofocus type='text' class='value'/><button>OK</button>", o.close = function() {
    o.parentNode && o.parentNode.removeChild(o);
  };
  var h = o.querySelector(".name");
  h.innerText = l;
  var u = o.querySelector(".value");
  u && (u.value = a, u.addEventListener("blur", function(_) {
    this.focus();
  }), u.addEventListener("keydown", function(_) {
    if (o.is_modified = !0, _.keyCode == 27)
      o.close();
    else if (_.keyCode == 13)
      m();
    else if (_.keyCode != 13 && _.target.localName != "textarea")
      return;
    _.preventDefault(), _.stopPropagation();
  }));
  var p = LGraphCanvas.active_canvas, f = p.canvas, c = f.getBoundingClientRect(), g = -20, d = -20;
  c && (g -= c.left, d -= c.top), event ? (o.style.left = event.clientX + g + "px", o.style.top = event.clientY + d + "px") : (o.style.left = f.width * 0.5 + g + "px", o.style.top = f.height * 0.5 + d + "px");
  var G = o.querySelector("button");
  G.addEventListener("click", m), f.parentNode.appendChild(o), u && u.focus();
  var L = null;
  o.addEventListener("mouseleave", function(_) {
    LiteGraph.dialog_close_on_mouse_leave && !o.is_modified && LiteGraph.dialog_close_on_mouse_leave && (L = setTimeout(o.close, LiteGraph.dialog_close_on_mouse_leave_delay));
  }), o.addEventListener("mouseenter", function(_) {
    LiteGraph.dialog_close_on_mouse_leave && L && clearTimeout(L);
  });
  function m() {
    u && b(u.value);
  }
  function b(_) {
    e.type == "Number" ? _ = Number(_) : e.type == "Boolean" && (_ = !!_), s[l] = _, o.parentNode && o.parentNode.removeChild(o), s.setDirtyCanvas(!0, !0);
  }
};
LGraphCanvas.prototype.prompt = function(e, t, r, n, s) {
  var l = this;
  e = e || "";
  var a = document.createElement("div");
  a.is_modified = !1, a.className = "graphdialog rounded", s ? a.innerHTML = "<span class='name'></span> <textarea autofocus class='value'></textarea><button class='rounded'>OK</button>" : a.innerHTML = "<span class='name'></span> <input autofocus type='text' class='value'/><button class='rounded'>OK</button>", a.close = function() {
    l.prompt_box = null, a.parentNode && a.parentNode.removeChild(a);
  };
  var o = LGraphCanvas.active_canvas, h = o.canvas;
  h.parentNode.appendChild(a), this.ds.scale > 1 && (a.style.transform = "scale(" + this.ds.scale + ")");
  var u = null, p = !1;
  LiteGraph.pointerListenerAdd(a, "leave", function(_) {
    p || LiteGraph.dialog_close_on_mouse_leave && !a.is_modified && LiteGraph.dialog_close_on_mouse_leave && (u = setTimeout(a.close, LiteGraph.dialog_close_on_mouse_leave_delay));
  }), LiteGraph.pointerListenerAdd(a, "enter", function(_) {
    LiteGraph.dialog_close_on_mouse_leave && u && clearTimeout(u);
  });
  var f = a.querySelectorAll("select");
  f && f.forEach(function(_) {
    _.addEventListener("click", function(C) {
      p++;
    }), _.addEventListener("blur", function(C) {
      p = 0;
    }), _.addEventListener("change", function(C) {
      p = -1;
    });
  }), l.prompt_box && l.prompt_box.close(), l.prompt_box = a;
  var c = a.querySelector(".name");
  c.innerText = e;
  var g = a.querySelector(".value");
  g.value = t, g.select();
  var d = g;
  d.addEventListener("keydown", function(_) {
    if (a.is_modified = !0, _.keyCode == 27)
      a.close();
    else if (_.keyCode == 13 && _.target.localName != "textarea")
      r && r(this.value), a.close();
    else
      return;
    _.preventDefault(), _.stopPropagation();
  });
  var G = a.querySelector("button");
  G.addEventListener("click", function(_) {
    r && r(d.value), l.setDirty(!0), a.close();
  });
  var L = h.getBoundingClientRect(), m = -20, b = -20;
  return L && (m -= L.left, b -= L.top), n ? (a.style.left = n.clientX + m + "px", a.style.top = n.clientY + b + "px") : (a.style.left = h.width * 0.5 + m + "px", a.style.top = h.height * 0.5 + b + "px"), setTimeout(function() {
    d.focus();
  }, 10), a;
};
LGraphCanvas.search_limit = -1;
LGraphCanvas.prototype.showSearchBox = function(e, t) {
  var r = {
    slot_from: null,
    node_from: null,
    node_to: null,
    do_type_filter: LiteGraph.search_filter_enabled,
    type_filter_in: !1,
    type_filter_out: !1,
    show_general_if_none_on_typefilter: !0,
    show_general_after_typefiltered: !0,
    hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave,
    show_all_if_empty: !0,
    show_all_on_open: LiteGraph.search_show_all_on_open
  };
  t = Object.assign(r, t || {});
  var n = this, s = LGraphCanvas.active_canvas, l = s.canvas, a = l.ownerDocument || document, o = document.createElement("div");
  if (o.className = "litegraph litesearchbox graphdialog rounded", o.innerHTML = "<span class='name'>Search</span> <input autofocus type='text' class='value rounded'/>", t.do_type_filter && (o.innerHTML += "<select class='slot_in_type_filter'><option value=''></option></select>", o.innerHTML += "<select class='slot_out_type_filter'><option value=''></option></select>"), o.innerHTML += "<div class='helper'></div>", a.fullscreenElement ? a.fullscreenElement.appendChild(o) : (a.body.appendChild(o), a.body.style.overflow = "hidden"), t.do_type_filter)
    var h = o.querySelector(".slot_in_type_filter"), u = o.querySelector(".slot_out_type_filter");
  if (o.close = function() {
    n.search_box = null, this.blur(), l.focus(), a.body.style.overflow = "", setTimeout(function() {
      n.canvas.focus();
    }, 20), o.parentNode && o.parentNode.removeChild(o);
  }, this.ds.scale > 1 && (o.style.transform = "scale(" + this.ds.scale + ")"), t.hide_on_mouse_leave) {
    var p = !1, f = null;
    LiteGraph.pointerListenerAdd(o, "enter", function(E) {
      f && (clearTimeout(f), f = null);
    }), LiteGraph.pointerListenerAdd(o, "leave", function(E) {
      p || (f = setTimeout(function() {
        o.close();
      }, typeof t.hide_on_mouse_leave == "number" ? t.hide_on_mouse_leave : 500));
    }), t.do_type_filter && (h.addEventListener("click", function(E) {
      p++;
    }), h.addEventListener("blur", function(E) {
      p = 0;
    }), h.addEventListener("change", function(E) {
      p = -1;
    }), u.addEventListener("click", function(E) {
      p++;
    }), u.addEventListener("blur", function(E) {
      p = 0;
    }), u.addEventListener("change", function(E) {
      p = -1;
    }));
  }
  n.search_box && n.search_box.close(), n.search_box = o;
  var c = o.querySelector(".helper"), g = null, d = null, G = null, L = o.querySelector("input");
  if (L && (L.addEventListener("blur", function(E) {
    n.search_box && this.focus();
  }), L.addEventListener("keydown", function(E) {
    if (E.keyCode == 38)
      A(!1);
    else if (E.keyCode == 40)
      A(!0);
    else if (E.keyCode == 27)
      o.close();
    else if (E.keyCode == 13)
      k(), G ? P(unescape(G.dataset.type)) : g ? P(g) : o.close();
    else {
      d && clearInterval(d), d = setTimeout(k, 10);
      return;
    }
    return E.preventDefault(), E.stopPropagation(), E.stopImmediatePropagation(), !0;
  })), t.do_type_filter) {
    if (h) {
      var m = LiteGraph.slot_types_in, b = m.length;
      (t.type_filter_in == LiteGraph.EVENT || t.type_filter_in == LiteGraph.ACTION) && (t.type_filter_in = "_event_");
      for (var _ = 0; _ < b; _++) {
        var C = document.createElement("option");
        C.value = m[_], C.innerHTML = m[_], h.appendChild(C), t.type_filter_in !== !1 && (t.type_filter_in + "").toLowerCase() == (m[_] + "").toLowerCase() && (C.selected = !0);
      }
      h.addEventListener("change", function() {
        k();
      });
    }
    if (u) {
      var m = LiteGraph.slot_types_out, b = m.length;
      (t.type_filter_out == LiteGraph.EVENT || t.type_filter_out == LiteGraph.ACTION) && (t.type_filter_out = "_event_");
      for (var _ = 0; _ < b; _++) {
        var C = document.createElement("option");
        C.value = m[_], C.innerHTML = m[_], u.appendChild(C), t.type_filter_out !== !1 && (t.type_filter_out + "").toLowerCase() == (m[_] + "").toLowerCase() && (C.selected = !0);
      }
      u.addEventListener("change", function() {
        k();
      });
    }
  }
  var N = l.getBoundingClientRect(), I = (e ? e.clientX : N.left + N.width * 0.5) - 80, D = (e ? e.clientY : N.top + N.height * 0.5) - 20;
  o.style.left = I + "px", o.style.top = D + "px", e.layerY > N.height - 200 && (c.style.maxHeight = N.height - e.layerY - 20 + "px"), L.focus(), t.show_all_on_open && k();
  function P(E) {
    if (E)
      if (n.onSearchBoxSelection)
        n.onSearchBoxSelection(E, e, s);
      else {
        var O = LiteGraph.searchbox_extras[E.toLowerCase()];
        O && (E = O.type), s.graph.beforeChange();
        var T = LiteGraph.createNode(E);
        if (T && (T.pos = s.convertEventToCanvasOffset(
          e
        ), s.graph.add(T, !1)), O && O.data) {
          if (O.data.properties)
            for (var M in O.data.properties)
              T.addProperty(M, O.data.properties[M]);
          if (O.data.inputs) {
            T.inputs = [];
            for (var M in O.data.inputs)
              T.addOutput(
                O.data.inputs[M][0],
                O.data.inputs[M][1]
              );
          }
          if (O.data.outputs) {
            T.outputs = [];
            for (var M in O.data.outputs)
              T.addOutput(
                O.data.outputs[M][0],
                O.data.outputs[M][1]
              );
          }
          O.data.title && (T.title = O.data.title), O.data.json && T.configure(O.data.json);
        }
        if (t.node_from) {
          var S = !1;
          switch (typeof t.slot_from) {
            case "string":
              S = t.node_from.findOutputSlot(t.slot_from);
              break;
            case "object":
              t.slot_from.name ? S = t.node_from.findOutputSlot(t.slot_from.name) : S = -1, S == -1 && typeof t.slot_from.slot_index < "u" && (S = t.slot_from.slot_index);
              break;
            case "number":
              S = t.slot_from;
              break;
            default:
              S = 0;
          }
          typeof t.node_from.outputs[S] < "u" && S !== !1 && S > -1 && t.node_from.connectByType(S, T, t.node_from.outputs[S].type);
        }
        if (t.node_to) {
          var S = !1;
          switch (typeof t.slot_from) {
            case "string":
              S = t.node_to.findInputSlot(t.slot_from);
              break;
            case "object":
              t.slot_from.name ? S = t.node_to.findInputSlot(t.slot_from.name) : S = -1, S == -1 && typeof t.slot_from.slot_index < "u" && (S = t.slot_from.slot_index);
              break;
            case "number":
              S = t.slot_from;
              break;
            default:
              S = 0;
          }
          typeof t.node_to.inputs[S] < "u" && S !== !1 && S > -1 && t.node_to.connectByTypeOutput(S, T, t.node_to.inputs[S].type);
        }
        s.graph.afterChange();
      }
    o.close();
  }
  function A(E) {
    var O = G;
    G && G.classList.remove("selected"), G ? (G = E ? G.nextSibling : G.previousSibling, G || (G = O)) : G = E ? c.childNodes[0] : c.childNodes[c.childNodes.length], G && (G.classList.add("selected"), G.scrollIntoView({ block: "end", behavior: "smooth" }));
  }
  function k() {
    d = null;
    var E = L.value;
    if (g = null, c.innerHTML = "", !E && !t.show_all_if_empty)
      return;
    if (n.onSearchBox) {
      var O = n.onSearchBox(c, E, s);
      if (O)
        for (var T = 0; T < O.length; ++T)
          X(O[T]);
    } else {
      let H = function(z, q) {
        var q = q || {}, Q = {
          skipFilter: !1,
          inTypeOverride: !1,
          outTypeOverride: !1
        }, Y = Object.assign(Q, q), $ = LiteGraph.registered_node_types[z];
        if (S && $.filter != S || (!t.show_all_if_empty || E) && z.toLowerCase().indexOf(E) === -1)
          return !1;
        if (t.do_type_filter && !Y.skipFilter) {
          var J = z, R = B.value;
          if (Y.inTypeOverride !== !1 && (R = Y.inTypeOverride), B && R && LiteGraph.registered_slot_in_types[R] && LiteGraph.registered_slot_in_types[R].nodes) {
            var K = LiteGraph.registered_slot_in_types[R].nodes.includes(J);
            if (K === !1) return !1;
          }
          var R = F.value;
          if (Y.outTypeOverride !== !1 && (R = Y.outTypeOverride), F && R && LiteGraph.registered_slot_out_types[R] && LiteGraph.registered_slot_out_types[R].nodes) {
            var K = LiteGraph.registered_slot_out_types[R].nodes.includes(J);
            if (K === !1) return !1;
          }
        }
        return !0;
      };
      var M = 0;
      E = E.toLowerCase();
      var S = s.filter || s.graph.filter;
      if (t.do_type_filter && n.search_box)
        var B = n.search_box.querySelector(".slot_in_type_filter"), F = n.search_box.querySelector(".slot_out_type_filter");
      else
        var B = !1, F = !1;
      for (var T in LiteGraph.searchbox_extras) {
        var V = LiteGraph.searchbox_extras[T];
        if (!((!t.show_all_if_empty || E) && V.desc.toLowerCase().indexOf(E) === -1)) {
          var j = LiteGraph.registered_node_types[V.type];
          if (!(j && j.filter != S) && H(V.type) && (X(V.desc, "searchbox_extra"), LGraphCanvas.search_limit !== -1 && M++ > LGraphCanvas.search_limit))
            break;
        }
      }
      var W = null;
      if (Array.prototype.filter)
        var Z = Object.keys(LiteGraph.registered_node_types), W = Z.filter(H);
      else {
        W = [];
        for (var T in LiteGraph.registered_node_types)
          H(T) && W.push(T);
      }
      for (var T = 0; T < W.length && (X(W[T]), !(LGraphCanvas.search_limit !== -1 && M++ > LGraphCanvas.search_limit)); T++)
        ;
      if (t.show_general_after_typefiltered && (B.value || F.value)) {
        filtered_extra = [];
        for (var T in LiteGraph.registered_node_types)
          H(T, { inTypeOverride: B && B.value ? "*" : !1, outTypeOverride: F && F.value ? "*" : !1 }) && filtered_extra.push(T);
        for (var T = 0; T < filtered_extra.length && (X(filtered_extra[T], "generic_type"), !(LGraphCanvas.search_limit !== -1 && M++ > LGraphCanvas.search_limit)); T++)
          ;
      }
      if ((B.value || F.value) && c.childNodes.length == 0 && t.show_general_if_none_on_typefilter) {
        filtered_extra = [];
        for (var T in LiteGraph.registered_node_types)
          H(T, { skipFilter: !0 }) && filtered_extra.push(T);
        for (var T = 0; T < filtered_extra.length && (X(filtered_extra[T], "not_in_filter"), !(LGraphCanvas.search_limit !== -1 && M++ > LGraphCanvas.search_limit)); T++)
          ;
      }
    }
    function X(H, z) {
      var U = document.createElement("div");
      g || (g = H), U.innerText = H, U.dataset.type = escape(H), U.className = "litegraph lite-search-item", z && (U.className += " " + z), U.addEventListener("click", function(q) {
        P(unescape(this.dataset.type));
      }), c.appendChild(U);
    }
  }
  return o;
};
LGraphCanvas.prototype.showEditPropertyValue = function(e, t, r) {
  if (!e || e.properties[t] === void 0)
    return;
  r = r || {};
  var n = e.getPropertyInfo(t), s = n.type, l = "";
  if (s == "string" || s == "number" || s == "array" || s == "object")
    l = "<input autofocus type='text' class='value'/>";
  else if ((s == "enum" || s == "combo") && n.values) {
    l = "<select autofocus type='text' class='value'>";
    for (var a in n.values) {
      var o = a;
      n.values.constructor === Array && (o = n.values[a]), l += "<option value='" + o + "' " + (o == e.properties[t] ? "selected" : "") + ">" + n.values[a] + "</option>";
    }
    l += "</select>";
  } else if (s == "boolean" || s == "toggle")
    l = "<input autofocus type='checkbox' class='value' " + (e.properties[t] ? "checked" : "") + "/>";
  else {
    console.warn("unknown type: " + s);
    return;
  }
  var h = this.createDialog(
    "<span class='name'>" + (n.label ? n.label : t) + "</span>" + l + "<button>OK</button>",
    r
  ), u = !1;
  if ((s == "enum" || s == "combo") && n.values)
    u = h.querySelector("select"), u.addEventListener("change", function(g) {
      h.modified(), c(g.target.value);
    });
  else if (s == "boolean" || s == "toggle")
    u = h.querySelector("input"), u && u.addEventListener("click", function(g) {
      h.modified(), c(!!u.checked);
    });
  else if (u = h.querySelector("input"), u) {
    u.addEventListener("blur", function(d) {
      this.focus();
    });
    var o = e.properties[t] !== void 0 ? e.properties[t] : "";
    s !== "string" && (o = JSON.stringify(o)), u.value = o, u.addEventListener("keydown", function(d) {
      if (d.keyCode == 27)
        h.close();
      else if (d.keyCode == 13)
        f();
      else if (d.keyCode != 13) {
        h.modified();
        return;
      }
      d.preventDefault(), d.stopPropagation();
    });
  }
  u && u.focus();
  var p = h.querySelector("button");
  p.addEventListener("click", f);
  function f() {
    c(u.value);
  }
  function c(g) {
    n && n.values && n.values.constructor === Object && n.values[g] != null && (g = n.values[g]), typeof e.properties[t] == "number" && (g = Number(g)), (s == "array" || s == "object") && (g = JSON.parse(g)), e.properties[t] = g, e.graph && e.graph._version++, e.onPropertyChanged && e.onPropertyChanged(t, g), r.onclose && r.onclose(), h.close(), e.setDirtyCanvas(!0, !0);
  }
  return h;
};
LGraphCanvas.prototype.createDialog = function(e, t) {
  var r = { checkForInput: !1, closeOnLeave: !0, closeOnLeave_checkModified: !0 };
  t = Object.assign(r, t || {});
  var n = document.createElement("div");
  n.className = "graphdialog", n.innerHTML = e, n.is_modified = !1;
  var s = this.canvas.getBoundingClientRect(), l = -20, a = -20;
  if (s && (l -= s.left, a -= s.top), t.position ? (l += t.position[0], a += t.position[1]) : t.event ? (l += t.event.clientX, a += t.event.clientY) : (l += this.canvas.width * 0.5, a += this.canvas.height * 0.5), n.style.left = l + "px", n.style.top = a + "px", this.canvas.parentNode.appendChild(n), t.checkForInput) {
    var o = [], h = !1;
    o = n.querySelectorAll("input"), o && o.forEach(function(c) {
      c.addEventListener("keydown", function(g) {
        if (n.modified(), g.keyCode == 27)
          n.close();
        else if (g.keyCode != 13)
          return;
        g.preventDefault(), g.stopPropagation();
      }), h || c.focus();
    });
  }
  n.modified = function() {
    n.is_modified = !0;
  }, n.close = function() {
    n.parentNode && n.parentNode.removeChild(n);
  };
  var u = null, p = !1;
  n.addEventListener("mouseleave", function(c) {
    p || (t.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave) && !n.is_modified && LiteGraph.dialog_close_on_mouse_leave && (u = setTimeout(n.close, LiteGraph.dialog_close_on_mouse_leave_delay));
  }), n.addEventListener("mouseenter", function(c) {
    (t.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave) && u && clearTimeout(u);
  });
  var f = n.querySelectorAll("select");
  return f && f.forEach(function(c) {
    c.addEventListener("click", function(g) {
      p++;
    }), c.addEventListener("blur", function(g) {
      p = 0;
    }), c.addEventListener("change", function(g) {
      p = -1;
    });
  }), n;
};
LGraphCanvas.prototype.createPanel = function(e, t) {
  t = t || {};
  var r = t.window || window, n = document.createElement("div");
  if (n.className = "litegraph dialog", n.innerHTML = "<div class='dialog-header'><span class='dialog-title'></span></div><div class='dialog-content'></div><div style='display:none;' class='dialog-alt-content'></div><div class='dialog-footer'></div>", n.header = n.querySelector(".dialog-header"), t.width && (n.style.width = t.width + (t.width.constructor === Number ? "px" : "")), t.height && (n.style.height = t.height + (t.height.constructor === Number ? "px" : "")), t.closable) {
    var s = document.createElement("span");
    s.innerHTML = "&#10005;", s.classList.add("close"), s.addEventListener("click", function() {
      n.close();
    }), n.header.appendChild(s);
  }
  return n.title_element = n.querySelector(".dialog-title"), n.title_element.innerText = e, n.content = n.querySelector(".dialog-content"), n.alt_content = n.querySelector(".dialog-alt-content"), n.footer = n.querySelector(".dialog-footer"), n.close = function() {
    n.onClose && typeof n.onClose == "function" && n.onClose(), n.parentNode && n.parentNode.removeChild(n), this.parentNode && this.parentNode.removeChild(this);
  }, n.toggleAltContent = function(l) {
    if (typeof l < "u")
      var a = l ? "block" : "none", o = l ? "none" : "block";
    else
      var a = n.alt_content.style.display != "block" ? "block" : "none", o = n.alt_content.style.display != "block" ? "none" : "block";
    n.alt_content.style.display = a, n.content.style.display = o;
  }, n.toggleFooterVisibility = function(l) {
    if (typeof l < "u")
      var a = l ? "block" : "none";
    else
      var a = n.footer.style.display != "block" ? "block" : "none";
    n.footer.style.display = a;
  }, n.clear = function() {
    this.content.innerHTML = "";
  }, n.addHTML = function(l, a, o) {
    var h = document.createElement("div");
    return a && (h.className = a), h.innerHTML = l, o ? n.footer.appendChild(h) : n.content.appendChild(h), h;
  }, n.addButton = function(l, a, o) {
    var h = document.createElement("button");
    return h.innerText = l, h.options = o, h.classList.add("btn"), h.addEventListener("click", a), n.footer.appendChild(h), h;
  }, n.addSeparator = function() {
    var l = document.createElement("div");
    l.className = "separator", n.content.appendChild(l);
  }, n.addWidget = function(l, a, o, h, u) {
    h = h || {};
    var p = String(o);
    l = l.toLowerCase(), l == "number" && (p = o.toFixed(3));
    var f = document.createElement("div");
    f.className = "property", f.innerHTML = "<span class='property_name'></span><span class='property_value'></span>", f.querySelector(".property_name").innerText = h.label || a;
    var c = f.querySelector(".property_value");
    if (c.innerText = p, f.dataset.property = a, f.dataset.type = h.type || l, f.options = h, f.value = o, l == "code")
      f.addEventListener("click", function(d) {
        n.inner_showCodePad(this.dataset.property);
      });
    else if (l == "boolean")
      f.classList.add("boolean"), o && f.classList.add("bool-on"), f.addEventListener("click", function() {
        var d = this.dataset.property;
        this.value = !this.value, this.classList.toggle("bool-on"), this.querySelector(".property_value").innerText = this.value ? "true" : "false", g(d, this.value);
      });
    else if (l == "string" || l == "number")
      c.setAttribute("contenteditable", !0), c.addEventListener("keydown", function(d) {
        d.code == "Enter" && (l != "string" || !d.shiftKey) && (d.preventDefault(), this.blur());
      }), c.addEventListener("blur", function() {
        var d = this.innerText, G = this.parentNode.dataset.property, L = this.parentNode.dataset.type;
        L == "number" && (d = Number(d)), g(G, d);
      });
    else if (l == "enum" || l == "combo") {
      var p = LGraphCanvas.getPropertyPrintableValue(o, h.values);
      c.innerText = p, c.addEventListener("click", function(G) {
        var L = h.values || [], m = this.parentNode.dataset.property, b = this;
        new LiteGraph.ContextMenu(
          L,
          {
            event: G,
            className: "dark",
            callback: _
          },
          r
        );
        function _(C, N, I) {
          return b.innerText = C, g(m, C), !1;
        }
      });
    }
    n.content.appendChild(f);
    function g(d, G) {
      h.callback && h.callback(d, G, h), u && u(d, G, h);
    }
    return f;
  }, n.onOpen && typeof n.onOpen == "function" && n.onOpen(), n;
};
LGraphCanvas.getPropertyPrintableValue = function(e, t) {
  if (!t || t.constructor === Array)
    return String(e);
  if (t.constructor === Object) {
    var r = "";
    for (var n in t)
      if (t[n] == e) {
        r = n;
        break;
      }
    return String(e) + " (" + r + ")";
  }
};
LGraphCanvas.prototype.closePanels = function() {
  var e = document.querySelector("#node-panel");
  e && e.close();
  var e = document.querySelector("#option-panel");
  e && e.close();
};
LGraphCanvas.prototype.showShowGraphOptionsPanel = function(e, t, r, n) {
  if (this.constructor && this.constructor.name == "HTMLDivElement") {
    if (!t || !t.event || !t.event.target || !t.event.target.lgraphcanvas) {
      console.warn("Canvas not found");
      return;
    }
    var s = t.event.target.lgraphcanvas;
  } else
    var s = this;
  s.closePanels();
  var l = s.getCanvasWindow();
  panel = s.createPanel("Options", {
    closable: !0,
    window: l,
    onOpen: function() {
      s.OPTIONPANEL_IS_OPEN = !0;
    },
    onClose: function() {
      s.OPTIONPANEL_IS_OPEN = !1, s.options_panel = null;
    }
  }), s.options_panel = panel, panel.id = "option-panel", panel.classList.add("settings");
  function a() {
    panel.content.innerHTML = "";
    var o = function(f, c, g) {
      switch (f) {
        default:
          g && g.key && (f = g.key), g.values && (c = Object.values(g.values).indexOf(c)), s[f] = c;
          break;
      }
    }, h = LiteGraph.availableCanvasOptions;
    h.sort();
    for (var u in h) {
      var p = h[u];
      panel.addWidget("boolean", p, s[p], { key: p, on: "True", off: "False" }, o);
    }
    s.links_render_mode, panel.addWidget("combo", "Render mode", LiteGraph.LINK_RENDER_MODES[s.links_render_mode], { key: "links_render_mode", values: LiteGraph.LINK_RENDER_MODES }, o), panel.addSeparator(), panel.footer.innerHTML = "";
  }
  a(), s.canvas.parentNode.appendChild(panel);
};
LGraphCanvas.prototype.showShowNodePanel = function(e) {
  this.SELECTED_NODE = e, this.closePanels();
  var t = this.getCanvasWindow(), r = this, n = this.createPanel(e.title || "", {
    closable: !0,
    window: t,
    onOpen: function() {
      r.NODEPANEL_IS_OPEN = !0;
    },
    onClose: function() {
      r.NODEPANEL_IS_OPEN = !1, r.node_panel = null;
    }
  });
  r.node_panel = n, n.id = "node-panel", n.node = e, n.classList.add("settings");
  function s() {
    n.content.innerHTML = "", n.addHTML("<span class='node_type'>" + e.type + "</span><span class='node_desc'>" + (e.constructor.desc || "") + "</span><span class='separator'></span>"), n.addHTML("<h3>Properties</h3>");
    var l = function(p, f) {
      switch (r.graph.beforeChange(e), p) {
        case "Title":
          e.title = f;
          break;
        case "Mode":
          var c = Object.values(LiteGraph.NODE_MODES).indexOf(f);
          c >= 0 && LiteGraph.NODE_MODES[c] ? e.changeMode(c) : console.warn("unexpected mode: " + f);
          break;
        case "Color":
          LGraphCanvas.node_colors[f] ? (e.color = LGraphCanvas.node_colors[f].color, e.bgcolor = LGraphCanvas.node_colors[f].bgcolor) : console.warn("unexpected color: " + f);
          break;
        default:
          e.setProperty(p, f);
          break;
      }
      r.graph.afterChange(), r.dirty_canvas = !0;
    };
    n.addWidget("string", "Title", e.title, {}, l), n.addWidget("combo", "Mode", LiteGraph.NODE_MODES[e.mode], { values: LiteGraph.NODE_MODES }, l);
    var a = "";
    e.color !== void 0 && (a = Object.keys(LGraphCanvas.node_colors).filter(function(p) {
      return LGraphCanvas.node_colors[p].color == e.color;
    })), n.addWidget("combo", "Color", a, { values: Object.keys(LGraphCanvas.node_colors) }, l);
    for (var o in e.properties) {
      var h = e.properties[o], u = e.getPropertyInfo(o);
      u.type, !(e.onAddPropertyToPanel && e.onAddPropertyToPanel(o, n)) && n.addWidget(u.widget || u.type, o, h, u, l);
    }
    n.addSeparator(), e.onShowCustomPanelInfo && e.onShowCustomPanelInfo(n), n.footer.innerHTML = "", n.addButton("Delete", function() {
      e.block_delete || (e.graph.remove(e), n.close());
    }).classList.add("delete");
  }
  n.inner_showCodePad = function(l) {
    n.classList.remove("settings"), n.classList.add("centered"), n.alt_content.innerHTML = "<textarea class='code'></textarea>";
    var a = n.alt_content.querySelector("textarea"), o = function() {
      n.toggleAltContent(!1), n.toggleFooterVisibility(!0), a.parentNode.removeChild(a), n.classList.add("settings"), n.classList.remove("centered"), s();
    };
    a.value = e.properties[l], a.addEventListener("keydown", function(p) {
      p.code == "Enter" && p.ctrlKey && (e.setProperty(l, a.value), o());
    }), n.toggleAltContent(!0), n.toggleFooterVisibility(!1), a.style.height = "calc(100% - 40px)";
    var h = n.addButton("Assign", function() {
      e.setProperty(l, a.value), o();
    });
    n.alt_content.appendChild(h);
    var u = n.addButton("Close", o);
    u.style.float = "right", n.alt_content.appendChild(u);
  }, s(), this.canvas.parentNode.appendChild(n);
};
LGraphCanvas.prototype.showSubgraphPropertiesDialog = function(e) {
  console.log("showing subgraph properties dialog");
  var t = this.canvas.parentNode.querySelector(".subgraph_dialog");
  t && t.close();
  var r = this.createPanel("Subgraph Inputs", { closable: !0, width: 500 });
  r.node = e, r.classList.add("subgraph_dialog");
  function n() {
    if (r.clear(), e.inputs)
      for (var a = 0; a < e.inputs.length; ++a) {
        var o = e.inputs[a];
        if (!o.not_subgraph_input) {
          var h = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>", u = r.addHTML(h, "subgraph_property");
          u.dataset.name = o.name, u.dataset.slot = a, u.querySelector(".name").innerText = o.name, u.querySelector(".type").innerText = o.type, u.querySelector("button").addEventListener("click", function(p) {
            e.removeInput(Number(this.parentNode.dataset.slot)), n();
          });
        }
      }
  }
  var s = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>", l = r.addHTML(s, "subgraph_property extra", !0);
  return l.querySelector("button").addEventListener("click", function(a) {
    var o = this.parentNode, h = o.querySelector(".name").value, u = o.querySelector(".type").value;
    !h || e.findInputSlot(h) != -1 || (e.addInput(h, u), o.querySelector(".name").value = "", o.querySelector(".type").value = "", n());
  }), n(), this.canvas.parentNode.appendChild(r), r;
};
LGraphCanvas.prototype.showSubgraphPropertiesDialogRight = function(e) {
  var t = this.canvas.parentNode.querySelector(".subgraph_dialog");
  t && t.close();
  var r = this.createPanel("Subgraph Outputs", { closable: !0, width: 500 });
  r.node = e, r.classList.add("subgraph_dialog");
  function n() {
    if (r.clear(), e.outputs)
      for (var o = 0; o < e.outputs.length; ++o) {
        var h = e.outputs[o];
        if (!h.not_subgraph_output) {
          var u = "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>", p = r.addHTML(u, "subgraph_property");
          p.dataset.name = h.name, p.dataset.slot = o, p.querySelector(".name").innerText = h.name, p.querySelector(".type").innerText = h.type, p.querySelector("button").addEventListener("click", function(f) {
            e.removeOutput(Number(this.parentNode.dataset.slot)), n();
          });
        }
      }
  }
  var s = " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>", l = r.addHTML(s, "subgraph_property extra", !0);
  l.querySelector(".name").addEventListener("keydown", function(o) {
    o.keyCode == 13 && a.apply(this);
  }), l.querySelector("button").addEventListener("click", function(o) {
    a.apply(this);
  });
  function a() {
    var o = this.parentNode, h = o.querySelector(".name").value, u = o.querySelector(".type").value;
    !h || e.findOutputSlot(h) != -1 || (e.addOutput(h, u), o.querySelector(".name").value = "", o.querySelector(".type").value = "", n());
  }
  return n(), this.canvas.parentNode.appendChild(r), r;
};
LGraphCanvas.prototype.checkPanels = function() {
  if (this.canvas)
    for (var e = this.canvas.parentNode.querySelectorAll(".litegraph.dialog"), t = 0; t < e.length; ++t) {
      var r = e[t];
      r.node && (!r.node.graph || r.graph != this.graph) && r.close();
    }
};
LGraphCanvas.onMenuNodeCollapse = function(e, t, r, n, s) {
  s.graph.beforeChange(
    /*?*/
  );
  var l = function(h) {
    h.collapse();
  }, a = LGraphCanvas.active_canvas;
  if (!a.selected_nodes || Object.keys(a.selected_nodes).length <= 1)
    l(s);
  else
    for (var o in a.selected_nodes)
      l(a.selected_nodes[o]);
  s.graph.afterChange(
    /*?*/
  );
};
LGraphCanvas.onMenuNodePin = function(e, t, r, n, s) {
  s.pin();
};
LGraphCanvas.onMenuNodeMode = function(e, t, r, n, s) {
  new LiteGraph.ContextMenu(
    LiteGraph.NODE_MODES,
    { event: r, callback: l, parentMenu: n, node: s }
  );
  function l(a) {
    if (s) {
      var o = Object.values(LiteGraph.NODE_MODES).indexOf(a), h = function(f) {
        o >= 0 && LiteGraph.NODE_MODES[o] ? f.changeMode(o) : (console.warn("unexpected mode: " + a), f.changeMode(LiteGraph.ALWAYS));
      }, u = LGraphCanvas.active_canvas;
      if (!u.selected_nodes || Object.keys(u.selected_nodes).length <= 1)
        h(s);
      else
        for (var p in u.selected_nodes)
          h(u.selected_nodes[p]);
    }
  }
  return !1;
};
LGraphCanvas.onMenuNodeColors = function(e, t, r, n, s) {
  if (!s)
    throw "no node for color";
  var l = [];
  l.push({
    value: null,
    content: "<span style='display: block; padding-left: 4px;'>No color</span>"
  });
  for (var a in LGraphCanvas.node_colors) {
    var o = LGraphCanvas.node_colors[a], e = {
      value: a,
      content: "<span style='display: block; color: #999; padding-left: 4px; border-left: 8px solid " + o.color + "; background-color:" + o.bgcolor + "'>" + a + "</span>"
    };
    l.push(e);
  }
  new LiteGraph.ContextMenu(l, {
    event: r,
    callback: h,
    parentMenu: n,
    node: s
  });
  function h(u) {
    if (s) {
      var p = u.value ? LGraphCanvas.node_colors[u.value] : null, f = function(d) {
        p ? d.constructor === LiteGraph.LGraphGroup ? d.color = p.groupcolor : (d.color = p.color, d.bgcolor = p.bgcolor) : (delete d.color, delete d.bgcolor);
      }, c = LGraphCanvas.active_canvas;
      if (!c.selected_nodes || Object.keys(c.selected_nodes).length <= 1)
        f(s);
      else
        for (var g in c.selected_nodes)
          f(c.selected_nodes[g]);
      s.setDirtyCanvas(!0, !0);
    }
  }
  return !1;
};
LGraphCanvas.onMenuNodeShapes = function(e, t, r, n, s) {
  if (!s)
    throw "no node passed";
  new LiteGraph.ContextMenu(LiteGraph.VALID_SHAPES, {
    event: r,
    callback: l,
    parentMenu: n,
    node: s
  });
  function l(a) {
    if (s) {
      s.graph.beforeChange(
        /*?*/
      );
      var o = function(p) {
        p.shape = a;
      }, h = LGraphCanvas.active_canvas;
      if (!h.selected_nodes || Object.keys(h.selected_nodes).length <= 1)
        o(s);
      else
        for (var u in h.selected_nodes)
          o(h.selected_nodes[u]);
      s.graph.afterChange(
        /*?*/
      ), s.setDirtyCanvas(!0);
    }
  }
  return !1;
};
LGraphCanvas.onMenuNodeRemove = function(e, t, r, n, s) {
  if (!s)
    throw "no node passed";
  var l = s.graph;
  l.beforeChange();
  var a = function(u) {
    u.removable !== !1 && l.remove(u);
  }, o = LGraphCanvas.active_canvas;
  if (!o.selected_nodes || Object.keys(o.selected_nodes).length <= 1)
    a(s);
  else
    for (var h in o.selected_nodes)
      a(o.selected_nodes[h]);
  l.afterChange(), s.setDirtyCanvas(!0, !0);
};
LGraphCanvas.onMenuNodeToSubgraph = function(e, t, r, n, s) {
  var l = s.graph, a = LGraphCanvas.active_canvas;
  if (a) {
    var o = Object.values(a.selected_nodes || {});
    o.length || (o = [s]);
    var h = LiteGraph.createNode("graph/subgraph");
    h.pos = s.pos.concat(), l.add(h), h.buildFromNodes(o), a.deselectAllNodes(), s.setDirtyCanvas(!0, !0);
  }
};
LGraphCanvas.onMenuNodeClone = function(e, t, r, n, s) {
  s.graph.beforeChange();
  var l = {}, a = function(u) {
    if (u.clonable !== !1) {
      var p = u.clone();
      p && (p.pos = [u.pos[0] + 5, u.pos[1] + 5], u.graph.add(p), l[p.id] = p);
    }
  }, o = LGraphCanvas.active_canvas;
  if (!o.selected_nodes || Object.keys(o.selected_nodes).length <= 1)
    a(s);
  else
    for (var h in o.selected_nodes)
      a(o.selected_nodes[h]);
  Object.keys(l).length && o.selectNodes(l), s.graph.afterChange(), s.setDirtyCanvas(!0, !0);
};
LGraphCanvas.node_colors = {
  red: { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
  brown: { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
  green: { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
  blue: { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
  pale_blue: {
    color: "#2a363b",
    bgcolor: "#3f5159",
    groupcolor: "#3f789e"
  },
  cyan: { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
  purple: { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
  yellow: { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
  black: { color: "#222", bgcolor: "#000", groupcolor: "#444" }
};
LGraphCanvas.prototype.getCanvasMenuOptions = function() {
  var e = null;
  if (this.getMenuOptions ? e = this.getMenuOptions() : (e = [
    {
      content: "Add Node",
      has_submenu: !0,
      callback: LGraphCanvas.onMenuAdd
    },
    { content: "Add Group", callback: LGraphCanvas.onGroupAdd }
    //{ content: "Arrange", callback: that.graph.arrange },
    //{content:"Collapse All", callback: LGraphCanvas.onMenuCollapseAll }
  ], Object.keys(this.selected_nodes).length > 1 && e.push({
    content: "Align",
    has_submenu: !0,
    callback: LGraphCanvas.onGroupAlign
  }), this._graph_stack && this._graph_stack.length > 0 && e.push(null, {
    content: "Close subgraph",
    callback: this.closeSubgraph.bind(this)
  })), this.getExtraMenuOptions) {
    var t = this.getExtraMenuOptions(this, e);
    t && (e = e.concat(t));
  }
  return e;
};
LGraphCanvas.prototype.getNodeMenuOptions = function(e) {
  var t = null;
  if (e.getMenuOptions ? t = e.getMenuOptions(this) : (t = [
    {
      content: "Inputs",
      has_submenu: !0,
      disabled: !0,
      callback: LGraphCanvas.showMenuNodeOptionalInputs
    },
    {
      content: "Outputs",
      has_submenu: !0,
      disabled: !0,
      callback: LGraphCanvas.showMenuNodeOptionalOutputs
    },
    null,
    {
      content: "Properties",
      has_submenu: !0,
      callback: LGraphCanvas.onShowMenuNodeProperties
    },
    null,
    {
      content: "Title",
      callback: LGraphCanvas.onShowPropertyEditor
    },
    {
      content: "Mode",
      has_submenu: !0,
      callback: LGraphCanvas.onMenuNodeMode
    }
  ], e.resizable !== !1 && t.push({
    content: "Resize",
    callback: LGraphCanvas.onMenuResizeNode
  }), t.push(
    {
      content: "Collapse",
      callback: LGraphCanvas.onMenuNodeCollapse
    },
    { content: "Pin", callback: LGraphCanvas.onMenuNodePin },
    {
      content: "Colors",
      has_submenu: !0,
      callback: LGraphCanvas.onMenuNodeColors
    },
    {
      content: "Shapes",
      has_submenu: !0,
      callback: LGraphCanvas.onMenuNodeShapes
    },
    null
  )), e.onGetInputs) {
    var r = e.onGetInputs();
    r && r.length && (t[0].disabled = !1);
  }
  if (e.onGetOutputs) {
    var n = e.onGetOutputs();
    n && n.length && (t[1].disabled = !1);
  }
  if (e.getExtraMenuOptions) {
    var s = e.getExtraMenuOptions(this, t);
    s && (s.push(null), t = s.concat(t));
  }
  return e.clonable !== !1 && t.push({
    content: "Clone",
    callback: LGraphCanvas.onMenuNodeClone
  }), Object.keys(this.selected_nodes).length > 1 && t.push({
    content: "Align Selected To",
    has_submenu: !0,
    callback: LGraphCanvas.onNodeAlign
  }), t.push(null, {
    content: "Remove",
    disabled: !(e.removable !== !1 && !e.block_delete),
    callback: LGraphCanvas.onMenuNodeRemove
  }), e.graph && e.graph.onGetNodeMenuOptions && e.graph.onGetNodeMenuOptions(t, e), t;
};
LGraphCanvas.prototype.getGroupMenuOptions = function(e) {
  var t = [
    { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
    {
      content: "Color",
      has_submenu: !0,
      callback: LGraphCanvas.onMenuNodeColors
    },
    {
      content: "Font size",
      property: "font_size",
      type: "Number",
      callback: LGraphCanvas.onShowPropertyEditor
    },
    null,
    { content: "Remove", callback: LGraphCanvas.onMenuNodeRemove }
  ];
  return t;
};
LGraphCanvas.prototype.processContextMenu = function(e, t) {
  var r = this, n = LGraphCanvas.active_canvas, s = n.getCanvasWindow(), l = null, a = {
    event: t,
    callback: p,
    extra: e
  };
  e && (a.title = e.type);
  var o = null;
  if (e && (o = e.getSlotInPosition(t.canvasX, t.canvasY), LGraphCanvas.active_node = e), o) {
    if (l = [], e.getSlotMenuOptions)
      l = e.getSlotMenuOptions(o);
    else {
      o && o.output && o.output.links && o.output.links.length && l.push({ content: "Disconnect Links", slot: o });
      var h = o.input || o.output;
      h.removable && l.push(
        h.locked ? "Cannot remove" : { content: "Remove Slot", slot: o }
      ), h.nameLocked || l.push({ content: "Rename Slot", slot: o });
    }
    a.title = (o.input ? o.input.type : o.output.type) || "*", o.input && o.input.type == LiteGraph.ACTION && (a.title = "Action"), o.output && o.output.type == LiteGraph.EVENT && (a.title = "Event");
  } else if (e)
    l = this.getNodeMenuOptions(e);
  else {
    l = this.getCanvasMenuOptions();
    var u = this.graph.getGroupOnPos(
      t.canvasX,
      t.canvasY
    );
    u && l.push(null, {
      content: "Edit Group",
      has_submenu: !0,
      submenu: {
        title: "Group",
        extra: u,
        options: this.getGroupMenuOptions(u)
      }
    });
  }
  if (!l)
    return;
  new LiteGraph.ContextMenu(l, a, s);
  function p(f, c, g) {
    if (f) {
      if (f.content == "Remove Slot") {
        var d = f.slot;
        e.graph.beforeChange(), d.input ? e.removeInput(d.slot) : d.output && e.removeOutput(d.slot), e.graph.afterChange();
        return;
      } else if (f.content == "Disconnect Links") {
        var d = f.slot;
        e.graph.beforeChange(), d.output ? e.disconnectOutput(d.slot) : d.input && e.disconnectInput(d.slot), e.graph.afterChange();
        return;
      } else if (f.content == "Rename Slot") {
        var d = f.slot, G = d.input ? e.getInputInfo(d.slot) : e.getOutputInfo(d.slot), L = r.createDialog(
          "<span class='name'>Name</span><input autofocus type='text'/><button>OK</button>",
          c
        ), m = L.querySelector("input");
        m && G && (m.value = G.label || "");
        var b = function() {
          e.graph.beforeChange(), m.value && (G && (G.label = m.value), r.setDirty(!0)), L.close(), e.graph.afterChange();
        };
        L.querySelector("button").addEventListener("click", b), m.addEventListener("keydown", function(C) {
          if (L.is_modified = !0, C.keyCode == 27)
            L.close();
          else if (C.keyCode == 13)
            b();
          else if (C.keyCode != 13 && C.target.localName != "textarea")
            return;
          C.preventDefault(), C.stopPropagation();
        }), m.focus();
      }
    }
  }
};
function compareObjects(e, t) {
  for (var r in e)
    if (e[r] != t[r])
      return !1;
  return !0;
}
LiteGraph.compareObjects = compareObjects;
function distance(e, t) {
  return Math.sqrt(
    (t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1])
  );
}
LiteGraph.distance = distance;
function colorToString(e) {
  return "rgba(" + Math.round(e[0] * 255).toFixed() + "," + Math.round(e[1] * 255).toFixed() + "," + Math.round(e[2] * 255).toFixed() + "," + (e.length == 4 ? e[3].toFixed(2) : "1.0") + ")";
}
LiteGraph.colorToString = colorToString;
function isInsideRectangle(e, t, r, n, s, l) {
  return r < e && r + s > e && n < t && n + l > t;
}
LiteGraph.isInsideRectangle = isInsideRectangle;
function growBounding(e, t, r) {
  t < e[0] ? e[0] = t : t > e[2] && (e[2] = t), r < e[1] ? e[1] = r : r > e[3] && (e[3] = r);
}
LiteGraph.growBounding = growBounding;
function isInsideBounding(e, t) {
  return !(e[0] < t[0][0] || e[1] < t[0][1] || e[0] > t[1][0] || e[1] > t[1][1]);
}
LiteGraph.isInsideBounding = isInsideBounding;
function overlapBounding(e, t) {
  var r = e[0] + e[2], n = e[1] + e[3], s = t[0] + t[2], l = t[1] + t[3];
  return !(e[0] > s || e[1] > l || r < t[0] || n < t[1]);
}
LiteGraph.overlapBounding = overlapBounding;
function hex2num(e) {
  e.charAt(0) == "#" && (e = e.slice(1)), e = e.toUpperCase();
  for (var t = "0123456789ABCDEF", r = new Array(3), n = 0, s, l, a = 0; a < 6; a += 2)
    s = t.indexOf(e.charAt(a)), l = t.indexOf(e.charAt(a + 1)), r[n] = s * 16 + l, n++;
  return r;
}
LiteGraph.hex2num = hex2num;
function num2hex(e) {
  for (var t = "0123456789ABCDEF", r = "#", n, s, l = 0; l < 3; l++)
    n = e[l] / 16, s = e[l] % 16, r += t.charAt(n) + t.charAt(s);
  return r;
}
LiteGraph.num2hex = num2hex;
function ContextMenu(e, t) {
  new.target || console.trace("WARNING: Use new to construct a new ContextMenu rather than calling it.  The current implementation is deprecated and will break in the next update."), t = t || {}, this.options = t;
  var r = this;
  t.parentMenu && (t.parentMenu.constructor !== this.constructor ? (console.error(
    "parentMenu must be of class ContextMenu, ignoring it"
  ), t.parentMenu = null) : (this.parentMenu = t.parentMenu, this.parentMenu.lock = !0, this.parentMenu.current_submenu = this));
  var n = null;
  t.event && (n = t.event.constructor.name), n !== "MouseEvent" && n !== "CustomEvent" && n !== "PointerEvent" && (console.error(
    "Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it. (" + n + ")"
  ), t.event = null);
  var s = document.createElement("div");
  s.className = "litegraph litecontextmenu litemenubar-panel", t.className && (s.className += " " + t.className), s.style.pointerEvents = "none", setTimeout(function() {
    s.style.pointerEvents = "auto";
  }, 100), LiteGraph.pointerListenerAdd(
    s,
    "up",
    function(L) {
      return L.preventDefault(), !0;
    },
    !0
  ), s.addEventListener(
    "contextmenu",
    function(L) {
      return L.button != 2 || L.preventDefault(), !1;
    },
    !0
  ), LiteGraph.pointerListenerAdd(
    s,
    "down",
    function(L) {
      if (L.button == 2)
        return r.close(), L.preventDefault(), !0;
    },
    !0
  );
  function l(L) {
    var m = parseInt(s.style.top);
    return s.style.top = (m + L.deltaY * t.scroll_speed).toFixed() + "px", L.preventDefault(), !0;
  }
  if (t.scroll_speed || (t.scroll_speed = 0.1), s.addEventListener("wheel", l, !0), s.addEventListener("mousewheel", l, !0), this.root = s, t.title) {
    var a = document.createElement("div");
    a.className = "litemenu-title", a.innerHTML = t.title, s.appendChild(a);
  }
  for (var o = 0; o < e.length; o++) {
    var h = e.constructor == Array ? e[o] : o;
    h != null && h.constructor !== String && (h = h.content === void 0 ? String(h) : h.content);
    var u = e[o];
    this.addItem(h, u, t);
  }
  LiteGraph.pointerListenerAdd(s, "enter", function(L) {
    s.closing_timer && clearTimeout(s.closing_timer);
  });
  var p = document;
  t.event && (p = t.event.target.ownerDocument), p || (p = document), p.fullscreenElement ? p.fullscreenElement.appendChild(s) : p.body.appendChild(s);
  var f = t.left || 0, c = t.top || 0;
  if (t.event) {
    if (f = t.event.clientX - 10, c = t.event.clientY - 10, t.title && (c -= 20), t.parentMenu) {
      var g = t.parentMenu.root.getBoundingClientRect();
      f = g.left + g.width;
    }
    var d = document.body.getBoundingClientRect(), G = s.getBoundingClientRect();
    d.height == 0 && console.error("document.body height is 0. That is dangerous, set html,body { height: 100%; }"), d.width && f > d.width - G.width - 10 && (f = d.width - G.width - 10), d.height && c > d.height - G.height - 10 && (c = d.height - G.height - 10);
  }
  s.style.left = f + "px", s.style.top = c + "px", t.scale && (s.style.transform = "scale(" + t.scale + ")");
}
ContextMenu.prototype.addItem = function(e, t, r) {
  var n = this;
  r = r || {};
  var s = document.createElement("div");
  s.className = "litemenu-entry submenu";
  var l = !1;
  t === null ? s.classList.add("separator") : (s.innerHTML = t && t.title ? t.title : e, s.value = t, t && (t.disabled && (l = !0, s.classList.add("disabled")), (t.submenu || t.has_submenu) && s.classList.add("has_submenu")), typeof t == "function" ? (s.dataset.value = e, s.onclick_callback = t) : s.dataset.value = t, t.className && (s.className += " " + t.className)), this.root.appendChild(s), l || s.addEventListener("click", o), !l && r.autoopen && LiteGraph.pointerListenerAdd(s, "enter", a);
  function a(h) {
    var u = this.value;
    !u || !u.has_submenu || o.call(this, h);
  }
  function o(h) {
    var u = this.value, p = !0;
    if (n.current_submenu && n.current_submenu.close(h), r.callback) {
      var f = r.callback.call(
        this,
        u,
        r,
        h,
        n,
        r.node
      );
      f === !0 && (p = !1);
    }
    if (u) {
      if (u.callback && !r.ignore_item_callbacks && u.disabled !== !0) {
        var f = u.callback.call(
          this,
          u,
          r,
          h,
          n,
          r.extra
        );
        f === !0 && (p = !1);
      }
      if (u.submenu) {
        if (!u.submenu.options)
          throw "ContextMenu submenu needs options";
        new n.constructor(u.submenu.options, {
          callback: u.submenu.callback,
          event: h,
          parentMenu: n,
          ignore_item_callbacks: u.submenu.ignore_item_callbacks,
          title: u.submenu.title,
          extra: u.submenu.extra,
          autoopen: r.autoopen
        }), p = !1;
      }
    }
    p && !n.lock && n.close();
  }
  return s;
};
ContextMenu.prototype.close = function(e, t) {
  this.root.parentNode && this.root.parentNode.removeChild(this.root), this.parentMenu && !t && (this.parentMenu.lock = !1, this.parentMenu.current_submenu = null, e === void 0 ? this.parentMenu.close() : e && !ContextMenu.isCursorOverElement(e, this.parentMenu.root) && ContextMenu.trigger(this.parentMenu.root, LiteGraph.pointerevents_method + "leave", e)), this.current_submenu && this.current_submenu.close(e, !0), this.root.closing_timer && clearTimeout(this.root.closing_timer);
};
ContextMenu.trigger = function(e, t, r, n) {
  var s = document.createEvent("CustomEvent");
  return s.initCustomEvent(t, !0, !0, r), s.srcElement = n, e.dispatchEvent ? e.dispatchEvent(s) : e.__events && e.__events.dispatchEvent(s), s;
};
ContextMenu.prototype.getTopMenu = function() {
  return this.options.parentMenu ? this.options.parentMenu.getTopMenu() : this;
};
ContextMenu.prototype.getFirstEvent = function() {
  return this.options.parentMenu ? this.options.parentMenu.getFirstEvent() : this.options.event;
};
ContextMenu.isCursorOverElement = function(e, t) {
  var r = e.clientX, n = e.clientY, s = t.getBoundingClientRect();
  return s ? n > s.top && n < s.top + s.height && r > s.left && r < s.left + s.width : !1;
};
LiteGraph.ContextMenu = ContextMenu;
LiteGraph.closeAllContextMenus = function(e) {
  e = e || window;
  var t = e.document.querySelectorAll(".litecontextmenu");
  if (t.length) {
    for (var r = [], n = 0; n < t.length; n++)
      r.push(t[n]);
    for (var n = 0; n < r.length; n++)
      r[n].close ? r[n].close() : r[n].parentNode && r[n].parentNode.removeChild(r[n]);
  }
};
LiteGraph.extendClass = function(e, t) {
  for (var r in t)
    e.hasOwnProperty(r) || (e[r] = t[r]);
  if (t.prototype)
    for (var r in t.prototype)
      t.prototype.hasOwnProperty(r) && (e.prototype.hasOwnProperty(r) || (t.prototype.__lookupGetter__(r) ? e.prototype.__defineGetter__(
        r,
        t.prototype.__lookupGetter__(r)
      ) : e.prototype[r] = t.prototype[r], t.prototype.__lookupSetter__(r) && e.prototype.__defineSetter__(
        r,
        t.prototype.__lookupSetter__(r)
      )));
};
function CurveEditor(e) {
  new.target || console.trace("WARNING: Use new to construct a new CurveEditor rather than calling it.  The current implementation is deprecated and will break in the next update."), this.points = e, this.selected = -1, this.nearest = -1, this.size = null, this.must_update = !0, this.margin = 5;
}
CurveEditor.sampleCurve = function(e, t) {
  if (t) {
    for (var r = 0; r < t.length - 1; ++r) {
      var n = t[r], s = t[r + 1];
      if (!(s[0] < e)) {
        var l = s[0] - n[0];
        if (Math.abs(l) < 1e-5)
          return n[1];
        var a = (e - n[0]) / l;
        return n[1] * (1 - a) + s[1] * a;
      }
    }
    return 0;
  }
};
CurveEditor.prototype.draw = function(e, t, r, n, s, l) {
  var a = this.points;
  if (a) {
    this.size = t;
    var o = t[0] - this.margin * 2, h = t[1] - this.margin * 2;
    s = s || "#666", e.save(), e.translate(this.margin, this.margin), n && (e.fillStyle = "#111", e.fillRect(0, 0, o, h), e.fillStyle = "#222", e.fillRect(o * 0.5, 0, 1, h), e.strokeStyle = "#333", e.strokeRect(0, 0, o, h)), e.strokeStyle = s, l && (e.globalAlpha = 0.5), e.beginPath();
    for (var u = 0; u < a.length; ++u) {
      var p = a[u];
      e.lineTo(p[0] * o, (1 - p[1]) * h);
    }
    if (e.stroke(), e.globalAlpha = 1, !l)
      for (var u = 0; u < a.length; ++u) {
        var p = a[u];
        e.fillStyle = this.selected == u ? "#FFF" : this.nearest == u ? "#DDD" : "#AAA", e.beginPath(), e.arc(p[0] * o, (1 - p[1]) * h, 2, 0, Math.PI * 2), e.fill();
      }
    e.restore();
  }
};
CurveEditor.prototype.onMouseDown = function(e, t) {
  var r = this.points;
  if (r && !(e[1] < 0)) {
    var n = this.size[0] - this.margin * 2, s = this.size[1] - this.margin * 2, l = e[0] - this.margin, a = e[1] - this.margin, o = [l, a], h = 30 / t.ds.scale;
    if (this.selected = this.getCloserPoint(o, h), this.selected == -1) {
      var u = [l / n, 1 - a / s];
      r.push(u), r.sort(function(p, f) {
        return p[0] - f[0];
      }), this.selected = r.indexOf(u), this.must_update = !0;
    }
    if (this.selected != -1)
      return !0;
  }
};
CurveEditor.prototype.onMouseMove = function(e, t) {
  var r = this.points;
  if (r) {
    var n = this.selected;
    if (!(n < 0)) {
      var s = (e[0] - this.margin) / (this.size[0] - this.margin * 2), l = (e[1] - this.margin) / (this.size[1] - this.margin * 2), a = [e[0] - this.margin, e[1] - this.margin], o = 30 / t.ds.scale;
      this._nearest = this.getCloserPoint(a, o);
      var h = r[n];
      if (h) {
        var u = n == 0 || n == r.length - 1;
        if (!u && (e[0] < -10 || e[0] > this.size[0] + 10 || e[1] < -10 || e[1] > this.size[1] + 10)) {
          r.splice(n, 1), this.selected = -1;
          return;
        }
        u ? h[0] = n == 0 ? 0 : 1 : h[0] = clamp(s, 0, 1), h[1] = 1 - clamp(l, 0, 1), r.sort(function(p, f) {
          return p[0] - f[0];
        }), this.selected = r.indexOf(h), this.must_update = !0;
      }
    }
  }
};
CurveEditor.prototype.onMouseUp = function(e, t) {
  return this.selected = -1, !1;
};
CurveEditor.prototype.getCloserPoint = function(e, t) {
  var r = this.points;
  if (!r)
    return -1;
  t = t || 30;
  for (var n = this.size[0] - this.margin * 2, s = this.size[1] - this.margin * 2, l = r.length, a = [0, 0], o = 1e6, h = -1, u = 0; u < l; ++u) {
    var p = r[u];
    a[0] = p[0] * n, a[1] = (1 - p[1]) * s, a[0] < e[0];
    var f = vec2.distance(e, a);
    f > o || f > t || (h = u, o = f);
  }
  return h;
};
LiteGraph.CurveEditor = CurveEditor;
LiteGraph.getParameterNames = function(e) {
  return (e + "").replace(/[/][/].*$/gm, "").replace(/\s+/g, "").replace(/[/][*][^/*]*[*][/]/g, "").split("){", 1)[0].replace(/^[^(]*[(]/, "").replace(/=[^,]+/g, "").split(",").filter(Boolean);
};
LiteGraph.pointerListenerAdd = function(e, t, r, n = !1) {
  if (!(!e || !e.addEventListener || !t || typeof r != "function")) {
    var s = LiteGraph.pointerevents_method, l = t;
    if (s == "pointer" && !window.PointerEvent)
      switch (console.warn("sMethod=='pointer' && !window.PointerEvent"), console.log("Converting pointer[" + l + "] : down move up cancel enter TO touchstart touchmove touchend, etc .."), l) {
        case "down": {
          s = "touch", l = "start";
          break;
        }
        case "move": {
          s = "touch";
          break;
        }
        case "up": {
          s = "touch", l = "end";
          break;
        }
        case "cancel": {
          s = "touch";
          break;
        }
        case "enter": {
          console.log("debug: Should I send a move event?");
          break;
        }
        default:
          console.warn("PointerEvent not available in this browser ? The event " + l + " would not be called");
      }
    switch (l) {
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter":
        e.addEventListener(s + l, r, n);
        return;
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture":
        if (s != "mouse") {
          e.addEventListener(s + l, r, n);
          return;
        }
    }
    e.addEventListener(l, r, n);
  }
};
LiteGraph.pointerListenerRemove = function(e, t, r, n = !1) {
  if (!(!e || !e.removeEventListener || !t || typeof r != "function")) {
    switch (t) {
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter":
        (LiteGraph.pointerevents_method == "pointer" || LiteGraph.pointerevents_method == "mouse") && e.removeEventListener(LiteGraph.pointerevents_method + t, r, n);
        return;
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture":
        LiteGraph.pointerevents_method == "pointer" && e.removeEventListener(LiteGraph.pointerevents_method + t, r, n);
        return;
    }
    e.removeEventListener(t, r, n);
  }
};
function clamp(e, t, r) {
  return t > e ? t : r < e ? r : e;
}
global.clamp = clamp;
typeof window < "u" && !window.requestAnimationFrame && (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
  window.setTimeout(e, 1e3 / 60);
});
export {
  ContextMenu,
  DragAndScale,
  LGraph,
  LGraphCanvas,
  LGraphGroup,
  LGraphNode,
  LLink,
  LiteGraph,
  clamp
};
