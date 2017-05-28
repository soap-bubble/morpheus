import {
  ENTERING,
  EXITING,
  ENTER,
  EXIT,
} from './actionTypes';

export function doEnter() {
  return {
    type: ENTER,
  };
}

export function doEntering() {
  return {
    type: ENTERING,
  };
}

export function doExit() {
  return {
    type: EXIT,
  };
}

export function doExiting() {
  return {
    type: EXITING,
  };
}