import { View, Text, StyleSheet, ScrollView, ImageBackground, StatusBar, TouchableNativeFeedback, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Style, align_items_center, bg_danger, bg_white, border_radius_pill, bottom_0, flex_1, flex_row, fw_600, fw_700, fw_800, fw_bold, m_15, ml_20, mr_10, mr_15, mt_10, mt_5, my_25, p_20, p_5, position_absolute, px_10, px_20, py_5, text_white, w_100 } from '../../stylesheets/primary-styles';
import { Avatar, Button, Icon, TabView } from '@rneui/themed';
import { Shadow } from 'react-native-shadow-2'
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler';
import { TextInputProps } from 'react-native';
import { StyleProp } from 'react-native';
import { TextStyle } from 'react-native';
import { ViewStyle } from 'react-native';

export default function RegisterScreen() {
    const navigation = useNavigation()

    const [index, setIndex] = useState(0)
    const [photoUrl, setPhotoUrl] = useState<string>()

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
            case 1: return false
            default: return true
        }
    }, [index, photoUrl])

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
                <Tab2 />
                <TabView.Item style={{ backgroundColor: 'green', width: '100%' }}>
                    <Text>Cart</Text>
                </TabView.Item>
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
            </View>

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

function Tab2(props: {
}) {
    const navigation = useNavigation()

    return (
        <TabView.Item style={w_100}>
            <View style={[flex_1, p_20]}>
                <CustomInput
                    inputProps={{
                        placeholder: 'First name'
                    }}
                    error='2'
                />
                <CustomInput
                    containerStyle={[mt_10]}
                    inputProps={{
                        placeholder: 'Last name'
                    }}
                    error='2'
                />
                <CustomInput
                    containerStyle={[mt_10]}
                    inputProps={{
                        placeholder: 'Date of birth'
                    }}
                    error='2'
                />
            </View>
        </TabView.Item>
    )
}

// ------------------------------------

function CustomInput(props: {
    containerStyle?: StyleProp<ViewStyle>,
    inputProps?: TextInputProps,
    errorStyle?: StyleProp<TextStyle>,
    error?: string
}) {
    return (
        <View style={props.containerStyle}>
            <BlurView
                overlayColor='transparent'
                blurRadius={10}
            >
                <View style={[Style.backgroundColor('#ffffff99'), Style.borderRadius(100)]}>
                    <TextInput {...props.inputProps} style={[Style.fontSize(16), px_20, props.inputProps?.style]} />
                </View>
            </BlurView>
            {
                (props.error) ?
                    <Text style={[mt_5, Style.textColor('#ff0054'), fw_700, ml_20, props.errorStyle]}>{props.error}</Text>
                    : null
            }
        </View>
    )
}

// ------------------------------------

const styles = StyleSheet.create({

});