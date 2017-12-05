import { AnyAction } from "redux";

import * as actionTypes from "../constants";

const initialState = {
  activeCmp: 'c0001'
}
const editor = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default editor;
