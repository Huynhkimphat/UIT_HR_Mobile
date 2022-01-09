import React, {useEffect, useState} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import {Avatar, Button, IndexPath, Select, SelectItem, Text, useTheme} from "@ui-kitten/components";
import {getAllEmployee, getSalaryByMonthYear} from "../service/APIService";
import {showFailedAlert} from "../utils/AlertUtils";
import Spinner from "react-native-loading-spinner-overlay";

const months = [
    {month: 'January', value: 1},
    {month: 'February', value: 2},
    {month: 'March', value: 3},
    {month: 'April', value: 4},
    {month: 'May', value: 5},
    {month: 'June', value: 6},
    {month: 'July', value: 7},
    {month: 'August', value: 8},
    {month: 'September', value: 9},
    {month: 'October', value: 10},
    {month: 'November', value: 11},
    {month: 'December', value: 12},
];
const years = [2021, 2022];

function EmployeeSalary() {
    const theme = useTheme();

    const keyExtractor = (item, index) => index.toString();
    const [users, setUsers] = useState([]);
    const [salaries, setSalaries] = useState([]);

    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new IndexPath(0));
    const [year, setYear] = useState(new IndexPath(0));

    useEffect(() => {
        const monthIndex = months.findIndex((item) => item.value === (new Date().getMonth() + 1));
        setMonth(new IndexPath(monthIndex));
        const yearIndex = years.findIndex((item) => item === (new Date().getFullYear()));
        setYear(new IndexPath(yearIndex));
        fetchEmployee();
    }, []);

    useEffect(() => {
        onClickSearch();
    }, [users]);

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

    const onClickSearch = () => {
        const selectedMonth = months[month.row].value;
        const selectedYear = years[year.row];
        search(selectedMonth, selectedYear);
    }

    const search = (month, year) => {
        setLoading(true);
        getSalaryByMonthYear(month, year).then((r) => {
            setSalaries(r.data);
        }).finally(() => {
            setLoading(false);
        });
    }

    function getColor(index) {
        if (!salaries[index]) {
            return theme['color-danger-default'];
        } else {
            return theme['color-success-default'];
        }
    }

    const renderEmployeeSalary = ({index, item}) => {
        return (
            <View key={item.id} style={styles.item}>
                <View style={{
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    borderRadius: 5,
                    alignSelf: "flex-start",
                    backgroundColor: getColor(index)
                }}>
                    <Text status={"danger"} category={"c2"}
                          style={{color: "white"}}>{salaries[index] ? "SUCCESS" : "WAITING"}</Text>
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
                </View>
            </View>
        )
    }

    const displayValue = months[month.row].month;
    const displayYearValue = years[year.row];

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Select
                    label={"Month"}
                    style={{flex: 1}}
                    placeholder='Default'
                    value={displayValue}
                    selectedIndex={month}
                    onSelect={index => setMonth(index)}>
                    {
                        months.map((item) => {
                            return (
                                <SelectItem title={item.month}/>
                            )
                        })
                    }
                </Select>
                <Select
                    testID={"1"}
                    label={"Year"}
                    value={displayYearValue}
                    style={{flex: 1, marginLeft: 20}}
                    selectedIndex={year}
                    placeholder='Default'
                    onSelect={index => setYear(index)}>
                    {
                        years.map((item) => {
                            return (
                                <SelectItem title={item.toString()}/>
                            )
                        })
                    }
                </Select>
            </View>
            <View style={{alignSelf: "flex-end"}}>
                <Button onPress={onClickSearch} status={"primary"}>SEARCH</Button>
            </View>
            <Text style={{marginVertical: 10}} category={"s1"} appearance={"hint"}>Employee Salaries</Text>
            <FlatList
                contentContainerStyle={{flexGrow: 1}}
                keyExtractor={keyExtractor}
                data={users}
                extraData={salaries}
                renderItem={renderEmployeeSalary}
            />
            <Spinner
                visible={loading}
                size={"small"}
                textStyle={{color: "white", fontSize: 12}}
                textContent={'Loading...'}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        padding: 10
    },
    subContainer: {
        flexDirection: "row", padding: 10, backgroundColor: "white", borderRadius: 5, marginBottom: 10
    },
    item: {
        flexDirection: "column",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 5,
        marginBottom: 10,
    }
});

export default React.memo(EmployeeSalary);
