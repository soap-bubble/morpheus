import {
  every,
} from 'lodash';
import {
  selectors as castSelectors,
  actions as castActions,
} from 'morpheus/casts';
import store from 'store';
import renderEvents from 'utils/render';

export default function ({
  dispatch,
  scene,
}) {
  const pixel = new Uint8Array(4);
  const clickStartPos = { left: 0, top: 0 };
  const hitColorList = castSelectors.forScene(scene).hotspot.hitColorList(store.getState());
  let possibleValidClick = false;
  let wasMouseDowned = false;
  let wasMouseMoved = false;
  let wasMouseUpped = false;

  // In order to maintain a high performance webgl context, we want to allow
  //  WebGl to be able to clear it's draw buffer at any time, which means
  //  reading pixel data is only valid immediately after a render.  We therefor
  //  delay checking pixel data until the next render
  let coordsToCheck;

  renderEvents.onAfter(() => {
    if (coordsToCheck && !document.hidden) {
      const { left: x, top } = coordsToCheck;
      const canvas = castSelectors.forScene(scene).hotspot.canvas(store.getState());
      const gl = canvas.getContext('webgl');
      // readPixels reads from lower left so need to inverse top (y) coordinate
      const y = canvas.height - top;

      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

      const hoveredHotspots = [];
      every(hitColorList, ({ color, data: hotspotData }) => {
        // Extract 8-bit color components from 24-bit integer
        // eslint-disable-next-line no-bitwise
        const red = color >>> 16;
        // eslint-disable-next-line
        const green = color >>> 8 & 0xFF;
        // eslint-disable-next-line no-bitwise
        const blue = color & 0xFF;

        // Compare with pixel array
        if (
          red === pixel[0]
          && green === pixel[1]
          && blue === pixel[2]
        ) {
          hoveredHotspots.push(hotspotData);
          return false;
        }
        return true;
      });
      const hovering = !!hoveredHotspots.length;

      // Update our state

      // User initiated event inside a hotspot so could be valid
      if (!possibleValidClick && wasMouseDowned && hovering) {
        possibleValidClick = true;
        clickStartPos.left = coordsToCheck.left;
        clickStartPos.top = coordsToCheck.top;
      }

      // We were a possible valid click, but user left the hotspot so invalidate
      if (wasMouseMoved && possibleValidClick && !hovering) {
        possibleValidClick = false;
      }

      // User pressed and released mouse button inside a valid hotspot
      // TODO: debounce??
      const interactionDistance = Math.sqrt(
        Math.pow(clickStartPos.left - coordsToCheck.left, 2)
         + Math.pow(clickStartPos.top - coordsToCheck.top, 2),
      );
      if (wasMouseUpped && possibleValidClick && hovering && interactionDistance < 20) {
        dispatch(castActions.forScene(scene).hotspot.activated(hoveredHotspots));
      } else {
        dispatch(castActions.forScene(scene).hotspot.hovered(hoveredHotspots));
      }

      // Reset for next time
      possibleValidClick = !wasMouseUpped && possibleValidClick;
      wasMouseMoved = false;
      wasMouseUpped = false;
      wasMouseDowned = false;
      coordsToCheck = null;
    }
  });

  function rememberEvent(mouseEvent) {
    // Grab these right away because of react event object pooling
    //  See https://fb.me/react-event-pooling
    const { clientX: left, clientY: top } = mouseEvent;
    coordsToCheck = { left, top };
  }

  function onTouchStart(touchEvent) {
    const { touches } = touchEvent;
    if (touches.length) {
      wasMouseDowned = true;
      rememberEvent(touches[0]);
    }
  }

  function onTouchMove(touchEvent) {
    const { touches } = touchEvent;
    if (touches.length) {
      wasMouseMoved = true;
      rememberEvent(touches[0]);
    }
  }

  function onTouchEnd(touchEvent) {
    const { touches } = touchEvent;
    if (touches.length) {
      wasMouseUpped = true;
      rememberEvent(touches[0]);
    }
  }

  function onTouchCancel(touchEvent) {

  }

  function onMouseUp(mouseEvent) {
    wasMouseUpped = true;
    rememberEvent(mouseEvent);
  }

  function onMouseMove(mouseEvent) {
    wasMouseMoved = true;
    rememberEvent(mouseEvent);
  }

  function onMouseDown(mouseEvent) {
    wasMouseDowned = true;
    rememberEvent(mouseEvent);
  }

  return {
    onMouseUp,
    onMouseMove,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}
