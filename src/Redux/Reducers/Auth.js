import { LOGIN, LOGOUT } from '../Types';

const defaultState = {
  idUser: '',
  key: '',
  role: '',
}

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case LOGIN:
      return Object.assign({}, state, {
        idUser: action.idUser,
        key: action.key,
        role: action.role
      });
    case LOGOUT:
      return Object.assign({}, state, {
        idUser: '',
        key: '',
        role: ''
      });
    default:
      return state;
  }
}