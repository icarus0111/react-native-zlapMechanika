import { LOGIN, LOGOUT } from '../Types';

export const login = (idUser, key, role) => {
    return {
        type: LOGIN,
        idUser: idUser,
        key: key,
        role: role
    };
}

export const logout = () => {
    return {
        type: LOGOUT
    };
}