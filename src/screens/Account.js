import React, {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from "react-native";
import {Avatar, Button, IndexPath, Input, Select, SelectItem} from "@ui-kitten/components";
import {useDispatch, useSelector} from "react-redux";
import {useAuth} from "../contexts/Auth";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {getEmployeeProfile} from "../redux/actions";
import {updateAccountInfo} from "../service/APIService";

const data = [
    'Active',
    'Inactive',
];

function Account({navigation}) {
    const auth = useAuth();
    const dispatch = useDispatch();

    const {employee} = useSelector(state => state.employeeReducer);
    const [firstName, setFirstname] = useState(employee?.firstName);
    const [lastName, setLastname] = useState(employee?.lastName);
    const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
    const [loading, setLoading] = useState(false);

    const displayValue = data[selectedIndex.row];

    const saveChanges = () => {
        if (!firstName && !lastName) {
            showFailedAlert("Please enter your name!");
            return;
        }
        setLoading(true);
        const selectedStatus = data[selectedIndex.row];
        employee.isArchived = selectedStatus === 'Inactive';
        employee.firstName = firstName;
        employee.lastName = lastName;
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

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile();
        });
        return unsubscribe;
    }, [navigation]);

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
                    <Avatar shape={"square"} style={styles.avatar} source={require('../../assets/avatars/1.png')}/>
                </View>
                <View style={{marginTop: 20}}>
                    <Input
                        value={firstName}
                        style={{marginTop: 10, width: "100%"}}
                        onChangeText={(v) => setFirstname(v)}
                        label='First name'
                        placeholder='Place your Text'
                    />
                    <Input
                        value={lastName}
                        style={{marginTop: 10, width: "100%"}}
                        label='Last name'
                        onChangeText={(v) => setLastname(v)}
                        placeholder='Place your Text'
                    />
                    <Input
                        style={{marginTop: 10, width: "100%"}}
                        value={employee?.primaryAccount.email}
                        label='Email'
                        editable={false}
                        placeholder='Place your Text'
                    />
                    <Input
                        value={auth.authData?.type}
                        style={{marginTop: 10, width: "100%"}}
                        label='Role'
                        editable={false}
                        placeholder='Place your Text'
                    />
                    <Select style={{marginTop: 10, width: "100%"}}
                            label={"Status"}
                            onSelect={index => setSelectedIndex(index)}
                            value={displayValue}
                            selectedIndex={selectedIndex}>
                        <SelectItem title='Active'/>
                        <SelectItem title='Inactive'/>
                    </Select>
                </View>
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
    },
    avatar: {
        width: 100,
        height: 100
    }
});

export default React.memo(Account);
