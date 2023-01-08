import { TextInput, View } from 'react-native';
import React, { useRef } from 'react'
import { bg_danger, bg_primary, flex_1, my_10, p_10, Style } from '../../stylesheets/primary-styles';
import { Button } from '@rneui/themed';
import { buildUri } from '../../global.deliveryou';


export function Test({ navigation }) {
    const tryNav = () => {
        try {
            navigation.navigate('test2', {})
        } catch (error) {
            console.log('error: ', error)
        }
    }
    return (
        <View style={[flex_1, p_10, bg_primary]}>
            <Button title={'swicth'} onPress={() => {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const raw = JSON.stringify({
                    "phone": "user1",
                    "password": "user1Pass"
                });

                const requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'manual'
                };

                fetch(buildUri('api/auth/login'), requestOptions)
                    .then(response => response.status)
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
            }} />
        </View>
    )
}