import React, {useState} from "react";
import {FlatList, ScrollView, StyleSheet, View} from "react-native";
import {Avatar, Button, Text} from "@ui-kitten/components";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Moment from "moment";
import {approveDayOffLetter, declineDayOffLetter, getAllEmployee, updateDayOffLetter} from "../service/APIService";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import Spinner from "react-native-loading-spinner-overlay";

function DayOffLetters({navigation}) {

    const [loading, setLoading] = useState(false);
    const [letters, setLetters] = useState([]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDayOffLetter();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchDayOffLetter = () => {
        fetchEmployee().then((employees) => {
            let result = [];
            employees.forEach((employee) => {
                const letters = employee.primaryDayOffLetters.filter(i => i.isApproved === false && i.isArchived === true);
                result = result.concat(letters.map((lt) => {
                    return {
                        employee: employee,
                        letter: lt
                    }
                }));
            });
            setLetters(result);
        });
    }

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const result = await getAllEmployee();
            setLoading(false);
            return result.data;
        } catch (e) {
            setLoading(false);
            showFailedAlert("Failed to fetch day off letters");
        }
    };

    const declineLetter = (id) => {
        declineDayOffLetter(id).then((r) => {
            if (r.data['isSuccess']) {
                showSuccessAlert("Success decline letter");
                fetchDayOffLetter();
            }
        }).catch(() => {
            showFailedAlert("Failed to decline letter");
        });
    }

    const approveLetter = (letter, employee) => {
        approveDayOffLetter(letter.id).then((r) => {
            if (r.data['isSuccess']) {
                let payload = {
                    dayOffAmount: employee.primaryDayOff.dayOffAmount
                };
                payload.dayOffAmount -= Moment(letter.toDateTime).diff(letter.fromDateTime, "days");
                updateDayOffLetter(employee.primaryDayOff.id, payload).then(r => {
                    showSuccessAlert("Success approve letter");
                    fetchDayOffLetter();
                });
            }
        }).catch(() => {
            showFailedAlert("Failed to approve letter");
        });
    }

    const renderDayOff = ({index, item}) => {
        return <View key={index} style={styles.item}>
            <View style={{flexDirection: "row", marginTop: 10}}>
                <Avatar style={styles.avatar} source={require('../../assets/avatars/1.png')}/>
                <View style={{marginLeft: 15, justifyContent: "space-around", flex: 1}}>
                    <Text category={"s2"}
                          appearance={"default"}>{item.employee?.firstName} {item.employee?.lastName}</Text>
                    <Text style={{flexWrap: 'wrap'}} category={"s2"}
                          appearance={"hint"}>{item.employee?.primaryAccount.email}</Text>
                </View>
            </View>
            <View style={{flexDirection: "row", marginTop: 10, alignItems: "center"}}>
                <MaterialCommunityIcons name={"clock"} size={20} color={"black"}/>
                <Text style={{marginLeft: 5, fontSize: 11}}
                      category={"s1"}>{Moment(item.letter.fromDateTime).format('MMMM/DD/YYYY')} - {Moment(item.letter.toDateTime).format('MMMM/DD/YYYY')}</Text>
            </View>
            <View style={{flexDirection: "row", flex: 1, alignItems: "center", marginTop: 10}}>
                <Text category={"c2"} appearance={"hint"}>Reason:</Text>
                <Text style={{flex: 1, flexWrap: 'wrap', marginLeft: 10}} category={"c2"}
                      appearance={"default"}>{item.letter.reason}</Text>
            </View>
            <View style={{
                flexDirection: "row",
                marginTop: 15,
                alignSelf: "flex-end"
            }}>
                <Button onPress={() => declineLetter(item.letter.id)} size={"small"} status='danger'>
                    Dismiss
                </Button>
                <Button onPress={() => approveLetter(item.letter, item.employee)} style={{marginLeft: 10}}
                        size={"small"}
                        status="success">
                    Approve
                </Button>
            </View>
        </View>
    }

    const keyExtractor = (item, index) => index.toString();

    return (
        <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
            <Spinner
                visible={loading}
                size={"small"}
                textStyle={{color: "white", fontSize: 12}}
                textContent={'Loading...'}
            />
            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                keyExtractor={keyExtractor}
                data={letters}
                ListEmptyComponent={<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <Text status={"primary"} category={"h6"}>There are no day-off letters</Text>
                </View>}
                renderItem={renderDayOff}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    item: {
        flexDirection: "column",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginBottom: 10,
        flex: 1,
        alignItems: "flex-start"
    },
    avatar: {
        width: 50, height: 50
    },
});

export default React.memo(DayOffLetters);
