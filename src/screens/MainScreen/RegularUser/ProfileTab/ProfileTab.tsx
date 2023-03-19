import { View, Text, StyleSheet, StatusBar, ToastAndroid, Alert, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@rneui/themed'
import { AuthenticationService } from '../../../../services/AuthenticationService'

export default function ProfileTab({ route, navigation }) {
    const failedLogoutAttempt = useRef(0)

    function failedLogoutAttemptAlert() {
        Alert.alert("😔  Seems like you're having trouble logging out!",
            "If this error persists, try to clear the app data",
            [
                {
                    text: "OK",
                    onPress: () => failedLogoutAttempt.current = 0
                }
            ]
        )
    }

    function logout() {
        AuthenticationService.logout(
            () => {
                DeviceEventEmitter.emit('event.app.authenticationState', false)
                ToastAndroid.show('Logged out', ToastAndroid.SHORT)
            },
            (error) => {
                ToastAndroid.show('Error has occured! Try again', ToastAndroid.SHORT)
                failedLogoutAttempt.current = failedLogoutAttempt.current + 1
                if (failedLogoutAttempt.current === 3)
                    failedLogoutAttemptAlert()
            }
        )
    }

    return (
        <View style={styles.rootContainer}>
            <Button
                title={"Log out"}
                onPress={logout}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    rootContainer: {
        paddingTop: StatusBar.currentHeight
    }
})