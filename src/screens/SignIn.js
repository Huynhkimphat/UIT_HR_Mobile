import React, {useState} from "react";
import {Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from "react-native";
import {useAuth} from "../contexts/Auth";
import {login} from "../service/APIService";
import {showFailedAlert} from "../utils/AlertUtils";
import {Button} from "react-native-elements";
import {Input, Text, useTheme} from '@ui-kitten/components';
import {Buffer} from "buffer";

function SignIn() {
    const auth = useAuth();
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("test@gmail.com");
    const [password, setPassword] = useState("kimphat2001");

    function parseJwt(token) {
        const base64Payload = token.split('.')[1];
        const payload = Buffer.from(base64Payload, 'base64');
        return JSON.parse(payload.toString());
    }

    const onClickSignIn = () => {
        if (loading) return;
        setLoading(true);
        const body = {username: email, password: password};
        login(body).then((res) => {
            setLoading(false);
            if (res.data && res.data['isSuccess']) {
                let user = parseJwt(res.data.data)
                user.token = res.data.data;
                auth.setAuth(user);
            } else {
                showFailedAlert("Failed to login");
            }
        }).catch(() => {
            showFailedAlert("Failed to login");
            setLoading(false);
        });
    }

    return (
        <KeyboardAvoidingView contentContainerStyle={{flex: 1}} style={{flex: 1}}
                              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.container}>
                    <View style={{marginBottom: 50, display: "flex", alignItems: "center"}}>
                        <Image style={{width: 120, height: 120}} source={require("../../assets/logo.png")}/>
                        <Text category={"h5"} appearance={"default"}>Welcome to
                            HR UIT!</Text>
                    </View>
                    <View style={styles.inputView}>
                        <Input
                            value={email}
                            label='Email'
                            status={"primary"}
                            size={"large"}
                            placeholder='Enter your email.'
                            onChangeText={(email) => setEmail(email)}/>
                    </View>
                    <View style={styles.inputView}>
                        <Input
                            value={password}
                            label='Password'
                            status={"primary"}
                            size={"large"}
                            placeholder='Enter your password.'
                            secureTextEntry={true}
                            onChangeText={(password) => setPassword(password)}
                        />
                    </View>
                    <Button
                        title="LOGIN"
                        loading={loading}
                        onPress={onClickSignIn}
                        buttonStyle={{backgroundColor: theme['color-primary-default']}}
                        containerStyle={{
                            width: "80%",
                            marginTop: 20,
                        }}
                        titleStyle={{color: 'white'}}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
    },
    inputView: {
        borderRadius: 5,
        width: "80%",
        marginBottom: 20,
    }
});

export default React.memo(SignIn);
