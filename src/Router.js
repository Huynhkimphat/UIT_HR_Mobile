import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth} from "./contexts/Auth";
import {ActivityIndicator, SafeAreaView, View} from "react-native";
import {AppStack, AuthStack} from "./RootNavigator";
import {StatusBar} from "expo-status-bar";
import FlashMessage from "react-native-flash-message";
import Constants from 'expo-constants';

export const Router = () => {
    const {authData, loading} = useAuth();
    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                }}>
                <ActivityIndicator color={'#01a0a0'} animating={true} size="small"/>
            </View>
        )
    }

    return (
        <NavigationContainer>
            <StatusBar/>
            {authData?.token ? <AppStack/> : <AuthStack/>}
            <FlashMessage position="top"
                          statusBarHeight={Constants.statusBarHeight}
                          hideOnPress={true}
                          style={{justifyContent: 'flex-start', alignItems: 'center'}}
            />
        </NavigationContainer>
    );
}
