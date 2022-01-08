import {getEmployee} from "../service/APIService";

export const GET_EMPLOYEE_PROFILE = 'GET_EMPLOYEE_PROFILE';
export const LOGOUT = 'LOGOUT';

export const getEmployeeProfile = (id) => {
    try {
        return async dispatch => {
            const response = await getEmployee(id);
            if (response.data) {
                dispatch({
                    type: GET_EMPLOYEE_PROFILE,
                    payload: response.data
                });
            } else {
                throw new Error("Unable to getEmployeeProfile!");
            }
        };
    } catch {
        throw new Error("Unable to getEmployeeProfile!");
    }
};

export const logout = () => {
    return dispatch => {
        dispatch({
            type: LOGOUT,
        });
    }
}
