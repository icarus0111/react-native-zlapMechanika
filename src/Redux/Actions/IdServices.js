import { IDSERVICES } from '../Types';

export const saveIdServices = (idServices) => {
    return {
        type: IDSERVICES,
        idServices: idServices
    };
}