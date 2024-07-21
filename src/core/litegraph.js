import { GraphInput, GraphOutput, Subgraph } from '../nodes/base';
import { console } from './Console';
import { ContextMenu } from './ContextMenu';
import { CurveEditor } from './CurveEditor';
import { DragAndScale } from './DragAndScale';
import { LGraph } from './LGraph';
import { LGraphCanvas } from './LGraphCanvas';
import { LGraphGroup } from './LGraphGroup';
import {
  addNodeMethod, createNode, registerNodeType, wrapFunctionAsNode,
} from './LGraphNode';
import { LLink } from './LLink';
import {
  buildNodeClassFromObject,
  clearRegisteredTypes, getNodeType, getNodeTypesCategories, getNodeTypesInCategory, LGraphNodeRegistry, registerNodeAndSlotType, unregisterNodeType,
} from './nodes';
import { pointerListenerAdd, pointerListenerRemove, PointerSettings } from './pointer_events';
import { LGraphSettings } from './settings';
import { LGraphStyles } from './styles';
import {
  clamp,
  cloneObject,
  closeAllContextMenus,
  colorToString,
  compareObjects,
  distance,
  extendClass,
  getParameterNames,
  getTime,
  growBounding,
  hex2num,
  isInsideBounding,
  isInsideRectangle,
  isValidConnection,
  num2hex,
  overlapBounding,
  uuidv4,
} from './utilities';

// this variable name is only overridden locally.
console.level = 5;

const global = typeof (window) !== 'undefined' ? window : typeof (self) !== 'undefined' ? self : globalThis;

// *************************************************************
//   LiteGraph CLASS                                     *******
// *************************************************************

/**
     * The Global Scope. It contains all the registered node classes.
     *
     * @class LiteGraph
     * @constructor
     */

export const LiteGraph = {
  get VERSION() { return LGraphSettings.VERSION; },
  set VERSION(newValue) { LGraphSettings.VERSION = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get CANVAS_GRID_SIZE() { return LGraphStyles.CANVAS_GRID_SIZE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set CANVAS_GRID_SIZE(newValue) { LGraphStyles.CANVAS_GRID_SIZE = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_TITLE_HEIGHT() { return LGraphStyles.NODE_TITLE_HEIGHT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_TITLE_HEIGHT(newValue) { LGraphStyles.NODE_TITLE_HEIGHT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_TITLE_TEXT_Y() { return LGraphStyles.NODE_TITLE_TEXT_Y; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_TITLE_TEXT_Y(newValue) { LGraphStyles.NODE_TITLE_TEXT_Y = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_SLOT_HEIGHT() { return LGraphStyles.NODE_SLOT_HEIGHT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_SLOT_HEIGHT(newValue) { LGraphStyles.NODE_SLOT_HEIGHT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_WIDGET_HEIGHT() { return LGraphStyles.NODE_WIDGET_HEIGHT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_WIDGET_HEIGHT(newValue) { LGraphStyles.NODE_WIDGET_HEIGHT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_WIDTH() { return LGraphStyles.NODE_WIDTH; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_WIDTH(newValue) { LGraphStyles.NODE_WIDTH = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_MIN_WIDTH() { return LGraphStyles.NODE_MIN_WIDTH; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_MIN_WIDTH(newValue) { LGraphStyles.NODE_MIN_WIDTH = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_COLLAPSED_RADIUS() { return LGraphStyles.NODE_COLLAPSED_RADIUS; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_COLLAPSED_RADIUS(newValue) { LGraphStyles.NODE_COLLAPSED_RADIUS = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_COLLAPSED_WIDTH() { return LGraphStyles.NODE_COLLAPSED_WIDTH; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_COLLAPSED_WIDTH(newValue) { LGraphStyles.NODE_COLLAPSED_WIDTH = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_TITLE_COLOR() { return LGraphStyles.NODE_TITLE_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_TITLE_COLOR(newValue) { LGraphStyles.NODE_TITLE_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_SELECTED_TITLE_COLOR() { return LGraphStyles.NODE_SELECTED_TITLE_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_SELECTED_TITLE_COLOR(newValue) { LGraphStyles.NODE_SELECTED_TITLE_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_TEXT_SIZE() { return LGraphStyles.NODE_TEXT_SIZE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_TEXT_SIZE(newValue) { LGraphStyles.NODE_TEXT_SIZE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_TEXT_COLOR() { return LGraphStyles.NODE_TEXT_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_TEXT_COLOR(newValue) { LGraphStyles.NODE_TEXT_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_SUBTEXT_SIZE() { return LGraphStyles.NODE_SUBTEXT_SIZE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_SUBTEXT_SIZE(newValue) { LGraphStyles.NODE_SUBTEXT_SIZE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_DEFAULT_COLOR() { return LGraphStyles.NODE_DEFAULT_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_DEFAULT_COLOR(newValue) { LGraphStyles.NODE_DEFAULT_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_DEFAULT_BGCOLOR() { return LGraphStyles.NODE_DEFAULT_BGCOLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_DEFAULT_BGCOLOR(newValue) { LGraphStyles.NODE_DEFAULT_BGCOLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_DEFAULT_BOXCOLOR() { return LGraphStyles.NODE_DEFAULT_BOXCOLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_DEFAULT_BOXCOLOR(newValue) { LGraphStyles.NODE_DEFAULT_BOXCOLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_DEFAULT_SHAPE() { return LGraphStyles.NODE_DEFAULT_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_DEFAULT_SHAPE(newValue) { LGraphStyles.NODE_DEFAULT_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_BOX_OUTLINE_COLOR() { return LGraphStyles.NODE_BOX_OUTLINE_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_BOX_OUTLINE_COLOR(newValue) { LGraphStyles.NODE_BOX_OUTLINE_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get DEFAULT_SHADOW_COLOR() { return LGraphStyles.DEFAULT_SHADOW_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set DEFAULT_SHADOW_COLOR(newValue) { LGraphStyles.DEFAULT_SHADOW_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get DEFAULT_GROUP_FONT() { return LGraphStyles.DEFAULT_GROUP_FONT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set DEFAULT_GROUP_FONT(newValue) { LGraphStyles.DEFAULT_GROUP_FONT = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get WIDGET_BGCOLOR() { return LGraphStyles.WIDGET_BGCOLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set WIDGET_BGCOLOR(newValue) { LGraphStyles.WIDGET_BGCOLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get WIDGET_OUTLINE_COLOR() { return LGraphStyles.WIDGET_OUTLINE_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set WIDGET_OUTLINE_COLOR(newValue) { LGraphStyles.WIDGET_OUTLINE_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get WIDGET_TEXT_COLOR() { return LGraphStyles.WIDGET_TEXT_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set WIDGET_TEXT_COLOR(newValue) { LGraphStyles.WIDGET_TEXT_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get WIDGET_SECONDARY_TEXT_COLOR() { return LGraphStyles.WIDGET_SECONDARY_TEXT_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set WIDGET_SECONDARY_TEXT_COLOR(newValue) { LGraphStyles.WIDGET_SECONDARY_TEXT_COLOR = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get LINK_COLOR() { return LGraphStyles.LINK_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set LINK_COLOR(newValue) { LGraphStyles.LINK_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get EVENT_LINK_COLOR() { return LGraphStyles.EVENT_LINK_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set EVENT_LINK_COLOR(newValue) { LGraphStyles.EVENT_LINK_COLOR = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get CONNECTING_LINK_COLOR() { return LGraphStyles.CONNECTING_LINK_COLOR; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set CONNECTING_LINK_COLOR(newValue) { LGraphStyles.CONNECTING_LINK_COLOR = newValue; },

  get MAX_NUMBER_OF_NODES() { return LGraphSettings.MAX_NUMBER_OF_NODES; },
  set MAX_NUMBER_OF_NODES(newValue) { LGraphSettings.MAX_NUMBER_OF_NODES = newValue; },
  get DEFAULT_POSITION() { return LGraphSettings.DEFAULT_POSITION; },
  set DEFAULT_POSITION(newValue) { LGraphSettings.DEFAULT_POSITION = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get VALID_SHAPES() { return LGraphStyles.VALID_SHAPES; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set VALID_SHAPES(newValue) { LGraphStyles.VALID_SHAPES = newValue; },

  // shapes are used for nodes but also for slots
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get BOX_SHAPE() { return LGraphStyles.BOX_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set BOX_SHAPE(newValue) { LGraphStyles.BOX_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ROUND_SHAPE() { return LGraphStyles.ROUND_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ROUND_SHAPE(newValue) { LGraphStyles.ROUND_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get CIRCLE_SHAPE() { return LGraphStyles.CIRCLE_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set CIRCLE_SHAPE(newValue) { LGraphStyles.CIRCLE_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get CARD_SHAPE() { return LGraphStyles.CARD_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set CARD_SHAPE(newValue) { LGraphStyles.CARD_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ARROW_SHAPE() { return LGraphStyles.ARROW_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ARROW_SHAPE(newValue) { LGraphStyles.ARROW_SHAPE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get GRID_SHAPE() { return LGraphStyles.GRID_SHAPE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set GRID_SHAPE(newValue) { LGraphStyles.GRID_SHAPE = newValue; },

  // enums
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get INPUT() { return LGraphStyles.INPUT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set INPUT(newValue) { LGraphStyles.INPUT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get OUTPUT() { return LGraphStyles.OUTPUT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set OUTPUT(newValue) { LGraphStyles.OUTPUT = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get EVENT() { return LGraphStyles.EVENT; }, // for outputs
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set EVENT(newValue) { LGraphStyles.EVENT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ACTION() { return LGraphStyles.ACTION; }, // for inputs
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ACTION(newValue) { LGraphStyles.ACTION = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_MODES() { return LGraphStyles.NODE_MODES; }, // helper, will add "On Request" and more in the future
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_MODES(newValue) { LGraphStyles.NODE_MODES = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NODE_MODES_COLORS() { return LGraphStyles.NODE_MODES_COLORS; }, // use with node_box_coloured_by_mode
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NODE_MODES_COLORS(newValue) { LGraphStyles.NODE_MODES_COLORS = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ALWAYS() { return LGraphStyles.ALWAYS; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ALWAYS(newValue) { LGraphStyles.ALWAYS = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ON_EVENT() { return LGraphStyles.ON_EVENT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ON_EVENT(newValue) { LGraphStyles.ON_EVENT = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NEVER() { return LGraphStyles.NEVER; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NEVER(newValue) { LGraphStyles.NEVER = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ON_TRIGGER() { return LGraphStyles.ON_TRIGGER; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ON_TRIGGER(newValue) { LGraphStyles.ON_TRIGGER = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get LINK_RENDER_MODES() { return LGraphStyles.LINK_RENDER_MODES; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set LINK_RENDER_MODES(newValue) { LGraphStyles.LINK_RENDER_MODES = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get STRAIGHT_LINK() { return LGraphStyles.STRAIGHT_LINK; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set STRAIGHT_LINK(newValue) { LGraphStyles.STRAIGHT_LINK = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get LINEAR_LINK() { return LGraphStyles.LINEAR_LINK; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set LINEAR_LINK(newValue) { LGraphStyles.LINEAR_LINK = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get SPLINE_LINK() { return LGraphStyles.SPLINE_LINK; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set SPLINE_LINK(newValue) { LGraphStyles.SPLINE_LINK = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NORMAL_TITLE() { return LGraphStyles.NORMAL_TITLE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NORMAL_TITLE(newValue) { LGraphStyles.NORMAL_TITLE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get NO_TITLE() { return LGraphStyles.NO_TITLE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set NO_TITLE(newValue) { LGraphStyles.NO_TITLE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get TRANSPARENT_TITLE() { return LGraphStyles.TRANSPARENT_TITLE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set TRANSPARENT_TITLE(newValue) { LGraphStyles.TRANSPARENT_TITLE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get AUTOHIDE_TITLE() { return LGraphStyles.AUTOHIDE_TITLE; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set AUTOHIDE_TITLE(newValue) { LGraphStyles.AUTOHIDE_TITLE = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get VERTICAL_LAYOUT() { return LGraphStyles.VERTICAL_LAYOUT; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set VERTICAL_LAYOUT(newValue) { LGraphStyles.VERTICAL_LAYOUT = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get proxy() { return LGraphSettings.proxy; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set proxy(newValue) { LGraphSettings.proxy = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get node_images_path() { return LGraphSettings.node_images_path; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set node_images_path(newValue) { LGraphSettings.node_images_path = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get debug() { return LGraphSettings.debug; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set debug(newValue) { LGraphSettings.debug = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get catch_exceptions() { return LGraphSettings.catch_exceptions; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set catch_exceptions(newValue) { LGraphSettings.catch_exceptions = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get throw_errors() { return LGraphSettings.throw_errors; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set throw_errors(newValue) { LGraphSettings.throw_errors = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get allow_scripts() { return LGraphSettings.allow_scripts; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set allow_scripts(newValue) { LGraphSettings.allow_scripts = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get use_deferred_actions() { return LGraphSettings.use_deferred_actions; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set use_deferred_actions(newValue) { LGraphSettings.use_deferred_actions = newValue; },
  get registered_node_types() { return LGraphNodeRegistry.registered_node_types; },
  set registered_node_types(newValue) { LGraphNodeRegistry.registered_node_types = newValue; },
  get node_types_by_file_extension() { return LGraphNodeRegistry.node_types_by_file_extension; },
  set node_types_by_file_extension(newValue) { LGraphNodeRegistry.node_types_by_file_extension = newValue; },
  get Nodes() { return LGraphNodeRegistry.Nodes; },
  set Nodes(newValue) { LGraphNodeRegistry.Nodes = newValue; },
  Globals: {}, // used to store vars between graphs

  searchbox_extras: {}, // used to add extra features to the search box
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get auto_sort_node_types() { return LGraphSettings.auto_sort_node_types; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set auto_sort_node_types(newValue) { LGraphSettings.auto_sort_node_types = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get node_box_coloured_when_on() { return LGraphSettings.node_box_coloured_when_on; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set node_box_coloured_when_on(newValue) { LGraphSettings.node_box_coloured_when_on = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get node_box_coloured_by_mode() { return LGraphSettings.node_box_coloured_by_mode; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set node_box_coloured_by_mode(newValue) { LGraphSettings.node_box_coloured_by_mode = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get dialog_close_on_mouse_leave() { return LGraphSettings.dialog_close_on_mouse_leave; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set dialog_close_on_mouse_leave(newValue) { LGraphSettings.dialog_close_on_mouse_leave = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get dialog_close_on_mouse_leave_delay() { return LGraphSettings.dialog_close_on_mouse_leave_delay; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set dialog_close_on_mouse_leave_delay(newValue) { LGraphSettings.dialog_close_on_mouse_leave_delay = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get shift_click_do_break_link_from() { return LGraphSettings.shift_click_do_break_link_from; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set shift_click_do_break_link_from(newValue) { LGraphSettings.shift_click_do_break_link_from = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get click_do_break_link_to() { return LGraphSettings.click_do_break_link_to; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set click_do_break_link_to(newValue) { LGraphSettings.click_do_break_link_to = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get search_hide_on_mouse_leave() { return LGraphSettings.search_hide_on_mouse_leave; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set search_hide_on_mouse_leave(newValue) { LGraphSettings.search_hide_on_mouse_leave = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get search_filter_enabled() { return LGraphSettings.search_filter_enabled; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set search_filter_enabled(newValue) { LGraphSettings.search_filter_enabled = newValue; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get search_show_all_on_open() { return LGraphSettings.search_show_all_on_open; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set search_show_all_on_open(newValue) { LGraphSettings.search_show_all_on_open = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get auto_load_slot_types() { return LGraphSettings.auto_load_slot_types; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set auto_load_slot_types(newValue) { LGraphSettings.auto_load_slot_types = newValue; },

  // set these values if not using auto_load_slot_types
  get registered_slot_in_types() { return LGraphNodeRegistry.registered_slot_in_types; },
  set registered_slot_in_types(newValue) { LGraphNodeRegistry.registered_slot_in_types = newValue; },
  get registered_slot_out_types() { return LGraphNodeRegistry.registered_slot_out_types; },
  set registered_slot_out_types(newValue) { LGraphNodeRegistry.registered_slot_out_types = newValue; },
  get slot_types_in() { return LGraphNodeRegistry.slot_types_in; },
  set slot_types_in(newValue) { LGraphNodeRegistry.slot_types_in = newValue; },
  get slot_types_out() { return LGraphNodeRegistry.slot_types_out; },
  set slot_types_out(newValue) { LGraphNodeRegistry.slot_types_out = newValue; },
  get slot_types_default_in() { return LGraphNodeRegistry.slot_types_default_in; },
  set slot_types_default_in(newValue) { LGraphNodeRegistry.slot_types_default_in = newValue; },
  get slot_types_default_out() { return LGraphNodeRegistry.slot_types_default_out; },
  set slot_types_default_out(newValue) { LGraphNodeRegistry.slot_types_default_out = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get alt_drag_do_clone_nodes() { return LGraphSettings.alt_drag_do_clone_nodes; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set alt_drag_do_clone_nodes(newValue) { LGraphSettings.alt_drag_do_clone_nodes = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get do_add_triggers_slots() { return LGraphSettings.do_add_triggers_slots; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set do_add_triggers_slots(newValue) { LGraphSettings.do_add_triggers_slots = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get allow_multi_output_for_events() { return LGraphSettings.allow_multi_output_for_events; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set allow_multi_output_for_events(newValue) { LGraphSettings.allow_multi_output_for_events = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get middle_click_slot_add_default_node() { return LGraphSettings.middle_click_slot_add_default_node; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set middle_click_slot_add_default_node(newValue) { LGraphSettings.middle_click_slot_add_default_node = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get release_link_on_empty_shows_menu() { return LGraphSettings.release_link_on_empty_shows_menu; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set release_link_on_empty_shows_menu(newValue) { LGraphSettings.release_link_on_empty_shows_menu = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get pointerevents_method() { return PointerSettings.pointerevents_method; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set pointerevents_method(newMethod) { PointerSettings.pointerevents_method = newMethod; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get ctrl_shift_v_paste_connect_unselected_outputs() { return LGraphSettings.ctrl_shift_v_paste_connect_unselected_outputs; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set ctrl_shift_v_paste_connect_unselected_outputs(newValue) { LGraphSettings.ctrl_shift_v_paste_connect_unselected_outputs = newValue; },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  get use_uuids() { return LGraphSettings.use_uuids; },
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  set use_uuids(newValue) { LGraphSettings.use_uuids = newValue; },

  registerNodeType,
  unregisterNodeType,
  registerNodeAndSlotType,
  buildNodeClassFromObject,
  wrapFunctionAsNode,
  clearRegisteredTypes,
  addNodeMethod,
  createNode,
  getNodeType,
  getNodeTypesInCategory,
  getNodeTypesCategories,

  // debug purposes: reloads all the js scripts that matches a wildcard
  reloadNodes(folder_wildcard) {
    const tmp = document.getElementsByTagName('script');
    // weird, this array changes by its own, so we use a copy
    const script_files = [];
    for (var i = 0; i < tmp.length; i++) {
      script_files.push(tmp[i]);
    }

    const docHeadObj = document.getElementsByTagName('head')[0];
    folder_wildcard = document.location.href + folder_wildcard;

    for (var i = 0; i < script_files.length; i++) {
      const { src } = script_files[i];
      if (
        !src
                    || src.substr(0, folder_wildcard.length) != folder_wildcard
      ) {
        continue;
      }

      try {
        if (LGraphSettings.debug) {
          console.log(`Reloading: ${src}`);
        }
        const dynamicScript = document.createElement('script');
        dynamicScript.type = 'text/javascript';
        dynamicScript.src = src;
        docHeadObj.appendChild(dynamicScript);
        docHeadObj.removeChild(script_files[i]);
      } catch (err) {
        if (LGraphSettings.throw_errors) {
          throw err;
        }
        if (LGraphSettings.debug) {
          console.log(`Error while reloading ${src}`);
        }
      }
    }

    if (LGraphSettings.debug) {
      console.log('Nodes reloaded');
    }
  },

  /**
   * Register a string in the search box so when the user types it it will recommend this node
   * @method registerSearchboxExtra
   * @param {String} node_type the node recommended
   * @param {String} description text to show next to it
   * @param {Object} data it could contain info of how the node should be configured
   * @return {Boolean} true if they can be connected
   */
  registerSearchboxExtra(node_type, description, data) {
    LGraphNodeRegistry.searchbox_extras[description.toLowerCase()] = {
      type: node_type,
      desc: description,
      data,
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
  fetchFile(url, type, on_complete, on_error) {
    const that = this;
    if (!url) return null;

    type = type || 'text';
    if (url.constructor === String) {
      if (url.substr(0, 4) == 'http' && LGraphSettings.proxy) {
        url = LGraphSettings.proxy + url.substr(url.indexOf(':') + 3);
      }
      return fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error('File not found'); // it will be catch below
          if (type == 'arraybuffer') return response.arrayBuffer();
          if (type == 'text' || type == 'string') return response.text();
          if (type == 'json') return response.json();
          if (type == 'blob') return response.blob();
        })
        .then((data) => {
          if (on_complete) on_complete(data);
        })
        .catch((error) => {
          console.error('error fetching file:', url);
          if (on_error) on_error(error);
        });
    }
    if (url.constructor === File || url.constructor === Blob) {
      const reader = new FileReader();
      reader.onload = function (e) {
        let v = e.target.result;
        if (type == 'json') v = JSON.parse(v);
        if (on_complete) on_complete(v);
      };
      if (type == 'arraybuffer') return reader.readAsArrayBuffer(url);
      if (type == 'text' || type == 'json') return reader.readAsText(url);
      if (type == 'blob') return reader.readAsBinaryString(url);
    }
    return null;
  },

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  cloneObject,
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  uuidv4,
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  isValidConnection,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  compareObjects,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  distance,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  colorToString,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  isInsideRectangle,

  // [minx,miny,maxx,maxy]
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  growBounding,

  // point inside bounding box
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  isInsideBounding,

  // bounding overlap, format: [ startx, starty, width, height ]
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  overlapBounding,

  // Convert a hex value to its decimal value - the inputted hex must be in the
  // format of a hex triplet - the kind we use for HTML colours. The function
  // will return an array with three values.
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  hex2num,

  // Give a array with three values as the argument and the function will return
  // the corresponding hex triplet.
  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  num2hex,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  extendClass,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  getTime,

  /** @deprecated */ // eslint-disable-next-line deprecation/deprecation
  closeAllContextMenus,

  getParameterNames,

  /* helper for interaction: pointer, touch, mouse Listeners used by LGraphCanvas DragAndScale ContextMenu */
  pointerListenerAdd,
  pointerListenerRemove,
};

if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
}

// Bind things onto the LiteGraph object as necessary to match original:
LiteGraph.LGraph = LGraph; // OG
LiteGraph.CurveEditor = CurveEditor; // OG
LiteGraph.LLink = LLink; // OG
LiteGraph.ContextMenu = ContextMenu; // OG
LiteGraph.LGraphGroup = LGraphGroup; // OG
LiteGraph.DragAndScale = DragAndScale; // OG
LiteGraph.LGraphCanvas = LGraphCanvas;
LiteGraph.Subgraph = Subgraph;
LiteGraph.GraphInput = GraphInput;
LiteGraph.GraphOutput = GraphOutput;

// Bind things onto LiteGraph object as necessary to not break dep chains:

// Bind this here because otherwise LGraphEvents.EVENT_LINK_COLOR doesn't resolve:
LGraphCanvas.link_type_colors = {
  '-1': LGraphStyles.EVENT_LINK_COLOR,
  number: '#AAA',
  node: '#DCA',
};

global.clamp = clamp;
