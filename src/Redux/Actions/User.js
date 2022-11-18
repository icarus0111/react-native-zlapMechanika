import { USER } from '../Types';

export const saveUser = (user) => {
  return {
    type: USER,
    user: user
  };
}