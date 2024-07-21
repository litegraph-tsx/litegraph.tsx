import { LiteGraph } from '@/litegraph';
import { LGraphSettings } from '@/settings';
import { PointerSettings } from '@/pointer_events';

LGraphSettings.debug = false;
LGraphSettings.catch_exceptions = true;
LGraphSettings.throw_errors = true;
LGraphSettings.allow_scripts = false; // if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration); which could lead to exploits

LiteGraph.searchbox_extras = {}; // used to add extra features to the search box
LGraphSettings.auto_sort_node_types = true; // [true!] If set to true; will automatically sort node types / categories in the context menus
LGraphSettings.node_box_coloured_when_on = true; // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action); visual feedback
LGraphSettings.node_box_coloured_by_mode = true; // [true!] nodebox based on node mode; visual feedback
LGraphSettings.dialog_close_on_mouse_leave = true; // [false on mobile] better true if not touch device;
LGraphSettings.dialog_close_on_mouse_leave_delay = 500;
LGraphSettings.shift_click_do_break_link_from = false; // [false!] prefer false if results too easy to break links
LGraphSettings.click_do_break_link_to = false; // [false!]prefer false; way too easy to break links
LGraphSettings.search_hide_on_mouse_leave = true; // [false on mobile] better true if not touch device;
LGraphSettings.search_filter_enabled = true; // [true!] enable filtering slots type in the search widget; !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
LGraphSettings.search_show_all_on_open = true; // [true!] opens the results list when opening the search widget

LGraphSettings.auto_load_slot_types = true; // [if want false; use true; run; get vars values to be statically set; than disable] nodes types and nodeclass association with node types need to be calculated; if dont want this; calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
/* // set these values if not using auto_load_slot_types
LiteGraph.registered_slot_in_types = {}; // slot types for nodeclass
LiteGraph.registered_slot_out_types = {}; // slot types for nodeclass
LiteGraph.slot_types_in = []; // slot types IN
LiteGraph.slot_types_out = []; // slot types OUT */

LGraphSettings.alt_drag_do_clone_nodes = true; // [true!] very handy; ALT click to clone and drag the new node
LGraphSettings.do_add_triggers_slots = true; // [true!] will create and connect event slots when using action/events connections; !WILL CHANGE node mode when using onTrigger (enable mode colors); onExecuted does not need this
LGraphSettings.allow_multi_output_for_events = false; // [false!] being events; it is strongly reccomended to use them sequentially; one by one
LGraphSettings.middle_click_slot_add_default_node = true; // [true!] allows to create and connect a ndoe clicking with the third button (wheel)
LGraphSettings.release_link_on_empty_shows_menu = true; // [true!] dragging a link to empty space will open a menu, add from list, search or defaults
PointerSettings.pointerevents_method = 'mouse'; // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)
LGraphSettings.ctrl_shift_v_paste_connect_unselected_outputs = true; // [true!] allows ctrl + shift + v to paste nodes with the outputs of the unselected nodes connected with the inputs of the newly pasted nodes
