import { Dimensions, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { align_items_center, align_self_center, bg_black, bg_danger, bg_dark, bg_primary, bg_warning, bg_white, border_radius_pill, bottom_0, flex_1, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, left_0, ml_5, mr_10, mr_5, mt_10, mt_20, mt_25, mt_5, mx_10, overflow_hidden, pl_10, position_absolute, px_10, py_10, py_5, p_10, Style, w_100, w_75 } from '../../../../stylesheets/primary-styles'
import { Avatar, Button, Dialog, Icon } from '@rneui/themed'
import { Shadow } from 'react-native-shadow-2'

const ON_TO_OFF = require('../../../../resources/gifs/on_to_off.gif')
const OFF_TO_ON = require('../../../../resources/gifs/off_to_on.gif')

interface HomeTabProps {
    navigation: any,
    route: any
}

export default function HomeTab(props: HomeTabProps) {
    const [resultMatchedDialogVisible, setResultMatchedDialogVisible] = useState(true)
    const [activeDelivery, setActiveDelivery] = useState(true)
    const [isOff, setIsOff] = useState(true)
    const canSwitch = useRef(true)

    return (
        <View style={styles.rootContainer}>
            <Pressable
                style={styles.gifButtonContainer}
                onPress={() => {
                    if (canSwitch.current) {
                        canSwitch.current = false
                        setIsOff(!isOff)
                        setTimeout(() => canSwitch.current = true, 2000)
                    }
                }}
                onLongPress={() => ToastAndroid.show('Tap to turn on/off your availibility', ToastAndroid.SHORT)}
            >
                <Image
                    source={(isOff) ? ON_TO_OFF : OFF_TO_ON}
                    style={styles.gifButton}
                />
            </Pressable>

            <View style={align_items_center}>
                {
                    (isOff) ?
                        <Text style={[fs_large, fw_bold, Style.textColor('#8d99ae')]}>UNAVAILABLE  FOR  DELIVERY</Text>
                        :
                        <Text style={[fs_large, fw_bold, Style.textColor('#6a994e')]}>AVAILABLE  FOR  DELIVERY</Text>
                }
            </View>

            <Button
                onPress={() => props.navigation.navigate('MatchingOptions')}
                containerStyle={styles.option}
                color={'#006d77'}
            >
                <Icon color={'#fff'} style={mr_10} name='gear' type='font-awesome' />
                Matching Options
            </Button>

            {
                (activeDelivery) ?
                    <CurrentDelivery
                        navigation={props.navigation}
                    /> : null
            }

            {
                (resultMatchedDialogVisible) ?
                    <ResultMatched
                        isVisibleState={resultMatchedDialogVisible}
                        setVisibleState={setResultMatchedDialogVisible}
                    /> : null
            }

        </View>
    )
}

// ---------------------------------------------
type CurrentDelivery = {
    navigation: object
}

function CurrentDelivery(props: CurrentDelivery) {
    return (
        <View style={[styles.activeCardContainer, mt_25]}>
            <Shadow distance={10} startColor='#ced4da'>
                <TouchableNativeFeedback
                    style={[Style.borderRadius(10)]}
                    onPress={() => props.navigation?.navigate('OngoingDelivery')}
                    onLongPress={() => ToastAndroid.show('Tap to view details', ToastAndroid.SHORT)}
                >
                    <View style={[Style.width(350), p_10, bg_white, Style.borderRadius(10)]}>
                        <View style={[flex_row, align_self_center, border_radius_pill, px_10, py_5, Style.backgroundColor('#cce3deb3')]}>
                            <Icon name='package' type='feather' color={'#38b000'} />
                            <Text style={[fw_bold, fs_semi_large, Style.textColor('#38b000'), ml_5]}>Ongoing Delivery</Text>
                        </View>
                        <View style={[w_100, flex_row, mt_10]}>
                            <Text>Destination:</Text>
                            <Text style={[flex_1, ml_5, Style.textColor('#364958')]}>123 address</Text>
                        </View>
                        <View style={[w_100, flex_row, mt_5]}>
                            <Text>Price:</Text>
                            <Text style={[flex_1, ml_5, Style.textColor('#364958')]}>{45000} (vnd)</Text>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </Shadow>
        </View>
    )
}

// ---------------------------------------------
interface ResultMatchedProps {
    isVisibleState: boolean,
    setVisibleState: React.Dispatch<React.SetStateAction<boolean>>
}

function ResultMatched(props: ResultMatchedProps) {

    function reject() {
        props.setVisibleState(false)
    }

    function accept() {

    }

    function previewPhoto() {

    }

    return (
        <Dialog
            isVisible={props.isVisibleState}
            overlayStyle={{ borderRadius: 10, alignItems: 'center', width: '90%', maxWidth: 500 }}
        >
            <Avatar
                size={80}
                rounded
                source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
            />
            <Icon style={mt_5} name='star-four-points' type='material-community' />
            <Text style={[fs_semi_large, fw_bold]}>Customer matched!</Text>
            <Button
                containerStyle={[border_radius_pill, mt_10]}
                title={'Preview item photo'}
                onPress={previewPhoto}
            />
            <View style={[styles.divider, mt_10]} />
            <View style={[w_100, mt_5]}>
                <Text style={[fs_semi_large, fw_bold]}>Delivery overview:</Text>
                <View style={[flex_row, pl_10]}>
                    <Text style={[mr_10]}>Distance:</Text>
                    <Text style={flex_1}>{5} km</Text>
                </View>
                <View style={[flex_row, pl_10]}>
                    <Text style={[mr_10]}>Sender:</Text>
                    <Text style={flex_1}>123 address</Text>
                </View>
                <View style={[flex_row, pl_10]}>
                    <Text style={[mr_10]}>Recipient:</Text>
                    <Text style={flex_1}>123 address</Text>
                </View>
                <View style={[flex_row, pl_10]}>
                    <Text style={[mr_10]}>Expected price::</Text>
                    <Text style={flex_1}>{53000} (vnd)</Text>
                </View>
            </View>
            <View style={[w_100, flex_row, mt_10]}>
                <Button
                    containerStyle={[flex_1, border_radius_pill, mr_5]}
                    buttonStyle={py_10}
                    title={'REJECT'}
                    onPress={reject}
                />
                <Button
                    containerStyle={[flex_1, border_radius_pill]}
                    buttonStyle={py_10}
                    title={'ACCEPT'}
                    onPress={accept}
                />
            </View>
        </Dialog>
    )
}

// ---------------------------------------------

const styles = StyleSheet.create({
    rootContainer: {
        paddingTop: StatusBar.currentHeight,
        flex: 1,
        backgroundColor: '#daeaea'
    },

    gifButton: {
        width: 300,
        height: 300,
        ...Style.border('#000', 1, 'solid')
    },

    gifButtonContainer: {
        alignSelf: 'center',
        ...border_radius_pill,
        overflow: 'hidden'
    },

    option: {
        width: 200,
        alignSelf: 'center',
        ...border_radius_pill,
        marginTop: 20
    },

    divider: {
        ...w_100,
        backgroundColor: '#adb5bd',
        height: 1,
        ...border_radius_pill
    },

    activeCardContainer: {
        ...flex_row,
        ...align_self_center
    }

})