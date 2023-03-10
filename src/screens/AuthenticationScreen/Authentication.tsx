import { View, ScrollView, ImageBackground, SafeAreaView, StatusBar, DeviceEventEmitter, StyleSheet, Dimensions, Pressable, ToastAndroid, Alert } from 'react-native';
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { align_items_center, align_self_center, bg_danger, bg_dark, bg_primary, bg_transparent, Style, bg_white, border_radius_pill, flex_1, fs_normal, fw_bold, h_100, justify_center, mt_10, mt_15, my_15, overflow_hidden, position_center, position_relative, px_10, p_0, p_10, resize_center, size_fill, text_white, w_100 } from '../../stylesheets/primary-styles';
import { mergeStyles } from '../../utils/style-helpers';
import { Tab, Text, TabView, Button, Divider, Dialog, Image } from '@rneui/themed';
import { BlurView } from '@react-native-community/blur';
import { InputField, InputFieldRef } from '../../components/InputField';
import { Authenticate } from '../../screen_handlers/Authenticate';
import { debounce, delay, Prioritizer } from '../../utils/ultilities';
import { AxiosError } from 'axios';
import { Global } from '../../Global';
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { AuthenticationService } from '../../services/AuthenticationService';

const prioritizer = new Prioritizer.FirstOnlyMode(100)

function LogIn() {
    const phoneRef: { current?: InputFieldRef } = useRef()
    const passwordRef: { current?: InputFieldRef } = useRef()

    const phoneValue: { current: string } = useRef('')
    const passwordValue: { current: string } = useRef('')

    const loginButtonSize = Style.dimen(50, 200)
    const [loadingDialogVisible, setLoadingDialogVisible] = useState(false)

    const doLogin = () => {
        Authenticate.login({
            phone: phoneValue.current,
            password: passwordValue.current,
            onValidatePasswordFail: () => {
                passwordRef.current?.setInvalid?.(true)
                prioritizer.run(() => ToastAndroid.show('Password must contain at least:\n8 characters (1 number and 1 letter)', 2000))
            },
            onValidatePhoneFail: () => {
                phoneRef.current?.setInvalid?.(true)
                prioritizer.run(() => ToastAndroid.show('ONLY support vietnamese number', 2000))
            },
            onLoginStart: async () => {
                setLoadingDialogVisible(true)
                console.log('dialog: ', loadingDialogVisible)
                console.log('start')
                await delay(1000)
            },
            onLoginFail: (error: AxiosError) => {
                setLoadingDialogVisible(false)
                console.log('dialog: ', loadingDialogVisible)
                console.log('Failed to log in: ', error.cause)
            },
            onLoginSuccess(response) {
                setLoadingDialogVisible(false)
                Global.User.CurrentUser.setType(response.userType)
                Global.User.CurrentUser.id = response.id

                AuthenticationService.securelySaveCredential(
                    response as AuthenticationService.LogInResponse,
                    () => {
                        DeviceEventEmitter.emit('event.app.authenticationState', true)
                    },
                    (error) => {
                        Alert.alert('⚠️ Attention',
                            'An error occured when saving for login information!\n\n' +
                            'Your credential will be required when re-launched.',
                            [{
                                text: 'OK',
                                onPress: () => {
                                    DeviceEventEmitter.emit('event.app.authenticationState', true)
                                }
                            }])
                    }
                )

                ToastAndroid.show('Logged in', ToastAndroid.SHORT)
            },
        })
    }

    const toggleDialog = () => {
        setLoadingDialogVisible(!loadingDialogVisible)
        console.log('toggling')
    }

    return (
        <>
            <InputField
                containerStyle={[mt_15]}
                placeholder='Phone number'
                returnKeyType='next'
                onSubmitEditing={() => {
                    passwordRef.current?.focus?.()
                }}
                blurOnSubmit={false}
                ref={phoneRef}
                onChangeText={(text) => phoneValue.current = text}
                textContentType={'telephoneNumber'}
            />

            <InputField
                containerStyle={[mt_15]}
                placeholder='Password'
                // ref={passwordInput}
                onChangeText={(text) => passwordValue.current = text}
                ref={passwordRef}
                onSubmitEditing={doLogin}
                textContentType={'newPassword'}
                secureTextEntry={true}
            />

            <View style={position_center}>
                <Button
                    buttonStyle={[loginButtonSize, border_radius_pill, overflow_hidden]}
                    title={'LOG IN'}
                    containerStyle={[overflow_hidden, border_radius_pill, loginButtonSize, mt_15]}
                    onPress={doLogin} />
            </View>

            <Divider style={[my_15, { width: '55%' }, align_self_center]} width={0.5} />

            <Pressable style={position_center}>
                <Text style={text_white}>Reset password</Text>
            </Pressable>

            <Dialog overlayStyle={Style.dimen(100, 100)} isVisible={loadingDialogVisible}>
                <Dialog.Loading />
            </Dialog>
        </>
    )
}

function SignUp() {
    return (
        <>
            <InputField
                containerStyle={[mt_15]}
                placeholder='Phone number'
                returnKeyType='next'
                onSubmitEditing={() => {
                    passwordInput.current.focus?.()
                }}
                blurOnSubmit={false}
                onChangeText={(text) => phoneValue.current = text}
            />
        </>
    )
}


export default function Authentication({ navigation, route }, args: any) {

    let { style, backgroundImageSource } = args
    const [reset, setReset] = useState(0)
    const [index, setIndex] = useState(0);

    useEffect(() => {
        StatusBar.setTranslucent(true)
        StatusBar.setBarStyle('dark-content')
        StatusBar.setBackgroundColor('#ffffff00')
    }, [])

    useEffect(() => {
        console.log('resetted')
    }, [reset])

    style = useMemo(() => mergeStyles(style), [args.style])

    return (
        <View style={[flex_1]}>
            <ImageBackground source={require('../../resources/backgrounds/authentication.webp')} style={[styles.imgBg]}>
                <BlurView
                    style={styles.topLogoWrapper}
                    blurAmount={14}
                    blurType='light'
                    overlayColor=''
                >
                    <ScrollView contentContainerStyle={{ marginTop: StatusBar.currentHeight }}>
                        <Image style={styles.topLogo} source={require('../../resources/brand/logo-dark.png')} />
                        <View>
                            <Tab
                                value={index}
                                onChange={(e) => setIndex(e)}
                                indicatorStyle={{
                                    backgroundColor: 'grey',
                                    height: 3,
                                }}
                                variant="default">
                                <Tab.Item
                                    style={[border_radius_pill, bg_dark]}
                                    title="Log in"
                                    titleStyle={fs_normal}
                                    icon={{ name: 'envira', type: 'font-awesome' }} />
                                <Tab.Item
                                    title="Sign up"
                                    titleStyle={fs_normal}
                                    icon={{ name: 'heart', type: 'ionicon', color: 'white' }} />
                            </Tab>
                        </View>
                    </ScrollView>
                </BlurView>

                <TabView value={index} onChange={setIndex} animationType="spring">
                    <TabView.Item style={[w_100, bg_transparent]}>
                        <ScrollView
                            style={[size_fill, px_10]}
                            contentContainerStyle={[flex_1, justify_center]}>
                            <LogIn />
                        </ScrollView>
                    </TabView.Item>
                    <TabView.Item style={[w_100, bg_transparent]}>
                        <ScrollView
                            style={[size_fill, px_10]}
                            contentContainerStyle={[flex_1, justify_center]}>
                            <SignUp />
                        </ScrollView>
                    </TabView.Item>
                </TabView>

            </ImageBackground>
        </View>
    )
}

const MARGIN_TOP: number = 10 + ((StatusBar.currentHeight != undefined) ? StatusBar.currentHeight : 0)
const CLR_BLUR = 'rgba(255, 255, 255, 0.55)'

const styles = StyleSheet.create({
    topLogoWrapper: {
        backgroundColor: CLR_BLUR,
        paddingBottom: 2
    },
    topLogo: {
        ...w_100,
        height: 100,
        ...resize_center,
        //marginTop: MARGIN_TOP,
    },
    imgBg: {
        flex: 1,
    }
})


