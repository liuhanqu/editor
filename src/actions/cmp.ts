import * as actionTypes from '../constants';

export function updateCmp(data: any) {
  return {
    type: actionTypes.UPDATE_CMP,
    data,
  };
}
