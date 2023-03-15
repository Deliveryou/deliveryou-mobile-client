import { View, StyleSheet, DeviceEventEmitter, ImageBackground, BackHandler, StatusBar, Image, Dimensions, ScrollView, TextInput, Pressable, StyleProp, ViewStyle, Modal, ToastAndroid, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { align_items_center, align_self_flex_start, bg_black, bg_danger, bg_dark, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_1, border_radius_2, border_radius_4, border_radius_pill, clr_white, flex_1, flex_7, flex_column, flex_row, fs_semi_large, fw_400, fw_600, fw_700, fw_800, h_100, h_50, justify_center, left_0, mb_10, mb_15, mr_10, mt_10, mt_15, mt_20, position_absolute, p_5, right_0, Style, top_0, w_100 } from '../../../../stylesheets/primary-styles';
import { Icon, Text, Button } from '@rneui/themed';
import { Global } from '../../../../Global';
import { Shadow } from 'react-native-shadow-2';
import { BlurView } from '@react-native-community/blur';
import { LocationService } from '../../../../services/LocationService';

type Data = LocationService.LocationIQ.Response.Data
const EMPTY_DATA = LocationService.LocationIQ.Response.EMPTY_DATA

// *************** REGULAR USER HOME TAB *****************

interface LocationSelectorProps {
    style?: StyleProp<ViewStyle>,
    setModalVisibleCallback?: React.Dispatch<React.SetStateAction<boolean>>,
    navigation: Object,
    route: Object,
    onRouteChosen?: (routeData: { startingPointData: Data, destinationData: Data }) => void,
    startingPoint: React.MutableRefObject<LocationService.LocationIQ.Response.Data | undefined>,
    destination: React.MutableRefObject<LocationService.LocationIQ.Response.Data | undefined>,
    disablePressable?: boolean
}

export const LocationSelector = React.forwardRef((props: LocationSelectorProps, ref: any) => {
    const { style, setModalVisibleCallback, navigation, route } = props
    // const startingPoint = useRef<Data>()
    // const destination = useRef<Data>()
    const startingPoint = props.startingPoint
    const destination = props.destination
    const startingPointInput = useRef<TextInput>()
    const destinationInput = useRef<TextInput>()
    const [switchEnabled, setSwitchEnabled] = useState(false)

    useEffect(() => {
        DeviceEventEmitter.addListener('event.onRouteSelected', (routeData: { startingPointData: Data, destinationData: Data }) => {
            if (routeData && routeData.destinationData && routeData.destinationData) {
                startingPoint.current = routeData.startingPointData
                destination.current = routeData.destinationData
                const sp_inputText = startingPoint.current?.display_name
                const d_inputText = destination.current?.display_name
                startingPointInput.current?.setNativeProps({ text: (sp_inputText) ? sp_inputText : 'Starting point' })
                destinationInput.current?.setNativeProps({ text: (d_inputText) ? d_inputText : 'Destination' })
                setSwitchEnabled(true)
                props.onRouteChosen?.(routeData)
            } else
                setSwitchEnabled(false)
        })

        if (ref && ref.current) {
            ref.current.refresh = refresh
        }

    }, [])

    function refresh() {
        let validCount = 0

        if (startingPoint.current) {
            const sp_inputText = startingPoint.current?.display_name
            startingPointInput.current?.setNativeProps({ text: (sp_inputText) ? sp_inputText : 'Starting point' })
            validCount++
        }

        if (destination.current) {
            const d_inputText = destination.current?.display_name
            destinationInput.current?.setNativeProps({ text: (d_inputText) ? d_inputText : 'Destination' })
            validCount++
        }

        if (validCount === 2)
            setSwitchEnabled(true)
    }

    const navigateToLocationPicker = () => {
        if ([false, undefined].includes(props.disablePressable))
            navigation.navigate('LocationPicker')
    }

    function switchLocations() {
        const temp = destination.current

        // const d_newText = (startingPoint.current) ? startingPoint.current.display_name : 'Destination'
        // const sp_newText = (destination.current) ? destination.current.display_name : 'Starting point'

        // destinationInput.current?.setNativeProps({ text: d_newText })
        // startingPointInput.current?.setNativeProps({ text: sp_newText })

        destination.current = startingPoint.current
        startingPoint.current = temp

        refresh()
    }

    return (
        <View style={style} >
            {
                (switchEnabled) ?
                    <Pressable onPress={switchLocations} style={[position_absolute, { top: 10, right: 20 }, border_radius_pill, p_5, Style.backgroundColor('#ced4da')]}>
                        <Icon style={Style.rotate('90deg')} name='swap' type='entypo' color='#6c757d' size={20} />
                    </Pressable> : null
            }
            <Pressable
                style={[flex_row, align_items_center, (switchEnabled) ? mt_20 : {}]}
                onPress={() => {
                    //setModalVisibleCallback?.(value => !value)
                    navigateToLocationPicker()
                }}
            >
                <Icon name='gps-fixed' type='MaterialIcons' style={mr_10} color='#ef476f' />
                <TextInput
                    style={[flex_1, Style.textColor('#495057')]}
                    ref={startingPointInput}
                    placeholder='Destination'
                    editable={false}
                    placeholderTextColor='#adb5bd'
                />
            </Pressable>
            <Icon
                name='dots-three-vertical'
                type='entypo'
                style={align_self_flex_start}
                containerStyle={{ left: 4, top: -4 }}
                color='#a5a58d'
                size={18}
            />
            <Pressable
                style={[flex_row, align_items_center, { top: -6 }]}
                onPress={() => {
                    //setModalVisibleCallback?.(value => !value)
                    navigateToLocationPicker()
                }}
            >
                <Icon name='location' type='entypo' style={mr_10} color='#118ab2' />
                <TextInput
                    style={[flex_1, Style.textColor('#495057')]}
                    ref={destinationInput}
                    placeholder='Destination'
                    editable={false}
                    placeholderTextColor='#adb5bd'
                />
            </Pressable>
        </View>
    )
}
)

// ---------------------------------------------

interface HomeTabProps {
    overideParentTabSwipe?: (value: boolean) => void,
    navigation: Object,
    route: Object
}

const onLayoutImgBg = (event: any, setStateFunction: React.Dispatch<React.SetStateAction<number>>) => {
    Global.Screen.Home.Variable.TOP_IMAGE_BG_HEIGHT.set(event.nativeEvent.layout.height)
    setStateFunction(prev => prev + 1)
}

const openLocationPicker = (navigation: Object) => {
    navigation?.navigate?.('LocationPicker')
}

export default function HomeTab(props: HomeTabProps) {
    const topImageSize = useRef<{ width: number, height: number }>()
    const [triggerRererender, setTriggerRererender] = useState(0)
    const [viewPriceBtnEnabled, setViewPriceBtnEnabled] = useState(false)
    const startingPoint = useRef<Data>()
    const destination = useRef<Data>()
    const locationSelectorRef = useRef({})

    useEffect(() => {
        LocationService.requestGeolocation(
            () => { },
            () => {
                Alert.alert(
                    "Location access is not permitted",
                    "Grant permission to continue",
                    []
                );
                setTimeout(() => BackHandler.exitApp(), 4000)
            }
        )

        DeviceEventEmitter.addListener('event.homeLocationSelectorRefresh', () => locationSelectorRef.current?.refresh?.())
    }, [])

    // const [modalVisible, setModalVisible] = useState(false);

    const tmp = Global.Screen.Home.Variable
    const contentHeight = Dimensions.get('screen').height - tmp.NAV_BAR_HEIGHT.get() - tmp.TOP_IMAGE_BG_HEIGHT.get() + 50
    const imgBgTextClr = { color: Global.Color.TEXT_DARK_1 }

    return (
        <>
            <ImageBackground
                style={styles.topImageBg}
                source={require('../../../../resources/backgrounds/topImageBg.jpg')}
                onLayout={(event) => onLayoutImgBg(event, setTriggerRererender)}>
                <View style={styles.topImageTextContainer}>
                    <Text style={[fs_semi_large, fw_800, mb_10, imgBgTextClr]}>Welcome To Deliveryou</Text>
                    <Text style={imgBgTextClr}>Get your items delivered,{'\n'}whenever, wherever</Text>
                </View>
            </ImageBackground>
            <ScrollView style={{ zIndex: 1 }}>
                <View style={[styles.contentContainer, Style.height(contentHeight), { marginTop: tmp.TOP_IMAGE_BG_HEIGHT.get() }]} >
                    <Shadow
                        containerStyle={[styles.topCardContainer]}
                        startColor={'#6c757d40'}
                        distance={8}
                        style={[h_100, w_100, bg_transparent]}
                    >
                        <LocationSelector
                            ref={locationSelectorRef}
                            style={[styles.topCard]}
                            navigation={props.navigation}
                            route={props.route}
                            onRouteChosen={(routeData) => {
                                setViewPriceBtnEnabled(true)
                            }}
                            startingPoint={startingPoint}
                            destination={destination}
                        />
                    </Shadow>
                    <Button
                        disabled={!viewPriceBtnEnabled}
                        title={'VIEW ESTIMATED PRICE'}
                        color={'#38b000'}
                        containerStyle={border_radius_2}
                        onPress={() => props.navigation.navigate({
                            name: 'AddDeliveryDetails',
                            params: {
                                startingPointRef: startingPoint,
                                destinationRef: destination
                            }
                        })}
                    />
                    <View>
                        <ScrollView
                            style={bg_primary}
                            horizontal
                        // onResponderStart={() => props.overideParentTabSwipe?.(true)}
                        // onResponderEnd={() => props.overideParentTabSwipe?.(false)}
                        >
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                            <View style={[Style.dimen(100, 100), bg_dark, mr_10]} />
                        </ScrollView>
                    </View>
                    <Button title={'dfkgnl'} onPress={() => openLocationPicker(props.navigation)} />
                </View>
            </ScrollView>

            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <LocationPicker />
            </Modal> */}
        </>
    )
}

const LocationPicker = () => {
    return (
        <BlurView
            style={styles.modalBodyContainer}
            overlayColor='white'
            blurType='light'
            blurAmount={15}
        >
            <ScrollView style={[Style.dimen(50, 50)]}>
                <Text>kdsblsdfblsdkfnlsd</Text>
            </ScrollView>
        </BlurView>
    )
}

const styles = StyleSheet.create({
    topImageBg: {
        position: 'absolute',
        ...w_100,
        top: 0,
        left: 0,
        aspectRatio: 1280 / 696,
    },
    topImageTextContainer: {
        flex: 1,
        marginTop: StatusBar.currentHeight + 20,
        marginLeft: 10
    },
    contentContainer: {
        backgroundColor: '#fefcfb',
        paddingHorizontal: 30
    },
    topCardContainer: {
        top: -20,
        alignSelf: 'center',
        ...bg_danger,
        borderRadius: 10,
        ...w_100,
        height: 160,
    },
    topCard: {
        backgroundColor: clr_white,
        borderRadius: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        ...w_100,
        ...h_100
    },
    modalBodyContainer: {
        position: 'absolute',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        width: '90%',
        height: '90%'
    }
})
