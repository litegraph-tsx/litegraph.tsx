/**
 * This file is now entirely deprecated.
 * Future effort should simply use appropriate pointer* events and DOM addEventListener/removeEventListener as appropriate.
*/

export const PointerSettings = {
  pointerevents_method: 'pointer', // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)
  // TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)
};

/* helper for interaction: pointer, touch, mouse Listeners
    used by LGraphCanvas DragAndScale ContextMenu */
export function pointerListenerAdd(oDOM, sEvIn, fCall, capture = false) {
  if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall !== 'function') {
    // console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
    return; // -- break --
  }

  let sMethod = PointerSettings.pointerevents_method;
  let sEvent = sEvIn;

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
        console.log('debug: Should I send a move event?'); // ???
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
}

export function pointerListenerRemove(oDOM, sEvent, fCall, capture = false) {
  if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall !== 'function') {
    // console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
    return; // -- break --
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
}
