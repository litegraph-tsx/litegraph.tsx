
import { LiteGraph, LGraph, LLink, LGraphNode, LGraphGroup, DragAndScale, LGraphCanvas, ContextMenu, clamp } from "./core/litegraph.js";
import { LGAudio } from './nodes/audio.js';
import { LGraphPoints3D } from './nodes/geometry.js';
import { LGraphFXLens, LGraphFXBokeh, LGraphFXGeneric, LGraphFXVigneting } from './nodes/glfx.js';
import { LGraphTexture } from "./nodes/gltextures.js";
import { GL, gl } from './libs/litegl.js';

var global = typeof(window) != "undefined" ? window : typeof(self) != "undefined" ? self : globalThis;

global = new Proxy(global, {
  get: function(target, prop, receiver) {
    // Log a warning whenever a property of 'global' is accessed
    console.trace(`Accessing property '${prop}' of 'global'. Please migrate to ES6 imports.`);
    return Reflect.get(target, prop, receiver);
  },
  // Add other traps as needed (set, deleteProperty, etc.)
});

const classesToProtect = {
  'LiteGraph': LiteGraph,
  'LGraph': LGraph,
  'LLink': LLink,
  'LGraphNode': LGraphNode,
  'LGraphGroup': LGraphGroup,
  'DragAndScale': DragAndScale,
  'LGraphCanvas': LGraphCanvas,
  'ContextMenu': ContextMenu,
  'clamp': clamp,
  'LGAudio': LGAudio,
  'LGraphPoints3D': LGraphPoints3D,
  'LGraphFXLens': LGraphFXLens,
  'LGraphFXBokeh': LGraphFXBokeh,
  'LGraphFXGeneric': LGraphFXGeneric,
  'LGraphFXVigneting': LGraphFXVigneting,
  'LGraphTexture':LGraphTexture,
  'GL': GL,
  'gl': gl,
};

// Loop over each pair in the object
Object.entries(classesToProtect).forEach(([className, classReference]) => {
  // Attach getter to window object for each class
  Object.defineProperty(window, className, {
    get: function() {
      console.trace(`Accessing ${className} directly from window object is discouraged. Please import it properly.`);
      return classReference; // Provide the reference to the actual class/function here
    },
    set: function(newValue) {
      classReference = newValue; // Update the class reference if needed
    },
    configurable: true // Allows redefinition
  });
});
