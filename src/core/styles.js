export const LGraphStyles = {
  CANVAS_GRID_SIZE: 10,

  NODE_TITLE_HEIGHT: 30,
  NODE_TITLE_TEXT_Y: 20,
  NODE_SLOT_HEIGHT: 20,
  NODE_WIDGET_HEIGHT: 20,
  NODE_WIDTH: 140,
  NODE_MIN_WIDTH: 50,
  NODE_COLLAPSED_RADIUS: 10,
  NODE_COLLAPSED_WIDTH: 80,
  NODE_TITLE_COLOR: '#999',
  NODE_SELECTED_TITLE_COLOR: '#FFF',
  NODE_TEXT_SIZE: 14,
  NODE_TEXT_COLOR: '#AAA',
  NODE_SUBTEXT_SIZE: 12,
  NODE_DEFAULT_COLOR: '#333',
  NODE_DEFAULT_BGCOLOR: '#353535',
  NODE_DEFAULT_BOXCOLOR: '#666',
  NODE_DEFAULT_SHAPE: 'box',
  NODE_BOX_OUTLINE_COLOR: '#FFF',
  DEFAULT_SHADOW_COLOR: 'rgba(0,0,0,0.5)',
  DEFAULT_GROUP_FONT: 24,

  WIDGET_BGCOLOR: '#222',
  WIDGET_OUTLINE_COLOR: '#666',
  WIDGET_TEXT_COLOR: '#DDD',
  WIDGET_SECONDARY_TEXT_COLOR: '#999',

  LINK_COLOR: '#9A9',
  EVENT_LINK_COLOR: '#A86',
  CONNECTING_LINK_COLOR: '#AFA',

  VALID_SHAPES: ['default', 'box', 'round', 'card'],

  BOX_SHAPE: 1,
  ROUND_SHAPE: 2,
  CIRCLE_SHAPE: 3,
  CARD_SHAPE: 4,
  ARROW_SHAPE: 5,
  GRID_SHAPE: 6, // intended for slot arrays

  LINK_RENDER_MODES: ['Straight', 'Linear', 'Spline'], // helper
  STRAIGHT_LINK: 0,
  LINEAR_LINK: 1,
  SPLINE_LINK: 2,

  NORMAL_TITLE: 0,
  NO_TITLE: 1,
  TRANSPARENT_TITLE: 2,
  AUTOHIDE_TITLE: 3,
  VERTICAL_LAYOUT: 'vertical', // arrange nodes vertically
};

export const node_colors = {
  red: { color: '#322', bgcolor: '#533', groupcolor: '#A88' },
  brown: { color: '#332922', bgcolor: '#593930', groupcolor: '#b06634' },
  green: { color: '#232', bgcolor: '#353', groupcolor: '#8A8' },
  blue: { color: '#223', bgcolor: '#335', groupcolor: '#88A' },
  pale_blue: { color: '#2a363b', bgcolor: '#3f5159', groupcolor: '#3f789e' },
  cyan: { color: '#233', bgcolor: '#355', groupcolor: '#8AA' },
  purple: { color: '#323', bgcolor: '#535', groupcolor: '#a1309b' },
  yellow: { color: '#432', bgcolor: '#653', groupcolor: '#b58b2a' },
  black: { color: '#222', bgcolor: '#000', groupcolor: '#444' },
};
