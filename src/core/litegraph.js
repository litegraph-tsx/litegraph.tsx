import { console } from './Console';
import { ContextMenu } from './ContextMenu';
import { CurveEditor } from './CurveEditor';
import { DragAndScale } from './DragAndScale';
import { LGraphEvents } from './events';
import { LGraph } from './LGraph';
import { LGraphCanvas } from './LGraphCanvas';
import { LGraphGroup } from './LGraphGroup';
import { LGraphNode } from './LGraphNode';
import { LLink } from './LLink';
import { PointerSettings } from './pointer_events';
import { LGraphStyles } from './styles';
import { LGraphSettings } from './settings';
import {
  colorToString,
  compareObjects,
  distance,
  extendClass,
  getTime,
  growBounding,
  hex2num,
  isInsideBounding,
  isInsideRectangle,
  num2hex,
  overlapBounding,
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
  registered_node_types: {}, // nodetypes by string
  node_types_by_file_extension: {}, // used for dropping files in the canvas
  Nodes: {}, // node types by classname
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
  registered_slot_in_types: {}, // slot types for nodeclass
  registered_slot_out_types: {}, // slot types for nodeclass
  slot_types_in: [], // slot types IN
  slot_types_out: [], // slot types OUT
  slot_types_default_in: [], // specify for each IN slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  slot_types_default_out: [], // specify for each OUT slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search

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

  /**
   * Register a node class so it can be listed when the user wants to create a new one
   * @method registerNodeType
   * @param {String} type name of the node and path
   * @param {Class} base_class class containing the structure of a node
   */
  registerNodeType(type, base_class) {
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

    const prev = this.registered_node_types[type];
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
            this.node_types_by_file_extension[ext.toLowerCase()] = base_class;
          }
        }
      }
    }

    this.registered_node_types[type] = base_class;
    if (base_class.constructor.name) {
      this.Nodes[classname] = base_class;
    }
    if (LiteGraph.onNodeTypeRegistered) {
      LiteGraph.onNodeTypeRegistered(type, base_class);
    }
    if (prev && LiteGraph.onNodeTypeReplaced) {
      LiteGraph.onNodeTypeReplaced(type, base_class, prev);
    }

    // warnings
    if (base_class.prototype.onPropertyChange) {
      console.warn(`LiteGraph node class ${type} has onPropertyChange method, it must be called onPropertyChanged with d at the end`);
    }

    // TODO one would want to know input and ouput :: this would allow through registerNodeAndSlotType to get all the slots types
    if (LGraphSettings.auto_load_slot_types) {
      // TODO: figure out a way to do this without instantiating a node instance.
      // new base_class(base_class.title || 'tmpnode');
    }
  },

  /**
         * removes a node type from the system
         * @method unregisterNodeType
         * @param {String|Object} type name of the node or the node constructor itself
         */
  unregisterNodeType(type) {
    const base_class = type.constructor === String
      ? this.registered_node_types[type]
      : type;
    if (!base_class) {
      throw `node type not found: ${type}`;
    }
    delete this.registered_node_types[base_class.type];
    if (base_class.constructor.name) {
      delete this.Nodes[base_class.constructor.name];
    }
  },

  /**
        * Save a slot type and his node
        * @method registerSlotType
        * @param {String|Object} type name of the node or the node constructor itself
        * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
        */
  registerNodeAndSlotType(type, slot_type, out) {
    out = out || false;
    const base_class = type.constructor === String
                && this.registered_node_types[type] !== 'anonymous'
      ? this.registered_node_types[type]
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
      if (this[registerTo][slotType] === undefined) {
        this[registerTo][slotType] = { nodes: [] };
      }
      if (!this[registerTo][slotType].nodes.includes(class_type)) {
        this[registerTo][slotType].nodes.push(class_type);
      }

      // check if is a new type
      if (!out) {
        if (!this.slot_types_in.includes(slotType.toLowerCase())) {
          this.slot_types_in.push(slotType.toLowerCase());
          this.slot_types_in.sort();
        }
      } else if (!this.slot_types_out.includes(slotType.toLowerCase())) {
        this.slot_types_out.push(slotType.toLowerCase());
        this.slot_types_out.sort();
      }
    }
  },

  /**
         * Create a new nodetype by passing an object with some properties
         * like onCreate, inputs:Array, outputs:Array, properties, onExecute
         * @method buildNodeClassFromObject
         * @param {String} name node name with namespace (p.e.: 'math/sum')
         * @param {Object} object methods expected onCreate, inputs, outputs, properties, onExecute
         */
  buildNodeClassFromObject(
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
    this.registerNodeType(name, classobj);
    return classobj;
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
  wrapFunctionAsNode(
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
      const names = LiteGraph.getParameterNames(func);
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
    this.registerNodeType(name, classobj);
    return classobj;
  },

  /**
         * Removes all previously registered node's types
         */
  clearRegisteredTypes() {
    this.registered_node_types = {};
    this.node_types_by_file_extension = {};
    this.Nodes = {};
    this.searchbox_extras = {};
  },

  /**
         * Adds this method to all nodetypes, existing and to be created
         * (You can add it to LGraphNode.prototype but then existing node types wont have it)
         * @method addNodeMethod
         * @param {Function} func
         */
  addNodeMethod(name, func) {
    LGraphNode.prototype[name] = func;
    for (const i in this.registered_node_types) {
      const type = this.registered_node_types[i];
      if (type.prototype[name]) {
        type.prototype[`_${name}`] = type.prototype[name];
      } // keep old in case of replacing
      type.prototype[name] = func;
    }
  },

  /**
   * Create a node of a given type with a name. The node is not attached to any graph yet.
   * @method createNode
   * @param {String} type full name of the node class. p.e. "math/sin"
   * @param {String} name a name to distinguish from other nodes
   * @param {Object} options to set options
   */

  createNode(type, title, options) {
    const base_class = this.registered_node_types[type];
    if (!base_class) {
      console.warn('[LiteGraph]', '[createNode]', `GraphNode type "${type}" not registered.`);
      return null;
    }

    const prototype = base_class.prototype || base_class;

    title = title || base_class.title || type;

    let node = null;

    if (LGraphSettings.catch_exceptions) {
      try {
        node = new base_class(title);
      } catch (err) {
        console.error('[LiteGraph]', '[createNode]', err);
        return null;
      }
    } else {
      node = new base_class(title);
    }

    node.type = type;

    if (!node.title && title) {
      node.title = title;
    }
    if (!node.properties) {
      node.properties = {};
    }
    if (!node.properties_info) {
      node.properties_info = [];
    }
    if (!node.flags) {
      node.flags = {};
    }
    if (!node.size) {
      node.size = node.computeSize();
      // call onresize?
    }
    if (!node.pos) {
      node.pos = LGraphSettings.DEFAULT_POSITION.concat();
    }
    if (!node.mode) {
      node.mode = LGraphEvents.ALWAYS;
    }

    // extra options
    if (options) {
      for (const i in options) {
        node[i] = options[i];
      }
    }

    // callback
    if (node.onNodeCreated) {
      node.onNodeCreated();
    }

    return node;
  },

  /**
         * Returns a registered node type with a given name
         * @method getNodeType
         * @param {String} type full name of the node class. p.e. "math/sin"
         * @return {Class} the node class
         */
  getNodeType(type) {
    return this.registered_node_types[type];
  },

  /**
         * Returns a list of node types matching one category
         * @method getNodeType
         * @param {String} category category name
         * @return {Array} array with all the node classes
         */

  getNodeTypesInCategory(category, filter) {
    const r = [];
    for (const i in this.registered_node_types) {
      const type = this.registered_node_types[i];
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
  },

  /**
         * Returns a list with all the node type categories
         * @method getNodeTypesCategories
         * @param {String} filter only nodes with ctor.filter equal can be shown
         * @return {Array} array with all the names of the categories
         */
  getNodeTypesCategories(filter) {
    const categories = { '': 1 };
    for (var i in this.registered_node_types) {
      const type = this.registered_node_types[i];
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
  },

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
    this.searchbox_extras[description.toLowerCase()] = {
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

  // used to create nodes from wrapping functions
  getParameterNames(func) {
    return (`${func}`)
      .replace(/[/][/].*$/gm, '') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  /**/
      .split('){', 1)[0]
      .replace(/^[^(]*[(]/, '') // extract the parameters
      .replace(/=[^,]+/g, '') // strip any ES6 defaults
      .split(',')
      .filter(Boolean); // split & filter [""]
  },

  /* helper for interaction: pointer, touch, mouse Listeners used by LGraphCanvas DragAndScale ContextMenu */
  pointerListenerAdd(oDOM, sEvIn, fCall, capture = false) {
    if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall !== 'function') {
      console.log(`cant pointerListenerAdd ${oDOM}, ${sEvent}, ${fCall}`);
      return; // -- break --
    }

    let sMethod = PointerSettings.pointerevents_method;
    var sEvent = sEvIn;

    // UNDER CONSTRUCTION
    // convert pointerevents to touch event when not available
    if (sMethod == 'pointer' && !window.PointerEvent) {
      console.warn("sMethod=='pointer' && !window.PointerEvent");
      console.log(`Converting pointer[${sEvent}] : down move up cancel enter TO touchstart touchmove touchend, etc ..`);
      switch (sEvent) {
        case 'down': {
          sMethod = 'touch';
          sEvent = 'start';
          break;
        }
        case 'move': {
          sMethod = 'touch';
          // sEvent = "move";
          break;
        }
        case 'up': {
          sMethod = 'touch';
          sEvent = 'end';
          break;
        }
        case 'cancel': {
          sMethod = 'touch';
          // sEvent = "cancel";
          break;
        }
        case 'enter': {
          console.log('debug: Should I send a move event?'); // ??? Should you?
          break;
        }
        // case "over": case "out": not used at now
        default: {
          console.warn(`PointerEvent not available in this browser ? The event ${sEvent} would not be called`);
        }
      }
    }

    switch (sEvent) {
      // both pointer and move events
      case 'down':
      case 'up':
      case 'move':
      case 'over':
      case 'out':
      case 'enter':
        oDOM.addEventListener(sMethod + sEvent, fCall, capture);
        return;

        // only pointerevents
      case 'leave':
      case 'cancel':
      case 'gotpointercapture':
      case 'lostpointercapture':
        if (sMethod != 'mouse') {
          oDOM.addEventListener(sMethod + sEvent, fCall, capture);
          return;
        }
    }
    oDOM.addEventListener(sEvent, fCall, capture);
  },

  pointerListenerRemove(oDOM, sEvent, fCall, capture = false) {
    if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall !== 'function') {
      console.log(`cant pointerListenerRemove ${oDOM}, ${sEvent}, ${fCall}`);
      return;
    }
    switch (sEvent) {
      // both pointer and move events
      case 'down':
      case 'up':
      case 'move':
      case 'over':
      case 'out':
      case 'enter':
        if (PointerSettings.pointerevents_method == 'pointer' || PointerSettings.pointerevents_method == 'mouse') {
          oDOM.removeEventListener(PointerSettings.pointerevents_method + sEvent, fCall, capture);
        }
        return;

        // only pointerevents
      case 'leave':
      case 'cancel':
      case 'gotpointercapture':
      case 'lostpointercapture':
        if (PointerSettings.pointerevents_method == 'pointer') {
          oDOM.removeEventListener(PointerSettings.pointerevents_method + sEvent, fCall, capture);
        }
        return;
    }
    // not "pointer" || "mouse"
    oDOM.removeEventListener(sEvent, fCall, capture);
  },
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

// Bind things onto LiteGraph object as necessary to not break dep chains:

// Bind this here because otherwise LiteGraph.EVENT_LINK_COLOR doesn't resolve:
LGraphCanvas.link_type_colors = {
  '-1': LGraphStyles.EVENT_LINK_COLOR,
  number: '#AAA',
  node: '#DCA',
};

// used to create nodes from wrapping functions
LiteGraph.getParameterNames = function (func) {
  return (`${func}`)
    .replace(/[/][/].*$/gm, '') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  /**/
    .split('){', 1)[0]
    .replace(/^[^(]*[(]/, '') // extract the parameters
    .replace(/=[^,]+/g, '') // strip any ES6 defaults
    .split(',')
    .filter(Boolean); // split & filter [""]
};

global.clamp = clamp;
