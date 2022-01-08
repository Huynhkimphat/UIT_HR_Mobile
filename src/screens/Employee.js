import React, {useEffect, useState} from "react";
import {FlatList, SafeAreaView, StyleSheet, View} from "react-native";
import {Avatar, Button, Card, Input, Modal, RangeDatepicker, Text, useTheme} from "@ui-kitten/components";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {archiveAccount, changePassword, getAllEmployee, recoverAccount} from "../service/APIService";
import Spinner from 'react-native-loading-spinner-overlay';
import moment from "moment";
import bcrypt from "react-native-bcrypt";


function Employee({navigation}) {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const [dayOffRange, setDayOffRange] = React.useState({});
    const [reason, setReason] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [resetting, setResetting] = useState(false);

    const keyExtractor = (item, index) => index.toString();

    const onCreateNewDayOff = () => {
        setVisible(true);
    }

    useEffect(() => {
        fetchEmployee();
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchEmployee();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchEmployee = () => {
        setLoading(true);
        getAllEmployee().then((r) => {
            setUsers(r.data);
        }).catch(() => {
            showFailedAlert("Failed to fetch users");
        }).finally(() => {
            setLoading(false);
        });
    };

    const onClickEmployee = (employee) => {
        setSelectedEmployee(employee);
        setDetailVisible(true);
    }

    const resetPassword = async (employee) => {
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync("kimphat2001", salt);

        changePassword(employee?.id, {
            username: '',
            password: hashPassword
        }).then((r) => {
            if (r.data && r.data['isSuccess']) {
                showSuccessAlert("Successfully reset password for " + employee.firstName);
            }
        }).catch(() => {
            showFailedAlert("Failed to reset password");
        });
    }

    const onPressChangeStatus = (employee) => {
        if (employee.isArchived) {
            recoverAccount(employee.id).then(() => {
                showSuccessAlert("Successfully recover account");
                fetchEmployee();
            });
        } else {
            archiveAccount(employee.id).then(() => {
                showSuccessAlert("Successfully archive account");
                fetchEmployee();
            });
        }
    }

    const renderEmployee = ({item}) => {
        return (
            <View key={item.id} style={styles.item}>
                <View style={{
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    backgroundColor: theme['color-success-default'],
                    borderRadius: 5,
                    alignSelf: "flex-start"
                }}>
                    <Text category={"c2"} style={{color: "white"}}>Working</Text>
                </View>
                <View style={{flexDirection: "row", marginTop: 10}}>
                    <Avatar style={styles.avatar} source={require('../../assets/avatars/1.png')}/>
                    <View style={{marginLeft: 15, justifyContent: "space-between", flex: 1}}>
                        <Text category={"s2"}
                              appearance={"default"}>{item?.firstName} {item?.lastName}</Text>
                        <Text style={{flexWrap: 'wrap'}} category={"s2"}
                              appearance={"hint"}>{item?.primaryAccount.email}</Text>
                        <Text category={"s2"}
                              appearance={"hint"}>Phone: {item.phoneNumber}</Text>
                    </View>
                    <MaterialCommunityIcons style={{alignSelf: "center"}} onPress={() => onClickEmployee(item)}
                                            size={25} color={"#9155FD"} name={"chevron-right"}/>
                </View>
                <View style={{
                    marginTop: 15,
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                }}>
                    <Button onPress={() => onPressChangeStatus(item)} size={"tiny"}
                            status={item.isArchived ? "primary" : "danger"}>
                        {item.isArchived ? "Recover" : "Delete"}
                    </Button>
                    <Button onPress={() => resetPassword(item)} size={"tiny"}
                            style={{marginLeft: 10}} status='info'>
                        Reset Password
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Button status='primary'
                    onPress={onCreateNewDayOff}
                    accessoryLeft={<MaterialCommunityIcons size={20} color={"white"} name={"plus"}/>}>
                ADD EMPLOYEE
            </Button>
            {
                visible && <View style={styles.block}>
                    <RangeDatepicker
                        label={"Date Range"}
                        status={"primary"}
                        placeholder={"Select date."}
                        range={dayOffRange}
                        onSelect={nextRange => setDayOffRange(nextRange)}
                    />
                    <Input
                        value={reason}
                        onChangeText={(v) => setReason(v)}
                        style={{marginTop: 10}}
                        label='Reason'
                        status={"primary"}
                        placeholder='Enter your reason.'
                    />
                    <View style={{flexDirection: "row", marginTop: 15, justifyContent: "space-between"}}>
                        <Button size={"tiny"} onPress={() => setVisible(false)} status='danger'>
                            Cancel
                        </Button>
                        <Button size={"tiny"} status='primary'>
                            Submit
                        </Button>
                    </View>
                </View>
            }
            <Spinner
                visible={loading}
                size={"small"}
                textStyle={{color: "white", fontSize: 12}}
                textContent={'Loading...'}
            />
            <FlatList
                contentContainerStyle={{flexGrow: 1, marginTop: 15}}
                keyExtractor={keyExtractor}
                data={users}
                renderItem={renderEmployee}
            />
            <Modal visible={detailVisible} backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                <Card disabled={true}>
                    <Text category={"s1"} status={"primary"}
                          style={{alignSelf: "center", marginBottom: 5}}>Information</Text>
                    <Text category={"s2"}>Date Of
                        Birth: {moment(String(selectedEmployee?.dateOfBirth)).format('MM/DD/YYYY')}</Text>
                    <Text category={"s2"}>Join
                        On: {moment(String(selectedEmployee?.createdOn)).format('MM/DD/YYYY')}</Text>
                    <Text category={"s2"}>Street: {selectedEmployee?.primaryAddress.addressLine}</Text>
                    <Text category={"s2"}>Ward: {selectedEmployee?.primaryAddress.ward}</Text>
                    <Text category={"s2"}>District: {selectedEmployee?.primaryAddress.district}</Text>
                    <Text category={"s2"}>City: {selectedEmployee?.primaryAddress.city}</Text>
                    <Text category={"s2"}>Country: {selectedEmployee?.primaryAddress.country}</Text>
                    <Button style={{marginTop: 10}} size={"tiny"} onPress={() => setDetailVisible(false)}>
                        Close
                    </Button>
                </Card>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    block: {
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginVertical: 10
    },
    avatar: {
        width: 60, height: 60
    },
    item: {
        flexDirection: "column",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginBottom: 10,
    }
});

export default React.memo(Employee);
