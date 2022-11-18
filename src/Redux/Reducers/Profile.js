import { PROFILE } from '../Types';

const defaultState = {
  profile: ''
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case PROFILE:
      return Object.assign({}, state, {
        profile: action.profile
      });
    default:
      return state;
  }
}