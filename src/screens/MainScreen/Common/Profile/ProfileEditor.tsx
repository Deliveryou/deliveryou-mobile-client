import { View, Text, ScrollView, StyleSheet, TextInput, DeviceEventEmitter, TextInputProps, StyleProp, TextStyle, ViewStyle, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { align_items_center, bg_black, bg_danger, bg_primary, bg_white, border_radius_pill, flex_1, flex_row, fs_extra_giant, justify_center, mb_10, mb_15, ml_10, ml_20, mt_10, mt_20, my_10, m_0, pb_0, pb_5, px_0, px_10, px_15, px_20, py_0, py_10, py_25, py_5, Style } from '../../../../stylesheets/primary-styles'
import SimpleHeaderNavigation from '../../../../components/SimpleHeaderNavigation'
import { Avatar, Button, Input } from '@rneui/themed'
import { placeholder } from '@babel/types'
import { GraphQLService } from '../../../../services/GraphQLService'
import { Global } from '../../../../Global'

export default function ProfileEditor({ route, navigation }) {
    const currentUser = useRef<GraphQLService.Type.User>()
    const [diffProfilePhoto, setDiffProfilePhoto] = useState<string>()
    const [_refesh, setRefesh] = useState(0)

    const spacing = 10
    const itemTitleWidth = Style.width(140)

    useEffect(() => {
        DeviceEventEmitter.addListener('event.ProfileEditor.onPhotoChosen', (photoPath: string) => {
            setDiffProfilePhoto(photoPath)
        })
        // get current user
        GraphQLService.getCurrentUser(Global.User.CurrentUser.id,
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

    const refesh = () => setRefesh(value => value + 1)
    function openCamera() {
        navigation.navigate("CameraScreen")
    }


    function saveChanges() {

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

            <ScrollView style={flex_1}>
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
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='First name'
                    titleStyle={itemTitleWidth}
                    defaultValue={currentUser.current?.firstName}
                />
                <EditorTextField
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Last name'
                    titleStyle={itemTitleWidth}
                    defaultValue={currentUser.current?.lastName}
                />
                <EditorTextField
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Phone number'
                    defaultValue={currentUser.current?.phone}
                    titleStyle={itemTitleWidth}
                />

                <EditorTextField
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Password'
                    defaultValue=''
                    titleStyle={itemTitleWidth}
                />

                <EditorTextField
                    spacing={spacing}
                    containerStyle={[pb_5, px_20]}
                    title='Confirm password'
                    defaultValue=''
                    titleStyle={itemTitleWidth}
                />

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

                <View style={[flex_row, align_items_center, justify_center, mt_20]}>
                    <Button title={"Save changes"}
                        containerStyle={border_radius_pill}
                        buttonStyle={[px_15, py_10, Style.backgroundColor('#0a83ff')]}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

// -----------------------
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
    editable?: boolean
}

function EditorTextField(props: EditorTextFieldProps) {
    const [beingFocus, setBeingFocus] = useState(false)

    const spacing = (props.spacing) ? props.spacing : 10

    let titleStyle = (props.titleStyle) ? props.titleStyle : {}

    const inputBottomStyle = (beingFocus) ?
        ((props.onFocusStyle) ? props.onFocusStyle : { borderColor: 'blue', borderBottomWidth: 1 }) : {}

    let containerStyle = (props.containerStyle) ? props.containerStyle : {}

    return (
        <View style={[styles.editorTextFieldContainer, containerStyle]}>
            <Text style={[styles.editorTextFieldTitle, titleStyle]}>{props.title}</Text>
            <View style={Style.dimen('100%', spacing)} />
            <TextInput
                style={[styles.editorTextFieldInput, inputBottomStyle]}
                defaultValue={props.defaultValue}
                onFocus={() => setBeingFocus(true)}
                onBlur={() => setBeingFocus(false)}
                editable={props.editable}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    editorTextFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    editorTextFieldTitle: {
        fontSize: 15
    },

    editorTextFieldInput: {
        marginTop: 5,
        fontSize: 15,
        flex: 1,
        padding: 5,
    }
})