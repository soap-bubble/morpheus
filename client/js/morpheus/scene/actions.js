import {
  defer,
} from 'lodash';

import { bySceneId } from 'service/scene';
import {
  actions as gameActions,
} from 'morpheus/game';
import {
  actions as hotspotActions,
} from 'morpheus/hotspot';
import {
  SCENE_LOAD_START,
  SCENE_LOAD_COMPLETE,
  SCENE_SET_BACKGROUND_SCENE,
  SCENE_SET_CURRENT_SCENE,
  SCENE_DO_ENTERING,
  SCENE_DO_ENTER,
  SCENE_DO_EXITING,
  SCENE_DO_ACTION,
} from './actionTypes';

const sceneCache = {};

export function sceneLoadComplete(responseData) {
  return (dispatch) => {
    dispatch({
      type: SCENE_SET_CURRENT_SCENE,
      payload: responseData,
    });
    dispatch(hotspotActions.hotspotsLoaded(responseData));
  };
}

export function sceneLoadStarted(id, fetch) {
  return {
    type: SCENE_LOAD_START,
    payload: id,
    meta: fetch,
  };
}

export function fetchScene(id) {
  return (dispatch) => {
    if (sceneCache[id]) {
      return sceneCache[id];
    }
    const fetch = bySceneId(id)
      .then(response => response.data)
      .then((sceneData) => {
        dispatch(sceneLoadComplete(sceneData));
        return sceneData;
      });
    dispatch(sceneLoadStarted(id, fetch));
    return fetch;
  };
}

export function setBackgroundScene(scene) {
  return {
    type: SCENE_SET_BACKGROUND_SCENE,
    payload: scene,
  };
}

export function setCurrentScene(scene) {
  return {
    type: SCENE_SET_CURRENT_SCENE,
    payload: scene,
  };
}

export function doEntering() {
  return {
    type: SCENE_DO_ENTERING,
  };
}

export function doEnter() {
  return {
    type: SCENE_DO_ENTER,
  };
}

export function doExiting(scene) {
  defer(() => {
    scene.casts
      .filter(cast => cast.isExiting()
        && cast.isEnabled())
      .forEach(cast => cast.doEntering());
  });
  return {
    type: SCENE_DO_EXITING,
    payload: scene,
  };
}

export function doOnStageAction(scene) {
  defer(() => {
    scene.casts
    .filter(cast => (cast.isEntering()
      || cast.isOnStage())
      && cast.isEnabled())
    .forEach(cast => cast.doAction());
  });
  return {
    type: SCENE_DO_ACTION,
    payload: scene,
  };
}

export function goToScene(id) {
  return (dispatch, getState) => {
    const { scene } = getState();
    const { current } = scene;

    if (id !== 0 && (!current || current !== id)) {
      return dispatch(fetchScene(id))
        .then(() => dispatch(doEntering()))
        .then(() => dispatch(gameActions.display()));
    }
    return Promise.resolve();
  };
}