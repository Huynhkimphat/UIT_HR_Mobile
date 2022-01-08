import React from "react";
import {ScrollView, StyleSheet} from "react-native";

function EmployeeDetail() {
    return (
        <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "white",
    }
});

export default React.memo(EmployeeDetail);
