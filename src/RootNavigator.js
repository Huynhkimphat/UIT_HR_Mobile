import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import DayOffLetter from "./screens/DayOffLetter";
import SignIn from "./screens/SignIn";
import Attendance from "./screens/Attendance";
import {Image, StyleSheet, TouchableOpacity, View} from "react-native";
import {Divider, Text} from "@ui-kitten/components";
import React from "react";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useAuth} from "./contexts/Auth";
import {useDispatch} from "react-redux";
import {logout} from "./redux/actions";
import Account from "./screens/Account";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {showSuccessAlert} from "./utils/AlertUtils";
import Security from "./screens/Security";
import Info from "./screens/Info";
import Employee from "./screens/Employee";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


const CustomDrawerContent = (props, auth, dispatch) => {
    const onLogOut = () => {
        props.navigation.closeDrawer();
        dispatch(logout());
        auth.signOut();
        showSuccessAlert("You have been logout!");
    }
    return (
        <View style={{flex: 1}}>
            <DrawerContentScrollView {...props} style={{flex: 1}}>
                <View style={styles.drawerHeader}>
                    <Image style={{width: 60, height: 60}} source={require("../assets/logo.png")}/>
                    <Text style={{marginLeft: 20}} category={"h6"} appearance={"default"} status={"primary"}>HR
                        UIT</Text>
                </View>
                <Divider/>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <TouchableOpacity
                onPress={onLogOut}
                style={styles.logoutContainer}>
                <Text category={"s1"} status={"danger"}>SIGN OUT</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20
    },
    logoutContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 50,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 20
    }
});

function AccountSettingTab() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Account" component={Account} options={{
                headerShown: false,
                tabBarActiveTintColor: "#9155FD",
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons name="account" color={color} size={size}/>
                ),
            }}/>
            <Tab.Screen name="Security" component={Security} options={{
                headerShown: false,
                tabBarActiveTintColor: "#9155FD",
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons name="lock" color={color} size={size}/>
                ),
            }}/>
            <Tab.Screen name="Info" component={Info} options={{
                headerShown: false,
                tabBarActiveTintColor: "#9155FD",
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons name="information" color={color} size={size}/>
                ),
            }}/>
        </Tab.Navigator>
    );
}

const AppStack = () => {
    const auth = useAuth();
    const dispatch = useDispatch();
    const isAdmin = () => {
        return auth?.authData?.type === "Admin";
    }
    return (
        <Drawer.Navigator drawerContent={(props) => CustomDrawerContent(props, auth, dispatch)}
                          initialRouteName="Attendance">
            <Drawer.Screen name="Attendance" options={{
                drawerIcon: () => <MaterialCommunityIcons name={"account-check"} size={24} color={"#9155FD"}/>,
            }} component={Attendance}/>
            <Drawer.Screen name="DayOffLetter" options={{
                drawerLabel: "My Day-off Letter",
                headerTitle: "My Day-off Letter",
                drawerIcon: () => <MaterialCommunityIcons name={"email"} size={24} color={"#9155FD"}/>,
            }} component={DayOffLetter}/>
            {
                isAdmin() && <Drawer.Screen name="Employee" options={{
                    drawerIcon: () => <MaterialCommunityIcons name={"account-group"} size={24} color={"#9155FD"}/>,
                }} component={Employee}/>
            }
            {
                isAdmin() && <Drawer.Screen name="EmployeeSalary" options={{
                    drawerLabel: "Employee Salary",
                    headerTitle: "Employee Salary",
                    drawerIcon: () => <MaterialCommunityIcons name={"credit-card"} size={24} color={"#9155FD"}/>,
                }} component={DayOffLetter}/>
            }
            <Drawer.Screen name="AccountSettings" options={{
                drawerLabel: "Account Settings",
                headerTitle: "Account Settings",
                drawerIcon: () => <MaterialCommunityIcons name={"account-cog"} size={24} color={"#9155FD"}/>,
            }} component={AccountSettingTab}/>
        </Drawer.Navigator>
    );
}

const AuthStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen options={{headerShown: false}} name="signIn" component={SignIn}/>
        </Stack.Navigator>
    );
};

export {AppStack, AuthStack};
