import React, {useState} from "react";
import {FlatList, ScrollView, StyleSheet, View} from "react-native";
import {Button, Input, RangeDatepicker, Text, useTheme} from "@ui-kitten/components";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import {addDayOff, createNewDayOff} from "../service/APIService";
import Moment from "moment";
import {getEmployeeProfile} from "../redux/actions";
import {useAuth} from "../contexts/Auth";

function MyDayOffLetter({navigation}) {
    const dispatch = useDispatch();
    const auth = useAuth();
    const theme = useTheme();

    const {employee} = useSelector(state => state.employeeReducer);
    const [visible, setVisible] = useState(false);
    const [dayOffRange, setDayOffRange] = React.useState({});
    const [reason, setReason] = useState("");

    const keyExtractor = (item, index) => index.toString();

    const onCreateNewDayOff = () => {
        setVisible(true);
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile();
        });
        return unsubscribe;
    }, [navigation]);

    const resetForm = () => {
        setVisible(false);
        setDayOffRange({});
        setReason("");
    }

    const fetchProfile = () => {
        try {
            dispatch(getEmployeeProfile(auth.authData?.['employeeId']));
        } catch {
            showFailedAlert("Failed to fetch employee profile");
        }
    };

    const onSubmitNewDayOff = () => {
        if (!reason) {
            showFailedAlert("Please enter your reason");
            return;
        }
        if (!dayOffRange.startDate || !dayOffRange.endDate) {
            showFailedAlert("Please select date");
            return;
        }
        let body = {
            isExisted: false,
            isArchived: false,
            isApproved: false,
            fromDateTime: Moment(new Date(dayOffRange.startDate)).format("YYYY-MM-DD"),
            toDateTime: Moment(new Date(dayOffRange.endDate)).format("YYYY-MM-DD"),
            dayOffCounting: Moment(dayOffRange.endDate.toLocaleDateString()).diff(dayOffRange.startDate.toLocaleDateString(), "days"),
            createdOn: new Date(),
            updatedOn: new Date(),
            reason: reason,
        }
        createNewDayOff(body).then((res) => {
            if (res.data?.['isSuccess']) {
                addDayOff(res.data.data.id, auth.authData?.['employeeId']).then(() => {
                    resetForm();
                    showSuccessAlert("Successfully create new day-off");
                    fetchProfile();
                });
            }
        }).catch((e) => {
            showFailedAlert("Failed to create day-off");
        });
    }

    const renderDayOff = ({item}) => {
        return <View key={item.id} style={styles.item}>
            <View style={{
                paddingVertical: 3,
                paddingHorizontal: 15,
                backgroundColor: item.isArchived ? (item.isApproved ? theme['color-success-default'] : "rgb(251, 140, 0)") : theme['color-danger-default'],
                borderRadius: 5,
            }}>
                <Text category={"c2"}
                      style={{color: "white"}}>{item.isArchived ? (item.isApproved ? "APPROVED" : "PENDING") : "DECLINE"}</Text>
            </View>
            <View style={{flexDirection: "row", marginTop: 10, alignItems: "center"}}>
                <MaterialCommunityIcons name={"clock"} size={20} color={"black"}/>
                <Text style={{marginLeft: 5, fontSize: 11}}
                      category={"s1"}>{Moment(item.fromDateTime).format('MM/DD/YYYY')} - {Moment(item.toDateTime).format('MM/DD/YYYY')}</Text>
            </View>
            <View style={{flexDirection: "row", flex: 1, alignItems: "center", marginTop: 10}}>
                <Text category={"c2"} appearance={"hint"}>Reason:</Text>
                <Text style={{flex: 1, flexWrap: 'wrap', marginLeft: 10}} category={"c2"}
                      appearance={"default"}>{item.reason}</Text>
            </View>
        </View>
    }

    return (
        <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
            <View style={[styles.block, {alignItems: "center"}]}>
                <Text status={"primary"} category={"c2"} appearance={"hint"}>Remaining day-off</Text>
                <Text style={{marginTop: 10}} status={"primary"} category={"h3"}
                      appearance={"default"}>{employee?.primaryDayOff['dayOffAmount']}</Text>
            </View>
            <Button status='primary'
                    onPress={onCreateNewDayOff}
                    accessoryLeft={<MaterialCommunityIcons size={20} color={"white"} name={"plus"}/>}>
                CREATE NEW DAY-OFF LETTER
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
                        <Button onPress={onSubmitNewDayOff} size={"tiny"} status='primary'>
                            Submit
                        </Button>
                    </View>
                </View>
            }
            <FlatList
                contentContainerStyle={{flexGrow: 1, marginTop: 15}}
                keyExtractor={keyExtractor}
                data={employee?.['primaryDayOffLetters'] || []}
                renderItem={renderDayOff}
            />
        </ScrollView>
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
    item: {
        flexDirection: "column",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginBottom: 10,
        flex: 1,
        alignItems: "flex-start"
    }
});

export default React.memo(MyDayOffLetter);
