import { View, Text, StyleSheet, ScrollView, ImageBackground, StatusBar, TouchableNativeFeedback, DeviceEventEmitter, Pressable, ToastAndroid } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Style, align_items_center, bg_black, bg_danger, bg_warning, bg_white, border_radius_pill, bottom_0, flex_1, flex_row, fw_600, fw_700, fw_800, fw_bold, justify_center, m_15, ml_20, mr_10, mr_15, mt_10, mt_20, mt_5, my_25, overflow_hidden, p_20, p_5, position_absolute, px_10, px_20, py_5, right_0, text_white, w_100 } from '../../stylesheets/primary-styles';
import { Avatar, Button, Dialog, Icon, TabView } from '@rneui/themed';
import { Shadow } from 'react-native-shadow-2'
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler';
import { TextInputProps } from 'react-native';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Validator from '../../utils/Validator';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GraphQLService } from '../../services/GraphQLService';
import { ImageUploadService } from '../../services/ImageUploadService';
import { AuthenticationService } from '../../services/AuthenticationService';


function regulateDateValue(value: number) {
    return ((value < 10) ? '0' : '') + value
}

export default function RegisterScreen() {
    const navigation = useNavigation()

    const [index, setIndex] = useState(0)
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    const [photoUrl, setPhotoUrl] = useState<string>()
    const [firstname, setFirstname] = useState<string>()
    const [lastname, setLastname] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [phone, setPhone] = useState<string>()
    const [dob, setDob] = useState<Date>()

    const [dialogVisible, setDialogVisible] = useState(false)

    useEffect(() => {
        const stack = StatusBar.pushStackEntry({
            barStyle: 'dark-content'
        })

        return () => {
            StatusBar.popStackEntry(stack)
        }
    }, [])

    const canDisableNext = useMemo(() => {
        switch (index) {
            case 0: return (photoUrl === undefined)
            case 1: return !(firstname && lastname && dob)
            default: return true
        }
    }, [index, photoUrl, firstname, lastname, dob])

    const canRegister = useMemo(() => {
        return (photoUrl !== undefined && firstname !== undefined
            && lastname !== undefined && dob !== undefined
            && phone !== undefined && password !== undefined)
    }, [photoUrl, firstname, lastname, dob, phone, password])

    function onTab2DataSet(data: Tab2Data) {
        setFirstname(data.firstname)
        setLastname(data.lastname)
        setDob(data.dob)
    }

    function onTab3DataSet(data: Tab3Data) {
        setPhone(data.phone)
        setPassword(data.password)
    }

    function register() {
        if (
            firstname !== undefined && lastname !== undefined && dob !== undefined &&
            photoUrl !== undefined && phone !== undefined && password !== undefined
        ) {
            setDialogVisible(true)

            // upload photo
            ImageUploadService.upload(photoUrl, {
                onUploaded(url) {
                    // upload user
                    const month = regulateDateValue(dob.getMonth() + 1)
                    const day = regulateDateValue(dob.getDate())
                    const dateOfBirth = `${dob.getFullYear()}-${month}-${day}`
                    const user: GraphQLService.Type.User = {
                        id: 0,
                        firstName: firstname,
                        lastName: lastname,
                        phone,
                        password,
                        dateOfBirth,
                        profilePictureUrl: url
                    }

                    AuthenticationService.register(
                        user,
                        () => setDialogVisible(false),
                        (error) => setDialogVisible(false)
                    )

                },
                onUploadFailure(error) {
                    ToastAndroid.show('Error occured when uploading!', ToastAndroid.LONG)
                    setDialogVisible(false)
                },
            })


        }
    }

    return (
        <ImageBackground
            style={[flex_1]}
            source={require('../../resources/backgrounds/authentication.webp')}
        >
            <BlurView
                overlayColor='transparent'
                blurRadius={10}
            >
                <View style={[Style.backgroundColor('#ffffff99'), p_20, { paddingTop: StatusBar.currentHeight }, Style.height(100)]}>
                    <Text style={[{ textAlign: 'center', marginTop: 3 }, Style.fontSize(20), fw_600]}>Create New Account</Text>
                    <TouchableNativeFeedback
                        onPress={navigation.goBack}
                        style={p_5}
                    >
                        <Icon
                            name='chevron-back'
                            type='ionicon'
                            size={26}
                            containerStyle={[position_absolute, { marginTop: StatusBar.currentHeight, left: 20 }]}
                        />
                    </TouchableNativeFeedback>
                </View>
            </BlurView>

            <TabView value={index} onChange={setIndex} animationType="spring">
                <Tab1
                    photoUrl={photoUrl}
                    onPhotoChosen={(path) => setPhotoUrl(path)}
                />
                <Tab2
                    onData1Set={onTab2DataSet}
                />
                <Tab3
                    onDataSet={onTab3DataSet}
                />
            </TabView>

            <View style={[flex_row, position_absolute, { zIndex: 2 }, bottom_0, m_15]}>
                <Button
                    title={'Previous'}
                    color={'#ffffff99'}
                    buttonStyle={[border_radius_pill, Style.height(45)]}
                    titleStyle={[Style.textColor('#1a659e'), fw_600]}
                    containerStyle={[flex_1, mr_15]}
                    disabled={(index === 0)}
                    disabledStyle={[Style.backgroundColor('#ffffff99')]}
                    disabledTitleStyle={Style.textColor('#6c757d')}
                    onPress={() => setIndex((index > 0) ? index - 1 : 0)}
                />
                {
                    (index === 2) ?
                        <Button
                            title={'Register'}
                            color={'#ffffff99'}
                            buttonStyle={[border_radius_pill, Style.height(45)]}
                            titleStyle={[Style.textColor('#006d77'), fw_600]}
                            containerStyle={flex_1}
                            onPress={register}
                            disabledStyle={[Style.backgroundColor('#ffffff99')]}
                            disabledTitleStyle={Style.textColor('#6c757d')}
                            disabled={!canRegister}
                        />
                        :
                        <Button
                            title={'Next'}
                            color={'#ffffff99'}
                            buttonStyle={[border_radius_pill, Style.height(45)]}
                            titleStyle={[Style.textColor('#006d77'), fw_600]}
                            containerStyle={flex_1}
                            onPress={() => setIndex((index < 2) ? index + 1 : 2)}
                            disabledStyle={[Style.backgroundColor('#ffffff99')]}
                            disabledTitleStyle={Style.textColor('#6c757d')}
                            disabled={canDisableNext}
                        />
                }
            </View>
            <Dialog isVisible={dialogVisible}>
                <Dialog.Loading />
            </Dialog>
        </ImageBackground>
    )
}

// -------------------------------------

function Tab1(props: {
    photoUrl?: string
    onPhotoChosen: (path: string) => void
}) {
    const navigation = useNavigation()

    useEffect(() => {
        DeviceEventEmitter.addListener('event.ProfileEditor.onPhotoChosen', (photoPath: string) => {
            props.onPhotoChosen(photoPath)
        })
    }, [])

    function openCamera() {
        navigation.navigate("CameraScreen" as never)
    }

    return (
        <TabView.Item style={w_100}>
            <View style={[flex_1, p_20]}>
                <View style={[align_items_center, my_25, { marginTop: 60 }]}>
                    <Shadow
                        distance={10}
                        startColor='#8d99ae4d'
                        containerStyle={[my_25]}
                        style={[Style.borderRadius(500), Style.backgroundColor('#dee2e6e6')]}
                    >
                        <Avatar
                            source={(props.photoUrl) ? { uri: props.photoUrl } : undefined}
                            size={150}
                            rounded
                            containerStyle={[Style.border('#fff', 5, 'solid')]}
                            icon={{ name: 'person-circle-sharp', type: 'ionicon', color: '#fff', size: 130 }}
                            iconStyle={[{ paddingLeft: 8, top: 0 }]}
                        />
                    </Shadow>
                    <Button
                        title={'Upload A Photo'}
                        color={'#219ebcf2'}
                        buttonStyle={[border_radius_pill, Style.height(45)]}
                        titleStyle={[Style.textColor('#fff'), fw_600, px_10]}
                        onPress={openCamera}
                    />
                </View>

                <BlurView
                    overlayColor='transparent'
                    blurRadius={10}
                >
                    <View style={[Style.backgroundColor('#ffffff99'), p_20, Style.borderRadius(10)]}>
                        <View style={flex_row}>
                            <Icon size={20} name='sticky-note' type='font-awesome' color={'#ff7b00'} style={[border_radius_pill, mr_10, Style.backgroundColor('#d68c4573'), Style.padding(8)]} />
                            <Text style={[flex_1, Style.fontSize(15)]}>Profile photo is required for security season</Text>
                        </View>
                    </View>
                </BlurView>

            </View>
        </TabView.Item>
    )
}

// ------------------------------------

type Tab2Data = { firstname: string, lastname: string, dob: Date }

function Tab2(props: {
    onData1Set: (data: Tab2Data) => void
}) {
    const navigation = useNavigation()
    const firstname = useRef<string>()
    const lastname = useRef<string>()
    const [dob, setDob] = useState<Date>()
    const [firstnameError, setFirstnameError] = useState<string>('*Required')
    const [lastnameError, setLastnameError] = useState<string>('*Required')
    const [dobError, setDobError] = useState<string>('*Required')

    function openDatePicker() {
        const allowedDate = new Date()
        allowedDate.setFullYear(allowedDate.getFullYear() - 13)

        DateTimePickerAndroid.open({
            value: allowedDate,
            onChange: (event, date) => {
                if (date) {
                    setDob(date)
                    setDobError('')
                }
            },
            maximumDate: allowedDate
        })
    }

    function onFNTyped(text: string) {
        text = text.trim().replace(/\s+/gm, ' ')
        if (text === '') {
            setFirstnameError('*Required')
            return
        }

        if (/^\p{L}+[\p{L}\s]*$/u.test(text)) {
            firstname.current = text
            setFirstnameError('')
        } else
            setFirstnameError('Invalid name')
    }

    function onLNTyped(text: string) {
        text = text.trim().replace(/\s+/gm, ' ')
        if (text === '') {
            setLastnameError('*Required')
            return
        }

        if (/^\p{L}+[\p{L}\s]*$/u.test(text)) {
            lastname.current = text
            setLastnameError('')
        } else
            setLastnameError('Invalid name')
    }

    useEffect(() => {
        if (firstname.current && lastname.current && dob)
            props.onData1Set({
                firstname: firstname.current,
                lastname: lastname.current,
                dob
            })
    }, [firstnameError, lastnameError, dobError])

    return (
        <TabView.Item style={w_100}>
            <View style={[flex_1, p_20, justify_center]}>
                <CustomInput
                    inputProps={{
                        placeholder: 'First name',
                        onChangeText: onFNTyped
                    }}
                    error={firstnameError}
                />
                <CustomInput
                    containerStyle={[mt_20]}
                    inputProps={{
                        placeholder: 'Last name',
                        onChangeText: onLNTyped
                    }}
                    error={lastnameError}
                />
                <CustomInput
                    onContainerPress={openDatePicker}
                    containerStyle={[mt_20]}
                    inputProps={{
                        placeholder: 'Date of birth',
                        editable: false,
                        value: dob?.toUTCString(),
                    }}
                    error={dobError}
                />
            </View>
        </TabView.Item>
    )
}

// ------------------------------------

type Tab3Data = { phone: string | undefined, password: string | undefined }

function Tab3(props: {
    onDataSet: (data: Tab3Data) => void
}) {
    const [phone, setPhone] = useState<string>()
    const [password, setPassword] = useState<string>()

    const [phoneError, setPhoneError] = useState<string>('*Required')
    const [otpError, setOtpError] = useState<string>()
    const [passError, setPassError] = useState<string>('*Required') // *
    const [confirmPassError, setConfirmPassError] = useState<string>() // *

    const [otpConfirmation, setOtpConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult>()
    const [confirmedOtp, setConfirmedOtp] = useState(false) // *

    function onPhoneTyped(text: string) {
        setOtpConfirmation(undefined)
        setConfirmedOtp(false)
        setOtpError(undefined)

        text = text.trim()

        if (text === '') {
            setPhoneError('*Required')
            return
        }

        Validator.validate(
            Validator.TYPE.PHONE.VN,
            text,
            () => {
                setPhoneError('')
                setPhone(text)
            },
            () => {
                setPhoneError('Invalid phone number')
                setPhone(undefined)
            }
        )
    }

    function sendOtp() {
        setOtpError('')
        setConfirmedOtp(false)

        if (phone) {
            const sphone = phone.replace(/^(0|84)/, '+84')
            console.log('>>>>> phone: ', sphone)
            auth().signInWithPhoneNumber(sphone)
                .then(res => {
                    setOtpConfirmation(res)
                    ToastAndroid.show('SMS has been sent!', ToastAndroid.LONG)
                })
                .catch(error => {
                    console.log('>>> error sms: ', error)
                    ToastAndroid.show('Failed to send sms!', ToastAndroid.LONG)
                })
        }
    }

    function onOtpTyped(text: string) {
        if (otpConfirmation && text.length === 6) {
            otpConfirmation.confirm(text)
                .then(_ => {
                    setOtpError('')
                    setConfirmedOtp(true)
                })
                .catch(error => {
                    console.log('>>>>>> error: ', error)
                    setOtpError('Incorrect OTP!')
                })
        }
    }

    function onPasswordTyped(text: string) {
        if (text === '') {
            setPassError('*Required')
            return
        }

        Validator.validate(
            Validator.TYPE.PASSWORD,
            text,
            () => {
                setPassword(text)
                setPassError('')
                setConfirmPassError('Password mismatched!')
            },
            () => {
                setPassword(undefined)
                setPassError('Invalid password!')
            }
        )
    }

    function onConfirmPassTyped(text: string) {
        if (password && password === text)
            setConfirmPassError('')
        else
            setConfirmPassError('Password mismatched!')
    }

    useEffect(() => {
        if (confirmedOtp && passError === '' && confirmPassError === '' && phone && password)
            props.onDataSet({ phone, password })
        else
            props.onDataSet({ phone: undefined, password: undefined })
    }, [confirmedOtp, passError, confirmPassError])

    return (
        <TabView.Item style={w_100}>
            <View style={[flex_1, p_20, justify_center]}>
                <View style={flex_row}>
                    <CustomInput
                        containerStyle={[flex_1, mr_10]}
                        inputProps={{
                            placeholder: 'Phone number',
                            keyboardType: 'phone-pad',
                            onChangeText: onPhoneTyped
                        }}
                        error={phoneError}
                    />
                    <Button
                        title={(confirmedOtp) ? 'Verified' : 'Verify'}
                        buttonStyle={[Style.height(49), Style.borderRadius(100), px_20]}
                        color={(confirmedOtp) ? '#8ac926' : '#239db8'}
                        disabled={!phone}
                        onPress={sendOtp}
                        disabledStyle={Style.backgroundColor('#ced4da')}
                        disabledTitleStyle={Style.textColor('#6c757d')}
                    />
                </View>
                {
                    (otpConfirmation && !confirmedOtp) ?
                        <CustomInput
                            containerStyle={mt_10}
                            inputProps={{
                                placeholder: 'Enter OTP',
                                keyboardType: 'number-pad',
                                maxLength: 6,
                                onChangeText: onOtpTyped
                            }}
                            error={otpError}
                        />
                        : null
                }
                <CustomInput
                    containerStyle={mt_10}
                    inputProps={{
                        placeholder: 'Password',
                        keyboardType: 'phone-pad',
                        onChangeText: onPasswordTyped
                    }}
                    error={passError}
                />
                <CustomInput
                    containerStyle={mt_10}
                    inputProps={{
                        placeholder: 'Re-enter password',
                        keyboardType: 'phone-pad',
                        editable: (password !== undefined),
                        onChangeText: onConfirmPassTyped
                    }}
                    error={confirmPassError}
                />
            </View>
        </TabView.Item>
    )
}

// ------------------------------------

function CustomInput(props: {
    containerStyle?: StyleProp<ViewStyle>,
    onContainerPress?: () => void,
    inputProps?: TextInputProps,
    errorStyle?: StyleProp<TextStyle>,
    error?: string
}) {
    return (
        <Pressable style={props.containerStyle} onPress={props.onContainerPress}>
            <BlurView
                overlayColor='transparent'
                blurRadius={10}
            >
                <View style={[Style.backgroundColor('#ffffff99'), Style.borderRadius(100)]}>
                    <TextInput {...props.inputProps} style={[Style.fontSize(16), px_20, props.inputProps?.style]} />
                </View>
            </BlurView>
            <Text style={[mt_5, Style.textColor('#ff0054'), fw_700, ml_20, props.errorStyle]}>{props.error}</Text>
        </Pressable>
    )
}

// ------------------------------------

const styles = StyleSheet.create({

});