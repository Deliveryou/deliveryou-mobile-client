import { View, Text, ScrollView, StyleSheet, ToastAndroid, TextInput, Pressable, DeviceEventEmitter, KeyboardTypeOptions, ColorValue, TouchableNativeFeedback, TextInputProps, StyleProp, TextStyle, ViewStyle, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { align_items_center, bg_black, bg_danger, bg_primary, bg_white, border_radius_0, border_radius_pill, flex_1, flex_column, flex_row, fs_extra_giant, fs_normal, justify_center, mb_10, mb_15, mb_5, ml_10, ml_20, ml_5, mt_10, mt_15, mt_20, my_10, my_20, m_0, pb_0, pb_20, pb_5, pl_10, px_0, px_10, px_15, px_20, py_0, py_10, py_25, py_5, p_10, Style, w_100 } from '../../../../stylesheets/primary-styles'
import SimpleHeaderNavigation from '../../../../components/SimpleHeaderNavigation'
import { Avatar, Button, Dialog, Input, ListItem } from '@rneui/themed'
import { placeholder } from '@babel/types'
import { GraphQLService } from '../../../../services/GraphQLService'
import { Global } from '../../../../Global'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { UserService } from '../../../../services/UserService'
import Validator from '../../../../utils/Validator'
import { ImageUploadService } from '../../../../services/ImageUploadService'

export default function ProfileEditor({ route, navigation }) {
    const currentUser = useRef<GraphQLService.Type.User>()
    const [diffProfilePhoto, setDiffProfilePhoto] = useState<string>()
    const [_refesh, setRefesh] = useState(0)
    const [passwordExpanded, setPasswordExpanded] = useState(false)
    const newPhone = useRef<string>('')
    const newPassword = useRef<string>('')

    const [firstName, setFirstName] = useState('')
    const firstNameErrorMsg = useRef('')
    const [lastName, setLastName] = useState('')
    const lastNameErrorMsg = useRef('')
    const loadingDialogMsg = useRef('')
    const [loadingDialogVisible, setLoadingDialogVisible] = useState(false)

    const spacing = 10
    const itemTitleWidth = Style.width(140)

    useEffect(() => {
        DeviceEventEmitter.addListener('event.ProfileEditor.onPhotoChosen', (photoPath: string) => {
            setDiffProfilePhoto(photoPath)
        })
        // get current user
        const u = GraphQLService.Schema.User
        GraphQLService.getCurrentUser(
            Global.User.CurrentUser.id,
            [u.id, u.firstName, u.lastName, u.phone, u.citizenId, u.dateOfBirth, u.profilePictureUrl],
            (user) => {
                currentUser.current = user
                refesh()
            },
            () => {
                Alert.alert(
                    "Error has occured!",
                    "Cannot contact server",
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                )
            }
        )

    }, [])

    // upload new profile photo immediately everytime a new photo is used
    useEffect(() => {
        if (diffProfilePhoto && diffProfilePhoto !== currentUser.current?.profilePictureUrl) {
            ImageUploadService.upload(diffProfilePhoto, {
                onUploadBegan() {
                    loadingDialogMsg.current = 'Uploading profile photo'
                    setLoadingDialogVisible(true)
                },
                onUploaded(url) {
                    UserService.updateProfilePhoto(url,
                        (updated) => {
                            if (updated) {
                                if (currentUser.current) {
                                    currentUser.current.profilePictureUrl = url
                                    setDiffProfilePhoto(url)
                                    DeviceEventEmitter.emit(`event.${(Global.User.CurrentUser.isShipper() ? 'Shipper' : 'User')}.ProfileTab.onUserInfoChanged`)
                                }
                            } else {
                                setDiffProfilePhoto(currentUser.current?.profilePictureUrl)
                                ToastAndroid.show('Failed to upload profile photo', ToastAndroid.LONG)
                            }
                            loadingDialogMsg.current = ''
                            setLoadingDialogVisible(false)
                        }
                    )
                },
                onUploadFailure(error) {
                    setDiffProfilePhoto(currentUser.current?.profilePictureUrl)
                    ToastAndroid.show('Failed to upload profile photo', ToastAndroid.LONG)
                },
            })
        }

    }, [diffProfilePhoto])


    const refesh = () => setRefesh(value => value + 1)
    function openCamera() {
        navigation.navigate("CameraScreen")
    }


    const changePasswordButtonColor = (passwordExpanded) ? Style.backgroundColor('#fbe260') : Style.backgroundColor('#e5e5eb')

    function onNameTyped(text: string, isLastName: boolean = false) {
        text = text.trim().replace(/\s+/gm, ' ')
        if (['', ' '].includes(text)) {
            if (!isLastName) {
                firstNameErrorMsg.current = 'Invalid first name'
                setFirstName('')
            } else {
                lastNameErrorMsg.current = 'Invalid last name'
                setLastName('')
            }
            refesh()
        } else {
            if (!isLastName) {
                firstNameErrorMsg.current = ''
                setFirstName(text)
            } else {
                lastNameErrorMsg.current = ''
                setLastName(text)
            }
            refesh()
        }
    }

    function extractDifferences() {
        const user = currentUser.current
        if (user) {
            const updatedUser = {} as LooseObject
            // first name
            if (firstName !== '' && firstName !== user.firstName)
                updatedUser.firstName = firstName
            // last name
            if (lastName !== '' && lastName !== user.lastName)
                updatedUser.lastName = lastName
            // phone number
            if (newPhone.current !== '' && newPhone.current !== user.phone)
                updatedUser.phone = newPhone.current
            // password
            if (newPassword.current !== '')
                updatedUser.password = newPassword.current

            return (Object.keys(updatedUser).length > 0) ? updatedUser : null
        }
        return null
    }

    function saveChanges() {
        const extractedObject = extractDifferences()

        if (extractedObject) {
            extractedObject.id = Global.User.CurrentUser.id
            UserService.updateUser(
                extractedObject,
                (updated) => {
                    if (updated) {
                        ToastAndroid.show('Saved successfully!', ToastAndroid.LONG)
                        navigation.goBack()
                    } else
                        ToastAndroid.show('Server refused!\nNo changes was saved', ToastAndroid.LONG)
                },
                () => {
                    ToastAndroid.show('Failed to upload changes', ToastAndroid.LONG)
                }
            )
        } else
            ToastAndroid.show('No changes was made', ToastAndroid.LONG)
    }

    const profilePhotoUrl = (diffProfilePhoto) ? diffProfilePhoto :
        ((currentUser.current?.profilePictureUrl) ?
            currentUser.current.profilePictureUrl : "https://randomuser.me/api/portraits/lego/1.jpg")

    return (
        <View style={[flex_1, bg_white]}>
            <SimpleHeaderNavigation
                navigation={navigation}
                title="Edit Your Profile"
                parentStatusBarValues={{
                    backgroundColor: 'transparent',
                    barStyle: 'dark-content'
                }}
                newStatusBarValues={{
                    backgroundColor: 'transparent',
                    barStyle: 'dark-content'
                }}
                titleBarColor='#bcb8b1'
                titleStyle={Style.textColor('#43474E')}
            />

            <ScrollView style={[flex_1]}>
                <View style={[align_items_center, justify_center, mt_20, mb_15]}>
                    <View style={[border_radius_pill, mb_10]}>
                        <Avatar
                            size={100}
                            rounded
                            source={{ uri: profilePhotoUrl }}
                            containerStyle={Style.border('#d6ccc2', 5, 'solid')}
                        />
                    </View>
                    <Button
                        title={"Use another profile photo"}
                        containerStyle={border_radius_pill}
                        buttonStyle={Style.backgroundColor('#dfecff')}
                        titleStyle={Style.textColor('#0a83ff')}
                        onPress={openCamera}
                    />
                </View>

                <EditorTextField
                    onChangeText={onNameTyped}
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='First name'
                    titleStyle={itemTitleWidth}
                    defaultValue={currentUser.current?.firstName}
                    errorMessage={firstNameErrorMsg.current}
                />
                <EditorTextField
                    onChangeText={(text) => onNameTyped(text, true)}
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Last name'
                    titleStyle={itemTitleWidth}
                    defaultValue={currentUser.current?.lastName}
                    errorMessage={lastNameErrorMsg.current}
                />

                <EditorTextField
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Phone number'
                    defaultValue={currentUser.current?.phone}
                    titleStyle={itemTitleWidth}
                    editable={false}
                />

                <ChangePhoneNumber
                    currentUser={currentUser}
                    spacing={spacing}
                    itemTitleWidth={itemTitleWidth}
                    newPhoneRef={newPhone}
                />

                <ChangePassword
                    itemTitleWidth={itemTitleWidth}
                    spacing={spacing}
                    newPasswordRef={newPassword}
                />

                {
                    (Global.User.CurrentUser.isShipper()) ?
                        <>
                            <Text style={[my_10, ml_20, Style.textColor('#c1121f')]}>Contact administrators to change these information:</Text>

                            <EditorTextField
                                spacing={spacing}
                                containerStyle={[pb_5, px_20]}
                                title='Citizen ID'
                                defaultValue={currentUser.current?.citizenId}
                                titleStyle={itemTitleWidth}
                                editable={false}
                            />
                            <EditorTextField
                                spacing={spacing}
                                containerStyle={[pb_5, px_20]}
                                title='Date of birth'
                                defaultValue={currentUser.current?.dateOfBirth}
                                titleStyle={itemTitleWidth}
                                editable={false}
                            />
                        </>
                        : null
                }


                <View style={[flex_row, align_items_center, justify_center, my_20]}>
                    <Button title={"Save changes"}
                        onPress={saveChanges}
                        containerStyle={border_radius_pill}
                        buttonStyle={[px_15, py_10, Style.backgroundColor('#0a83ff')]}
                    />
                </View>
            </ScrollView>
            <Dialog overlayStyle={[Style.width(180), Style.borderRadius(10)]} isVisible={loadingDialogVisible}>
                <View style={[align_items_center]}>
                    <Dialog.Loading />
                    <Text>{loadingDialogMsg.current}</Text>
                </View>
            </Dialog>
            {/* <Button title={'sign in'} onPress={() => navigation.navigate('TestScreen')} /> */}
        </View>
    )
}

// -------------------------------
interface ChangePasswordProps {
    spacing: number
    itemTitleWidth: { width: string | number },
    newPasswordRef: React.MutableRefObject<string>
}

function ChangePassword(props: ChangePasswordProps) {
    const [expanded, setExpanded] = useState(false)
    const [verified, setVerified] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const currentPasswordErrorMsg = useRef('')
    const newPasswordErrorMsg = useRef('')
    const confirmPasswordErrorMsg = useRef('')
    const confirmPassword = useRef('')
    const confirmPasswordRef = useRef<LooseObject>({} as LooseObject)
    const [_refesh, setRefesh] = useState(0)

    const refresh = () => setRefesh(value => value + 1)

    function onCurrentPasswordTyped(text: string) {
        Validator.validate(Validator.TYPE.PASSWORD, text,
            () => {
                currentPasswordErrorMsg.current = ''
                setCurrentPassword(text)
            },
            () => {
                currentPasswordErrorMsg.current = 'Invalid password format'
                setCurrentPassword('')
            }
        )
    }

    function onNewPasswordTyped(text: string) {
        confirmPasswordErrorMsg.current = ''
        confirmPassword.current = ''
        confirmPasswordRef.current.clearText?.()
        props.newPasswordRef.current = ''

        Validator.validate(Validator.TYPE.PASSWORD, text,
            () => {
                newPasswordErrorMsg.current = ''
                setNewPassword(text)
            },
            () => {
                console.log('------- worng')
                newPasswordErrorMsg.current = 'Invalid password format'
                setNewPassword('')
                refresh()
            }
        )
    }

    function onConfirmPasswordTyped(text: string) {
        if (newPassword === text) {
            confirmPasswordErrorMsg.current = ''
            props.newPasswordRef.current = text
        }
        else {
            confirmPasswordErrorMsg.current = 'Mismatched password!'
            props.newPasswordRef.current = ''
        }
        refresh()
    }

    function verify() {
        UserService.verifyPassword(Global.User.CurrentUser.id, currentPassword,
            (matched) => {
                if (matched) {
                    setVerified(true)
                } else {
                    ToastAndroid.show('Wrong password', ToastAndroid.LONG)
                }
            },
            () => ToastAndroid.show('Unable to verify', ToastAndroid.LONG)
        )
    }

    const changePasswordButtonColor = (expanded) ? Style.backgroundColor('#fbe260') : Style.backgroundColor('#e5e5eb')


    return (
        <ListItem.Accordion
            content={
                <TouchableNativeFeedback onPress={() => setExpanded(!expanded)}>
                    <View style={[ml_5, Style.borderRadius(10), p_10, changePasswordButtonColor]}>
                        <Text style={Style.textColor('#495057')}>Change password</Text>
                    </View>
                </TouchableNativeFeedback>
            }
            isExpanded={expanded}
            onPress={() => setExpanded(!expanded)}
        >
            <View style={[p_10, Style.backgroundColor('#dee2e6')]}>
                <EditorTextField
                    spacing={props.spacing - 5}
                    containerStyle={[pb_5, px_20, mb_10]}
                    title='Current password'
                    defaultValue={currentPassword}
                    titleStyle={props.itemTitleWidth}
                    onChangeText={onCurrentPasswordTyped}
                    errorMessage={currentPasswordErrorMsg.current}
                    editable={!verified}
                />

                <Button
                    onPress={verify}
                    containerStyle={border_radius_pill}
                    color='#aaccf2'
                    titleStyle={Style.textColor('#0a83ff')}
                    title={(verified) ? 'Verified' : 'Verify'}
                    disabled={currentPassword === '' || verified}
                />

                {
                    (verified) ?
                        <>
                            <EditorTextField
                                onChangeText={onNewPasswordTyped}
                                spacing={props.spacing - 5}
                                containerStyle={[pb_5, px_20, mt_10]}
                                title='New password'
                                defaultValue={newPassword}
                                titleStyle={props.itemTitleWidth}
                                errorMessage={newPasswordErrorMsg.current}
                            />

                            <EditorTextField
                                onChangeText={onConfirmPasswordTyped}
                                spacing={props.spacing - 5}
                                containerStyle={[pb_5, px_20]}
                                title='Confirm password'
                                defaultValue={confirmPassword.current}
                                titleStyle={props.itemTitleWidth}
                                errorMessage={confirmPasswordErrorMsg.current}
                                editable={newPassword !== ''}
                                refObject={confirmPasswordRef}
                            />
                        </>
                        : null
                }
            </View>
        </ListItem.Accordion>
    )
}

// -------------------------------
interface ChangePhoneNumberProps {
    spacing: number
    itemTitleWidth: { width: string | number },
    currentUser: React.MutableRefObject<GraphQLService.Type.User | undefined>,
    newPhoneRef: React.MutableRefObject<string>
}

function ChangePhoneNumber(props: ChangePhoneNumberProps) {
    const [expanded, setExpanded] = useState(false)
    const [newPhone, _setNewPhone] = useState<string>('')
    const newPhoneErrorMsg = useRef('')
    const newPhoneInfoMsg = useRef('')
    const [enterOTPErrorMsg, setEnterOTPErrorMsg] = useState('')
    const [_refesh, setRefesh] = useState(0)
    const sendOTPButtonDisabled = useRef(true)
    const [otpConfirmation, setOtpConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult>()
    const newPhoneConfirmed = useRef(false)
    const confirmedNumbers = useRef<Set<string>>(new Set<string>())

    const refresh = () => setRefesh(value => value + 1)

    useEffect(() => {
        //props.newPhoneRef.current = (expanded) ? 
    }, [expanded])


    function sendOTP() {
        // check if the new phone number is already used
        UserService.phoneExists(newPhone,
            (exists) => {
                if (!exists) {
                    console.log('>>>>>>>> otp: can use this phone')
                    auth().signInWithPhoneNumber(newPhone)
                        .then(res => {
                            const toast = (otpConfirmation) ? 'SMS resent' : 'SMS sent!'
                            ToastAndroid.show(toast, ToastAndroid.LONG)
                            setOtpConfirmation(res)
                        })
                        .catch(error => {
                            console.log('>>> error sms: ', error)
                            ToastAndroid.show('Failed to send sms!', ToastAndroid.LONG)
                        })
                } else {
                    newPhoneErrorMsg.current = 'This number already exists'
                    refresh()
                }
            },
            () => ToastAndroid.show('Cannot contact server, try again!', ToastAndroid.LONG)
        )
    }

    function confirmOTP(code: string) {
        if (otpConfirmation)
            otpConfirmation.confirm(code)
                .then(_ => {
                    confirmedNumbers.current.add(newPhone)
                    onCanUsePhone(newPhone)
                    setEnterOTPErrorMsg('')
                })
                .catch(_ => setEnterOTPErrorMsg('Wrong/expired OTP'))
    }

    function onCanUsePhone(phone: string) {
        newPhoneConfirmed.current = true
        sendOTPButtonDisabled.current = true
        setOtpConfirmation(undefined)
        props.newPhoneRef.current = phone
    }

    function setNewPhone(phone: string) {
        phone = phone.trim().replace(/\s+/gm, '')
        Validator.validate(Validator.TYPE.PHONE.VN, phone,
            () => {
                if (confirmedNumbers.current.has(phone)) {
                    newPhoneErrorMsg.current = ''
                    onCanUsePhone(phone)
                    refresh()
                } else {
                    newPhoneErrorMsg.current = ''
                    sendOTPButtonDisabled.current = false
                }
                _setNewPhone(phone)
            },
            () => {
                newPhoneErrorMsg.current = 'Invalid phone format'
                newPhoneConfirmed.current = false
                sendOTPButtonDisabled.current = true
                props.newPhoneRef.current = ''
                _setNewPhone(phone)
            }
        )
    }

    const changePhoneButtonColor = (expanded) ? Style.backgroundColor('#fbe260') : Style.backgroundColor('#e5e5eb')
    newPhoneInfoMsg.current = (newPhoneConfirmed.current) ? 'Use this new number' : ''

    return (
        <ListItem.Accordion
            content={
                <TouchableNativeFeedback onPress={() => setExpanded(!expanded)}>
                    <View style={[ml_5, Style.borderRadius(10), p_10, changePhoneButtonColor]}>
                        <Text style={Style.textColor('#495057')}>Change phone number</Text>
                    </View>
                </TouchableNativeFeedback>
            }
            isExpanded={expanded}
            onPress={() => setExpanded(!expanded)}
        >
            <View style={[p_10, Style.backgroundColor('#dee2e6')]}>
                <EditorTextField
                    spacing={props.spacing}
                    containerStyle={[pb_5, px_20, mb_10]}
                    title='New phone number'
                    placeholder='+84'
                    defaultValue={newPhone}
                    titleStyle={props.itemTitleWidth}
                    keyboardType='phone-pad'
                    onChangeText={setNewPhone}
                    errorMessage={newPhoneErrorMsg.current}
                    infoMessage={newPhoneInfoMsg.current}
                />
                <Button
                    onPress={sendOTP}
                    containerStyle={border_radius_pill}
                    color='#aaccf2'
                    titleStyle={Style.textColor('#0a83ff')}
                    title={(otpConfirmation) ? 'Resend OTP' : 'Send OTP'}
                    disabled={sendOTPButtonDisabled.current}
                />
                {
                    (otpConfirmation) ?
                        <EditorTextField
                            spacing={props.spacing}
                            containerStyle={[pb_5, px_20, mt_20]}
                            title='Enter OTP'
                            titleStyle={props.itemTitleWidth}
                            placeholder='6 digits code'
                            keyboardType='decimal-pad'
                            maxLength={6}
                            onChangeText={(text) => {
                                if (text.length === 6)
                                    confirmOTP(text)
                            }}
                            errorMessage={enterOTPErrorMsg}
                        /> : null
                }
            </View>
        </ListItem.Accordion>
    )
}

// -------------------------------
type LooseObject = {
    [key: string]: any
}

interface EditorTextFieldProps {
    containerStyle?: StyleProp<ViewStyle>,
    title: string,
    spacing?: number,
    titleStyle?: StyleProp<TextStyle>,
    defaultValue?: string,
    onFocusStyle?: {
        borderColor: string,
        borderBottomWidth: number
    },
    editable?: boolean,
    errorMessage?: string,
    //errorStyle?: StyleProp<TextStyle>,
    infoMessage?: string,
    placeholder?: string,
    keyboardType?: KeyboardTypeOptions,
    onChangeText?: (text: string) => void,
    refObject?: React.MutableRefObject<LooseObject>,
    maxLength?: number
}

function EditorTextField(props: EditorTextFieldProps) {
    const [beingFocus, setBeingFocus] = useState(false)
    const input = useRef<TextInput>(null)

    const spacing = (props.spacing) ? props.spacing : 10

    let titleStyle = (props.titleStyle) ? props.titleStyle : {}

    const inputBottomStyle = (beingFocus) ?
        ((props.onFocusStyle) ? props.onFocusStyle : { borderColor: 'blue', borderBottomWidth: 1 }) : {}

    let containerStyle = (props.containerStyle) ? props.containerStyle : {}

    function clear() {
        input.current?.clear()
    }

    useEffect(() => {
        if (props.refObject?.current) {
            props.refObject.current.clearText = clear
        }

    }, [])


    const displayError: boolean = (props.errorMessage !== undefined && props.errorMessage.trim() !== '')
    const displayInfo: boolean = (props.infoMessage !== undefined && props.infoMessage.trim() !== '')

    return (
        <View style={[styles.editorTextFieldContainer, containerStyle]}>
            <Pressable onPress={() => input.current?.focus()}>
                <Text style={[styles.editorTextFieldTitle, titleStyle]}>{props.title}</Text>
            </Pressable>
            <View style={Style.dimen('100%', spacing)} />
            <View style={flex_1}>
                <TextInput
                    style={[styles.editorTextFieldInput, (displayError) ? mt_15 : {}, inputBottomStyle]}
                    defaultValue={props.defaultValue}
                    onFocus={() => setBeingFocus(true)}
                    onBlur={() => setBeingFocus(false)}
                    editable={props.editable}
                    placeholder={props.placeholder}
                    keyboardType={props.keyboardType}
                    onChangeText={props.onChangeText}
                    maxLength={props.maxLength}
                    ref={input}
                />
                {
                    (displayInfo || displayError) ?
                        (
                            (displayError) ?
                                <Text style={[styles.error]}>{props.errorMessage?.trim()}</Text>
                                : (
                                    (displayInfo) ?
                                        <Text style={[styles.info]}>{props.infoMessage?.trim()}</Text> : null
                                )
                        )
                        : null
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    editorTextFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    editorTextFieldTitle: {
        fontSize: 15,
    },

    editorTextFieldInput: {
        marginTop: 5,
        fontSize: 15,
        flex: 1,
        padding: 5,
    },

    error: {
        color: '#ff595e'
    },

    info: {
        color: '#4fca62'
    }
})