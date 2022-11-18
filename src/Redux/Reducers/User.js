import { USER } from '../Types';

const defaultState = {
  user: ''
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case USER:
      return Object.assign({}, state, {
        user: action.user
      });
    default:
      return state;
  }
}