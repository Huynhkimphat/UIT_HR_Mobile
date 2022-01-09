import React, {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {useAuth} from "../contexts/Auth";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {getEmployeeProfile} from "../redux/actions";
import {Button, Input} from "@ui-kitten/components";
import moment from "moment";
import {updateAccountInfo, updateAddress} from "../service/APIService";
import DateTimePicker from '@react-native-community/datetimepicker';

function Info() {
    const auth = useAuth();
    const dispatch = useDispatch();
    const {employee} = useSelector(state => state.employeeReducer);

    const [dob, setDob] = useState(new Date(employee?.dateOfBirth));
    const [phoneNumber, setPhoneNumber] = useState(employee?.phoneNumber);
    const [identify, setIdentify] = useState(employee?.identityCard);
    const [city, setCity] = useState(employee?.primaryAddress.city);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const saveChanges = async () => {
        if (loading) return;
        setLoading(true);
        employee.dateOfBirth = moment(dob).format("YYYY-MM-DD");
        employee.identityCard = identify;
        employee.phoneNumber = phoneNumber;

        employee.primaryAddress.city = city;
        await updateAddress(employee?.primaryAddress.id, employee.primaryAddress);

        updateAccountInfo(employee?.id, employee).then((res) => {
            if (res.data && res.data['isSuccess']) {
                fetchProfile();
                showSuccessAlert("Successfully update profile");
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            showFailedAlert("Failed to update profile");
        });
    }

    const fetchProfile = () => {
        try {
            dispatch(getEmployeeProfile(auth.authData?.['employeeId']));
        } catch {
            showFailedAlert("Failed to fetch employee profile");
        }
    };

    const onDobFocus = () => {
        setShow(true);
    }

    const onDobChange = (e, value) => {
        setShow(false);
        if (!value) {
            return;
        }
        setDob(value);
    }

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={100}
            behavior={Platform.OS === "ios" ? "padding" : ""}
            style={{flex: 1}}
            contentContainerStyle={{flex: 1}}
        >
            <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={onDobFocus}>
                    <View pointerEvents={"none"}>
                        <Input
                            pointerEvents={"none"}
                            value={moment(dob).format("MM-DD-YYYY")}
                            editable={false}
                            style={{marginTop: 10, width: "100%"}}
                            label='Date of Birth'
                        />
                    </View>
                </TouchableOpacity>


                {show && (
                    <View>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dob}
                            maximumDate={new Date()}
                            mode={"date"}
                            onChange={onDobChange}
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                        />
                    </View>
                )}
                <Input
                    value={phoneNumber}
                    style={{marginTop: 10, width: "100%"}}
                    label='Phone Number'
                    onChangeText={(v) => setPhoneNumber(v)}
                    placeholder='Place your phone'
                />
                <Input
                    style={{marginTop: 10, width: "100%"}}
                    value={identify}
                    onChangeText={(v) => setIdentify(v)}
                    label='Identity Card'
                    placeholder='Place your Identity Card'
                />
                <Input
                    value={city}
                    onChangeText={(v) => setCity(v)}
                    style={{marginTop: 10, width: "100%"}}
                    label='City'
                    placeholder='Place your city'
                />
                <View style={{
                    flexDirection: "row",
                    marginTop: 15,
                    justifyContent: "flex-end"
                }}>
                    <Button size={"small"} status='danger'>
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

export default React.memo(Info);
