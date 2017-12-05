import { AnyAction } from 'redux';

import * as actionTypes from '../constants';

const initialState: ICmps = {
  ids: ['c0001'],
  c0001: {
    type: 'btn',
    text: '按钮',
    style: {
      top: 10,
      left: 10,
      width: 120,
      height: 40,
      rotate: 0,
      backgroundColor: '#eee',
    },
  },
};

const cmp = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case actionTypes.UPDATE_CMP:
      const id = state.ids[0];
      state[id].style = {
        ...state[id].style,
        ...action.data.style,
      };
      return {
        ...state,
        [id]: {
          ...state[id]
        }
      };
    default:
      return state;
  }
};

export default cmp;
