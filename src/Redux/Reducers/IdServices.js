import { IDSERVICES } from '../Types';

const defaultState = {
  idServices: ''
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case IDSERVICES:
      return Object.assign({}, state, {
        idServices: action.idServices
      });
    default:
      return state;
  }
}