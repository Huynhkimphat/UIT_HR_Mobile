import {showMessage} from "react-native-flash-message";

export const showSuccessAlert = (message, duration) => {
    showMessage({
        message: message,
        icon: 'success',
        type: "success",
        duration: duration || 3000
    });
};

export const showFailedAlert = (message, duration) => {
    showMessage({
        message: message,
        icon: 'warning',
        type: "danger",
        duration: duration || 3500
    });
};
