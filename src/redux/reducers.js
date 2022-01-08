import {GET_EMPLOYEE_PROFILE, LOGOUT} from './actions';

const initialState = {
    employee: null
};

function employeesReducer(state = initialState, action) {
    switch (action.type) {
        case GET_EMPLOYEE_PROFILE:
            return { ...state, employee: action.payload };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}

export default employeesReducer;
