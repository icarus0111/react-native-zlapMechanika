import { FCMTOKEN } from '../Types';

const defaultState = {
  fcmToken: ''
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case FCMTOKEN:
      return Object.assign({}, state, {
        fcmToken: action.fcmToken
      });
    default:
      return state;
  }
}