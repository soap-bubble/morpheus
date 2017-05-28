import { createSelector } from 'reselect';

export const backgroundSceneData = state => state.scene.backgroundScene;
export const currentSceneData = state => state.scene.currentScene;
export const previousSceneData = state => state.scene.previousScene;
export const isEntering = state => state.scene.status === 'entering';
export const isExiting = state => state.scene.status === 'exiting';
export const isLive = state => state.scene.status === 'live';
export const currentSceneId = createSelector(
  currentSceneData,
  cs => cs.sceneId,
);