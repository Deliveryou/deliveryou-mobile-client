import { View, StyleSheet, ImageBackground, StatusBar, Image, Dimensions, ScrollView, TextInput, Pressable, StyleProp, ViewStyle, Modal } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { align_items_center, align_self_flex_start, bg_black, bg_danger, bg_dark, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_1, border_radius_2, border_radius_4, clr_white, flex_1, flex_7, flex_column, flex_row, fs_semi_large, fw_400, fw_600, fw_700, fw_800, h_100, h_50, justify_center, left_0, mb_10, mb_15, mr_10, position_absolute, right_0, Style, top_0, w_100 } from '../../../stylesheets/primary-styles';
import { Icon, Text, Button } from '@rneui/themed';
import { Global } from '../../../stylesheets/Global';
import { Shadow } from 'react-native-shadow-2';
import { BlurView } from '@react-native-community/blur';

interface LocationSelectorProps {
    style?: StyleProp<ViewStyle>,
    setModalVisibleCallback?: React.Dispatch<React.SetStateAction<boolean>>
}

const LocationSelector = (props: LocationSelectorProps) => {
    const { style, setModalVisibleCallback } = props
    console.log('hometab rendered')

    return (
        <View style={style} >
            <Pressable style={[position_absolute, { top: 15, right: 15 }]}>
                <Icon name='select-arrows' type='entypo' color='#a5a58d' />
            </Pressable>
            <Pressable
                style={[flex_row, align_items_center]}
                onPress={() => setModalVisibleCallback?.(value => !value)}
            >
                <Icon name='gps-fixed' type='MaterialIcons' style={mr_10} color='#ef476f' />
                <TextInput placeholder='ldkfgnbfdkjn' editable={false} />
            </Pressable>
            <Icon name='dots-three-vertical' type='entypo' style={align_self_flex_start} color='#a5a58d' />
            <Pressable
                style={[flex_row, align_items_center]}
                onPress={() => setModalVisibleCallback?.(value => !value)}
            >
                <Icon name='location' type='entypo' style={mr_10} color='#118ab2' />
                <TextInput placeholder='ldkfgnbfdkjn' editable={false} />
            </Pressable>
        </View>
    )
}

// ---------------------------------------------

interface HomeTabProps {
    overideParentTabSwipe?: (value: boolean) => void,
    navigation?: Object
}

const onLayoutImgBg = (event: any, setStateFunction: React.Dispatch<React.SetStateAction<number>>) => {
    Global.Screen.Home.Variable.TOP_IMAGE_BG_HEIGHT.set(event.nativeEvent.layout.height)
    setStateFunction(prev => prev + 1)
}

export default function HomeTab(props: HomeTabProps) {
    const topImageSize = useRef<{ width: number, height: number }>()
    const [triggerRererender, setTriggerRererender] = useState(0)
    const [modalVisible, setModalVisible] = useState(false);

    const tmp = Global.Screen.Home.Variable
    const contentHeight = Dimensions.get('screen').height - tmp.NAV_BAR_HEIGHT.get() - tmp.TOP_IMAGE_BG_HEIGHT.get() + 50
    const imgBgTextClr = { color: Global.Color.TEXT_DARK_1 }

    return (
        <>
            <ImageBackground
                style={styles.topImageBg}
                source={require('../../../resources/backgrounds/topImageBg.jpg')}
                onLayout={(event) => onLayoutImgBg(event, setTriggerRererender)}>
                <View style={styles.topImageTextContainer}>
                    <Text style={[fs_semi_large, fw_800, mb_10, imgBgTextClr]}>Welcome To Deliveryou</Text>
                    <Text style={imgBgTextClr}>Get your items delivered,{'\n'}whenever, wherever</Text>
                </View>
            </ImageBackground>
            <ScrollView style={{ zIndex: 1 }}>
                <View style={[styles.contentContainer, Style.height(contentHeight), { marginTop: tmp.TOP_IMAGE_BG_HEIGHT.get() }]} >
                    <Shadow
                        containerStyle={[styles.topCardContainer,]}
                        startColor={'#6c757d40'}
                        distance={8}
                        style={[h_100, w_100, bg_transparent]}
                    >
                        <LocationSelector
                            style={[styles.topCard,]}
                            setModalVisibleCallback={setModalVisible} />
                    </Shadow>
                    <Button title={'VIEW ESTIMATED PRICE'} color={'#38b000'} containerStyle={border_radius_2} />
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
                    <Button title={'dfkgnl'} onPress={() => {
                        props.navigation?.navigate?.('locationPicker')
                    }} />
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
