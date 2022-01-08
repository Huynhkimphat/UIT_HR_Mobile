import React, {useEffect, useState} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import {Avatar, Button, Text, useTheme} from "@ui-kitten/components";
import {useDispatch, useSelector} from "react-redux";
import {getEmployeeProfile} from "../redux/actions";
import {useAuth} from "../contexts/Auth";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Moment from 'moment';
import {addAttendance, createNewAttendance, doCheckOut} from "../service/APIService";

let interval = () => {
};

function Attendance({navigation}) {
    const dispatch = useDispatch();
    const auth = useAuth();
    const theme = useTheme();
    const {employee} = useSelector(state => state.employeeReducer);
    const [isCheckIn, setCheckIn] = useState(false);
    const [loading, setLoading] = useState(false);

    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [hours, setHours] = useState(0);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (employee?.employeeAttendances[0]['isProgressing'] === true) {
            setCheckIn(true);
        }
    }, [employee]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (isCheckIn && employee?.employeeAttendances[0]['isProgressing'] === true) {
            const diff = Moment.duration(Moment(new Date()).diff(employee?.employeeAttendances[0]['fromDate']));
            setHours(diff.hours());
            setMinutes(diff.minutes());
            setSeconds(diff.seconds());
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [isCheckIn, employee]);

    useEffect(() => {
        if (seconds >= 59) {
            setMinutes(minutes => minutes + 1);
            setSeconds(0);
        }
    }, [seconds]);

    useEffect(() => {
        if (minutes >= 59 && seconds >= 59) {
            setMinutes(0);
            setHours(hours => hours + 1);
        }
    }, [minutes]);


    const updateTimer = () => {
        setSeconds(seconds => seconds + 1);
    }

    const resetTimer = () => {
        clearInterval(interval);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
    }

    const fetchProfile = () => {
        try {
            dispatch(getEmployeeProfile(auth.authData?.['employeeId']));
        } catch {
            showFailedAlert("Failed to fetch employee profile");
        }
    };

    const checkIn = () => {
        if (loading) return;
        resetTimer();
        setLoading(true);
        let body = {
            fromDate: Moment(new Date()).format("MM/DD/YYYY, hh:mm:ss A"),
            toDate: Moment(new Date()).format("MM/DD/YYYY, hh:mm:ss A"),
            isProgressing: true,
            period: 0,
            isExisted: false,
            isArchived: false,
        }
        createNewAttendance(body).then((res) => {
            if (res.data && res.data['isSuccess']) {
                let employeeId = auth.authData?.['employeeId'];
                addAttendance(employeeId, res.data.data.id).then(() => {
                    fetchProfile();
                    showSuccessAlert("Check In successfully");
                    setCheckIn(true);
                    setLoading(false);
                });
            }
        }).catch(() => {
            showFailedAlert("Failed to check in");
            setLoading(false);
        });
    }

    const checkOut = () => {
        if (loading) return;
        setLoading(true);
        let body = {
            isProgressing: false,
            isExisted: false,
            isArchived: false,
            toDate: Moment(new Date()).format("MM/DD/YYYY, hh:mm:ss A"),
            fromDate: Moment(employee?.employeeAttendances[0]['fromDate']).format("MM/DD/YYYY, hh:mm:ss A"),
            period: Moment(new Date()).diff(employee?.employeeAttendances[0]['fromDate'], "minute")
        };
        doCheckOut(employee?.employeeAttendances[0].id, body).then((res) => {
            if (res.data?.["isSuccess"]) {
                fetchProfile();
                showSuccessAlert("Check out successfully");
                setCheckIn(false);
                setLoading(false);
                resetTimer();
            }
        }).catch(() => {
            showFailedAlert("Failed to check out");
            setLoading(false);
        });
    }

    const keyExtractor = (item, index) => index.toString();

    const renderAttendance = ({item}) => {
        return <View key={item.id} style={styles.attendanceItem}>
            <View style={{
                paddingVertical: 3,
                paddingHorizontal: 15,
                backgroundColor: item.isProgressing ? theme['color-danger-default'] : theme['color-success-default'],
                borderRadius: 5,
                alignSelf: "flex-end"
            }}>
                <Text category={"c2"} style={{color: "white"}}>{item.isProgressing ? "Progressing" : "Done"}</Text>
            </View>
            <Text category={"s2"} status={"primary"} style={{marginTop: 10}}>Period: {item.period}</Text>
            <View style={{flexDirection: "row", marginTop: 10, alignItems: "center"}}>
                <MaterialCommunityIcons name={"clock"} size={20} color={"black"}/>
                <Text style={{marginLeft: 5, fontSize: 11}}
                      category={"s1"}>{Moment(item.fromDate).format('MMMM DD YYYY, h:mm a')} {item.isProgressing ? "" : " - " + Moment(item.toDate).format('MMMM DD YYYY, h:mm a')}</Text>
            </View>
        </View>
    }

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Avatar style={styles.avatar} source={require('../../assets/avatars/1.png')}/>
                <View style={{marginLeft: 30, justifyContent: "space-around", flex: 1}}>
                    <View style={styles.infoItem}>
                        <Text style={{width: 50}} appearance={"hint"}>Name:</Text>
                        <Text category={"s1"}
                              appearance={"default"}>{employee?.firstName} {employee?.lastName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={{width: 50}} appearance={"hint"}>Email:</Text>
                        <Text style={{flex: 1, flexWrap: 'wrap'}} category={"s1"}
                              appearance={"default"}>{employee?.primaryAccount.email}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={{width: 50}} appearance={"hint"}>Role:</Text>
                        <Text category={"s1"}
                              appearance={"default"}>{auth.authData?.type}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.subContainer}>
                <View style={{flex: 1, alignItems: "flex-start"}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text category={"s2"} appearance={"hint"}>Status: </Text>
                        <Text status={isCheckIn ? "success" : "danger"} category={"s1"}
                              appearance={"default"}>{isCheckIn ? "Working" : "Missing"}</Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center", marginTop: 10}}>
                        <Text category={"s2"} appearance={"hint"}>Date: </Text>
                        <Text
                            category={"s2"}>{Moment(new Date()).format("MM/DD/YYYY")}</Text>
                    </View>

                    <Button size={"tiny"} style={{marginTop: 10}}
                            disabled={loading}
                            onPress={isCheckIn ? checkOut : checkIn}
                            status={isCheckIn ? "danger" : "success"}>{isCheckIn ? "CHECK OUT" : "CHECK IN"}</Button>
                </View>
                <View style={{alignItems: "center", justifyContent: "space-evenly"}}>
                    <Text category={"p2"} appearance={"hint"}>WORKING TIME</Text>
                    <Text category={"h6"}>{hours}:{minutes}:{seconds}</Text>
                </View>
            </View>
            <Text style={{marginBottom: 10, marginLeft: 10}} category={"s1"} appearance={"hint"}>Attendance
                Information</Text>
            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                keyExtractor={keyExtractor}
                data={employee?.['employeeAttendances'] || []}
                renderItem={renderAttendance}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, padding: 10
    }, subContainer: {
        flexDirection: "row", padding: 10, backgroundColor: "white", borderRadius: 5, marginBottom: 20
    }, attendanceItem: {
        flexDirection: "column",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginBottom: 10,
        flex: 1,
        alignItems: "flex-start"
    }, infoItem: {
        flexDirection: "row",
    }, avatar: {
        width: 100, height: 100
    }
});

export default React.memo(Attendance);
