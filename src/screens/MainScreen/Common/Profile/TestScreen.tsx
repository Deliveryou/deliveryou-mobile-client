import React, { useState, useEffect } from 'react';
import { Button, TextInput, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { mt_25 } from '../../../../stylesheets/primary-styles';

export default function Test() {
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);

    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');



    // useEffect(() => {
    //     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    //     return subscriber; // unsubscribe on unmount
    // }, []);

    // Handle the button press
    function signInWithPhoneNumber(phoneNumber: string) {
        auth().signInWithPhoneNumber(phoneNumber)
            .then(result => {
                console.log('--- result sms: ', result)
            })
            .catch(error => console.log('--- error sms: ', error))
    }


    return (
        <View style={{ marginTop: 100 }}>
            <Button
                title="Phone Number Sign In"
                onPress={() => signInWithPhoneNumber('+84 943445754')}
            />
        </View>
    );

}