import { PROFILE } from '../Types';

export const saveProfile = (profile) => {
  return {
    type: PROFILE,
    profile: profile
  };
}