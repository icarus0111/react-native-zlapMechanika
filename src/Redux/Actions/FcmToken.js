import { FCMTOKEN } from '../Types';

export const updateFcmToken = (fcmToken) => {
    return {
        type: FCMTOKEN,
        fcmToken: fcmToken
    };
}