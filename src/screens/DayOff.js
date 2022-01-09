import React, {useState} from "react";
import {FlatList, ScrollView, StyleSheet, View} from "react-native";
import {getAllEmployee, updateDayOffLetter} from "../service/APIService";
import {showFailedAlert, showSuccessAlert} from "../utils/AlertUtils";
import Spinner from "react-native-loading-spinner-overlay";
import {Avatar, Button, Text} from "@ui-kitten/components";

function DayOff({navigation}) {

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);


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

    const resetDayOff = (id) => {
        updateDayOffLetter(id, {dayOffAmount: 15}).then((r) => {
            if (r.data['isSuccess']) {
                showSuccessAlert("Successfully reset day off");
                fetchEmployee();
            }
        }).catch(() => {
            showFailedAlert("Failed to reset day off");
        })
    }

    const renderEmployee = ({index, item}) => {
        return <View key={index} style={styles.item}>
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
            </View>
            <Text style={{marginTop: 5}} category={"s2"}>Remaining Day-Off: {item.primaryDayOff.dayOffAmount}</Text>
            <View style={{
                flexDirection: "row",
                marginTop: 15,
                alignSelf: "flex-end"
            }}>
                <Button
                    onPress={() => resetDayOff(item.primaryDayOff.id)}
                    size={"tiny"}
                    status="primary">
                    Reset Day-Off
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
                data={users}
                renderItem={renderEmployee}
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

export default React.memo(DayOff);
