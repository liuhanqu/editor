import { combineReducers } from 'redux';

import cmp from './cmp';
import editor from './editor';

const rootReducer = combineReducers({
  cmp,
  editor,
});

export default rootReducer;
