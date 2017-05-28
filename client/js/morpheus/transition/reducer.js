import createReducer from 'utils/createReducer';
import {
  TRANSITION_START,
  TRANSITION_END,
} from './actionTypes';

const reducer = createReducer('transition', {}, {
  [TRANSITION_START](transition, { payload: data }) {
    return {
      ...transition,
      data,
    };
  },
  [TRANSITION_END](transition) {
    return {
      ...transition,
      data: null,
    };
  },
});

export default reducer;