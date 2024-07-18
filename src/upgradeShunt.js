import { LiteGraph, clamp } from '@/litegraph';
import { LGraphCanvas } from '@/LGraphCanvas';
import { LGAudio } from './nodes/audio';
import { LGraphPoints3D } from './nodes/geometry';
import {
  LGraphFXLens, LGraphFXBokeh, LGraphFXGeneric, LGraphFXVigneting,
} from './nodes/glfx';
import { LGraphTexture } from './nodes/gltextures';
import { GL, gl } from './libs/litegl';

let global = typeof (window) !== 'undefined' ? window : typeof (self) !== 'undefined' ? self : globalThis;

global = new Proxy(global, {
  get(target, prop, receiver) {
    // Log a warning whenever a property of 'global' is accessed
    console.trace(`Accessing property '${prop}' of 'global'. Please migrate to ES6 imports.`);
    return Reflect.get(target, prop, receiver);
  },
  // Add other traps as needed (set, deleteProperty, etc.)
});

const {
  LGraph, LLink, ContextMenu, LGraphNode, LGraphGroup, DragAndScale,
} = LiteGraph;

const classesToProtect = {
  LiteGraph,
  LGraph,
  LLink,
  LGraphNode,
  LGraphGroup,
  DragAndScale,
  LGraphCanvas,
  ContextMenu,
  clamp,
  LGAudio,
  LGraphPoints3D,
  LGraphFXLens,
  LGraphFXBokeh,
  LGraphFXGeneric,
  LGraphFXVigneting,
  LGraphTexture,
  GL,
  gl,
};

// Loop over each pair in the object
Object.entries(classesToProtect).forEach(([className, classReference]) => {
  // Attach getter to window object for each class
  Object.defineProperty(window, className, {
    get() {
      console.trace(`Accessing ${className} directly from window object is discouraged. Please import it properly.`);
      return classReference; // Provide the reference to the actual class/function here
    },
    set(newValue) {
      classReference = newValue; // Update the class reference if needed
    },
    configurable: true, // Allows redefinition
  });
});
