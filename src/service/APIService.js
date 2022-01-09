import {privateRequest, publicRequest} from "../utils/axiosInstance";

export const login = async (payload) => {
    return await publicRequest.post(`/login`, payload);
}

export const getEmployee = async (id) => {
    return await privateRequest.get("/employee/" + id);
}

export const createNewAttendance = async (payload) => {
    return await privateRequest.post("/employee/attendance/checkin", payload);
}

export const addAttendance = async (employeeId, attendanceId) => {
    return await privateRequest.patch(`/employee/attendance/${employeeId}/add/${attendanceId}`);
}

export const doCheckOut = async (attendanceId, payload) => {
    return await privateRequest.patch(`/employee/attendance/checkout/${attendanceId}`, payload);
}

export const createNewDayOff = async (payload) => {
    return await privateRequest.post("/employee/day-off-letter", payload);
}

export const addDayOff = async (letterId, employeeId) => {
    return await privateRequest.patch(`/day-off-letter/${letterId}/add/employee/${employeeId}`);
}

export const updateAccountInfo = async (employeeId, payload) => {
    return await privateRequest.patch(`/employee/update/${employeeId}`, payload);
}

export const updateAddress = async (id, payload) => {
    return await privateRequest.patch(`/employee/address/update/${id}`, payload);
}

export const changePassword = async (employeeId, payload) => {
    return await privateRequest.patch(`/employee/account/${employeeId}/change`, payload);
}

export const archiveAccount = async (employeeId) => {
    return await privateRequest.patch(`/employee/delete/${employeeId}`);
}

export const recoverAccount = async (employeeId) => {
    return await privateRequest.patch(`/employee/recover/${employeeId}`);
}

export const getAllEmployee = async () => {
    return await privateRequest.get("/employee/all");
}
