import { View, Text, StatusBar, StyleSheet, Linking, TouchableOpacity, DeviceEventEmitter, ToastAndroid, Image, ImageSourcePropType } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { align_items_center, align_self_baseline, align_self_center, align_self_flex_start, bg_danger, bg_primary, border_radius_pill, bottom_0, flex_1, flex_row, fs_semi_large, justify_center, left_0, mb_20, mr_10, mr_20, position_absolute, py_10, py_5, Style, text_white, top_0, w_100 } from '../../../stylesheets/primary-styles'
import { Camera, useCameraDevices, CameraDevice, PhotoFile } from 'react-native-vision-camera'
import { Button, Icon } from '@rneui/themed'
import { BlurView } from '@react-native-community/blur'
import { launchImageLibrary } from 'react-native-image-picker';

export default function CameraScreen({ route, navigation }) {
    const devices = useCameraDevices()
    const device = (route.params?.useFront) ? devices.front : devices.back

    return (
        <View style={flex_1}>
            {
                (device) ?
                    <ICamera
                        navigation={navigation}
                        route={route}
                        intialDevice={device}
                    />
                    :
                    <NotAvailable />
            }
        </View>
    )
}

// -------------------------------------------------------
interface ICameraProps {
    navigation: any,
    route: any,
    intialDevice: CameraDevice,
}

function ICamera(props: ICameraProps) {
    const camera = useRef<Camera>(null)
    const [uri, setUri] = useState<undefined | string>(undefined)
    const photo = useRef<PhotoFile>()
    const devices = useCameraDevices()
    const [device, setDevice] = useState(props.intialDevice)

    photo.current?.isRawPhoto

    function takeSnapshot() {
        camera.current?.takeSnapshot()
            .then(file => {
                photo.current = file
                if (file) {
                    setUri(file.path)
                    console.log('----------- uri - camera: ', file.path)
                } else
                    throw 'file is null'
            })
            .catch(error => ToastAndroid.show('Cannot take a photo\nTry using an existing photo instead', ToastAndroid.LONG))
    }

    function retake() {
        setUri(undefined)
        photo.current = undefined
    }

    function getPhotoPath() {
        if (!uri)
            return undefined
        let res = uri.replace('file://', '')
        return 'file://' + res
    }

    async function lauchPhotoLibrary() {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 })
            setUri(result.assets?.[0].uri)
            console.log('----------- uri - lib: ', result.assets?.[0])
        } catch (error) {
            ToastAndroid.show('Android system has prevented this action', ToastAndroid.LONG)
        }
    }

    function flip() {
        if (device.name.toLowerCase().includes('back') && devices.front) {
            setDevice(devices.front)
            console.log('flip')
            return
        }
        if (device.name.toLowerCase().includes('front') && devices.back) {
            setDevice(devices.back)
            console.log('flip')
            return
        }
    }


    return (
        <View style={flex_1}>
            {
                (uri) ?
                    <PreviewCamera
                        navigation={props.navigation}
                        route={props.route}
                        retake={retake}
                        photoPath={getPhotoPath()}
                    />
                    :
                    <ActiveCamera
                        lauchPhotoLibrary={lauchPhotoLibrary}
                        device={device}
                        takeSnapshot={takeSnapshot}
                        iref={camera}
                        onFlip={flip}
                    />
            }
        </View >
    )
}

// -------------------------------------------------------
interface PreviewCameraProps {
    retake?: () => void,
    photoPath?: string,
    navigation: any,
    route: any
}

function PreviewCamera(props: PreviewCameraProps) {

    function useThisPhoto() {
        if (props.photoPath) {
            props.navigation.goBack()
            DeviceEventEmitter.emit('event.AddDeliveryDetails.onPhotoChosen', props.photoPath)
            DeviceEventEmitter.emit('event.ProfileEditor.onPhotoChosen', props.photoPath)
        } else
            ToastAndroid.show('Cannot use this photo', ToastAndroid.SHORT)
    }

    return (
        <>
            <Image
                source={{ uri: props.photoPath }}
                style={flex_1}
            />
            <View style={[styles.camera_func, flex_row, align_items_center, justify_center]}>
                <Button
                    containerStyle={[Style.borderRadius(10), mr_20]}
                    buttonStyle={py_10}
                    onPress={props.retake}
                    color='white'
                    titleStyle={Style.textColor('#4a5759')}
                >
                    <Icon style={mr_10} name='closecircle' type='ant-design' size={20} color='#9e0059' />
                    RETAKE
                </Button>
                <Button
                    containerStyle={Style.borderRadius(10)}
                    buttonStyle={py_10}
                    onPress={useThisPhoto}
                    color='white'
                    titleStyle={Style.textColor('#4a5759')}
                >
                    <Icon style={mr_10} name='checkcircle' color={'#084c61'} type='ant-design' size={20} />
                    USE THIS PHOTO
                </Button>
            </View>
        </>
    )
}

// -------------------------------------------------------
interface ActiveCameraProps {
    device: CameraDevice,
    takeSnapshot?: () => void,
    lauchPhotoLibrary?: () => void,
    iref?: React.RefObject<Camera>,
    onFlip?: () => void
}

function ActiveCamera(props: ActiveCameraProps) {
    return (
        <>
            <Camera
                device={props.device}
                isActive={true}
                style={styles.camera_container}
                ref={props.iref}
                photo={true}
            />
            <View style={styles.camera_func}>
                <View style={[flex_row, w_100, align_items_center, justify_center]}>
                    <TouchableOpacity
                        style={{ position: 'absolute', left: 15, bottom: 15 }}
                        onPress={props.lauchPhotoLibrary}
                    >
                        <Icon name='photo-library' type='material-icon' color={'#f9f7f3'} size={40} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={props.takeSnapshot}>
                        <Icon name='radio-button-on' type='ion-icon' size={70} color='#f9f7f3' />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ position: 'absolute', right: 15, bottom: 15 }}
                        onPress={props.onFlip}
                    >
                        <Icon name='camera-flip' type='material-community' color={'#f9f7f3'} size={40} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

// -------------------------------------------------------

function NotAvailable() {
    useEffect(() => {
        StatusBar.setBarStyle('light-content')
    }, [])

    return (
        <View style={styles.na_container}>
            <Text style={[text_white, fs_semi_large]}>Cannot access camera.</Text>
            <Text style={[text_white, fs_semi_large, mb_20]}>Permission is denied!</Text>
            <Button
                title={'Open Settings'}
                containerStyle={border_radius_pill}
                color='#1982c4'
                onPress={() => Linking.openSettings()}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    camera_container: {
        flex: 1
    },

    camera_func: {
        position: 'absolute',
        ...w_100,
        left: 0,
        bottom: 0,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#35353599',
    },

    na_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#540d6e'
    }
})