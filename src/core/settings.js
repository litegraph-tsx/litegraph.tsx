export const LGraphSettings = {

  VERSION: 0.4,

  MAX_NUMBER_OF_NODES: 1000, // avoid infinite loops
  DEFAULT_POSITION: [100, 100], // defa

  proxy: null, // used to redirect calls
  node_images_path: '',

  debug: false,
  catch_exceptions: true,
  throw_errors: true,
  allow_scripts: false, // if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
  use_deferred_actions: true, // executes actions during the graph execution flow

  auto_sort_node_types: false, // [true!] If set to true, will automatically sort node types / categories in the context menus

  node_box_coloured_when_on: false, // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
  node_box_coloured_by_mode: false, // [true!] nodebox based on node mode, visual feedback

  dialog_close_on_mouse_leave: false, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  dialog_close_on_mouse_leave_delay: 500,

  shift_click_do_break_link_from: false, // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
  click_do_break_link_to: false, // [false!]prefer false, way too easy to break links

  search_hide_on_mouse_leave: true, // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  search_filter_enabled: false, // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
  search_show_all_on_open: true, // [true!] opens the results list when opening the search widget

  auto_load_slot_types: false, // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]

  alt_drag_do_clone_nodes: false, // [true!] very handy, ALT click to clone and drag the new node

  do_add_triggers_slots: false, // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this

  allow_multi_output_for_events: true, // [false!] being events, it is strongly reccomended to use them sequentially, one by one

  middle_click_slot_add_default_node: false, // [true!] allows to create and connect a ndoe clicking with the third button (wheel)

  release_link_on_empty_shows_menu: false, // [true!] dragging a link to empty space will open a menu, add from list, search or defaults

  ctrl_shift_v_paste_connect_unselected_outputs: true, // [true!] allows ctrl + shift + v to paste nodes with the outputs of the unselected nodes connected with the inputs of the newly pasted nodes

  // if true, all newly created nodes/links will use string UUIDs for their id fields instead of integers.
  // use this if you must have node IDs that are unique across all graphs and subgraphs.
  use_uuids: false,

};
