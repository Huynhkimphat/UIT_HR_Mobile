import React, {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from "react-native";
import {Button, Input, Text} from "@ui-kitten/components";
import {useDispatch, useSelector} from "react-redux";
import {useAuth} from "../contexts/Auth";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {getEmployeeProfile} from "../redux/actions";
import bcrypt from "react-native-bcrypt";
import {changePassword} from "../service/APIService";

function Security() {
    const auth = useAuth();
    const dispatch = useDispatch();
    const {employee} = useSelector(state => state.employeeReducer);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [loading, setLoading] = useState(false);

    const saveChanges = async () => {
        if (loading) return;
        if (!currentPassword || !newPassword || !confirmPw || !currentPassword.trim() || !newPassword.trim() || !confirmPw.trim()) {
            showFailedAlert("Password must not empty");
            return;
        }
        if (newPassword !== confirmPw) {
            showFailedAlert("Confirm password must be same with password");
            return;
        }
        setLoading(true);
        const result = await bcrypt.compareSync(currentPassword, employee.primaryAccount.password);
        if (!result) {
            showFailedAlert("Incorrect current password");
            setLoading(false);
            return;
        }
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(confirmPw, salt);

        changePassword(employee?.id, {
            username: '',
            password: hashPassword
        }).then((r) => {
            if (r.data && r.data['isSuccess']) {
                showSuccessAlert("Successfully change password");
                fetchProfile();
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            showFailedAlert("Failed to change password");
        });
    }

    const onCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPw("");
    }

    const fetchProfile = () => {
        try {
            dispatch(getEmployeeProfile(auth.authData?.['employeeId']));
        } catch {
            showFailedAlert("Failed to fetch employee profile");
        }
    };

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={100}
            behavior={Platform.OS === "ios" ? "padding" : ""}
            style={{flex: 1}}
            contentContainerStyle={{flex: 1}}
        >
            <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
                <View style={{alignItems: "center"}}>
                    <Text status={"primary"} category={"h5"}>Change Password</Text>
                </View>
                <View style={{marginTop: 20}}>
                    <Input
                        value={currentPassword}
                        style={{width: "100%"}}
                        secureTextEntry={true}
                        onChangeText={(v) => setCurrentPassword(v)}
                        label='Current Password'
                        placeholder='Place your password'
                    />
                    <Input
                        value={newPassword}
                        style={{marginTop: 10, width: "100%"}}
                        label='New Password'
                        secureTextEntry={true}
                        onChangeText={(v) => setNewPassword(v)}
                        placeholder='Place your password'
                    />
                    <Input
                        style={{marginTop: 10, width: "100%"}}
                        value={confirmPw}
                        onChangeText={(v) => setConfirmPw(v)}
                        secureTextEntry={true}
                        label='Confirm Password'
                        placeholder='Place your password'
                    />
                </View>
                <View style={{
                    flexDirection: "row",
                    marginTop: 15,
                    justifyContent: "flex-end"
                }}>
                    <Button onPress={onCancel} size={"small"} status='danger'>
                        Cancel
                    </Button>
                    <Button disabled={loading} onPress={saveChanges} style={{marginLeft: 20}} size={"small"}
                            status='primary'>
                        Save Changes
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "white",
    }
});

export default React.memo(Security);
