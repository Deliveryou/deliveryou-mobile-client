import { Dimensions, Image, Pressable, ScrollView, StatusBar, DeviceEventEmitter, StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { align_items_center, align_self_center, bg_black, bg_danger, bg_dark, bg_primary, bg_warning, bg_white, border_radius_pill, bottom_0, flex_1, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, left_0, mb_5, ml_5, mr_10, mr_5, mt_10, mt_20, mt_25, mt_5, mx_10, my_5, overflow_hidden, pl_10, position_absolute, px_10, py_10, py_5, p_10, p_5, Style, w_100, w_75 } from '../../../../stylesheets/primary-styles'
import { Avatar, Button, Dialog, Icon } from '@rneui/themed'
import { Shadow } from 'react-native-shadow-2'
import { UserService } from '../../../../services/UserService'
import SockJs from 'react-stomp';
import { APIService } from '../../../../services/APIService'
import { Global } from '../../../../Global'
import { GraphQLService } from '../../../../services/GraphQLService'
import { LocationService } from '../../../../services/LocationService'
import { DeliveryService } from '../../../../services/DeliveryService'

const ON_TO_OFF = require('../../../../resources/gifs/on_to_off.gif')
const OFF_TO_ON = require('../../../../resources/gifs/off_to_on.gif')

interface HomeTabProps {
    navigation: any,
    route: any
}

export default function HomeTab(props: HomeTabProps) {
    const [resultMatchedDialogVisible, setResultMatchedDialogVisible] = useState(false)
    const [activeDelivery, setActiveDelivery] = useState(false)
    const [isOff, setIsOff] = useState(true)
    const canSwitch = useRef(true)
    const currentDeliveryPackage = useRef<GraphQLService.Type.DeliveryPackage>()

    useEffect(() => {
        DeviceEventEmitter.addListener('event.ShipperHomeTab.backFromPreview', () => {
            // console.log('------ called: ', resultMatchedDialogVisible)
            setResultMatchedDialogVisible(false)
            setTimeout(() => {
                setResultMatchedDialogVisible(true)
            }, 500)
        })

        DeliveryService.Shipper.getActivePackage(
            (deliveryPackage) => {
                if (deliveryPackage) {
                    currentDeliveryPackage.current = deliveryPackage
                    setActiveDelivery(true)
                }
            },
            () => ToastAndroid.show('Cannot contact server', ToastAndroid.LONG)
        )
    }, [])


    function isActive() {
        UserService.registerAsActive(
            () => setIsOff(false),
            () => {
                ToastAndroid.show('Cannot turn on', ToastAndroid.LONG)
                setIsOff(true)
            }
        )
        console.log('on')
    }

    function isInactive() {
        UserService.registerAsInactive(
            () => setIsOff(true),
            () => ToastAndroid.show('Cannot turn off', ToastAndroid.LONG)
        )
        console.log('off')
    }

    function onSockMessage(deliveryPackage: GraphQLService.Type.DeliveryPackage) {
        if (resultMatchedDialogVisible)
            setResultMatchedDialogVisible(false)

        currentDeliveryPackage.current = deliveryPackage
        setResultMatchedDialogVisible(true)
    }

    function onReject() {
        setActiveDelivery(false)
        setResultMatchedDialogVisible(false)
        currentDeliveryPackage.current = undefined
    }

    function onAccept() {
        // register via server
        if (currentDeliveryPackage.current)
            DeliveryService.Shipper.registerPackage(
                {
                    shipperId: Global.User.CurrentUser.id,
                    packageId: currentDeliveryPackage.current.id
                },
                () => {
                    // get chat session id

                    setResultMatchedDialogVisible(false)
                    setActiveDelivery(true)

                },
                () => ToastAndroid.show('Your action is blocked by our policy', ToastAndroid.LONG)
            )
        else
            ToastAndroid.show('Cannot acccept this package', ToastAndroid.LONG)
    }

    function onCurrentDeliveryPress() {
        if (currentDeliveryPackage.current) {
            props.navigation.navigate('OngoingDelivery', {
                deliveryPackage: currentDeliveryPackage.current
            })
        } else
            ToastAndroid.show('Cannot open delivery details!', ToastAndroid.LONG)
    }

    return (
        <View style={styles.rootContainer}>
            <SockJs
                url={APIService.buildDefaultEndpoint('/websocket')}
                topics={[`/user/${Global.User.CurrentUser.id}/notification/package`]}
                onConnect={() => console.log('--- ws ship home: connected')}
                onDisconnect={() => console.log('--- ws ship home: disconnected')}
                onMessage={onSockMessage}
                onConnectFailure={(error: any) => console.log('error: ', error)}
            />
            <Pressable
                style={styles.gifButtonContainer}
                onPress={() => {
                    if (canSwitch.current) {
                        canSwitch.current = false;
                        (isOff) ? isActive() : isInactive()
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
                        onPress={onCurrentDeliveryPress}
                        navigation={props.navigation}
                        deliveryPackage={currentDeliveryPackage.current}
                    /> : null
            }

            {
                (resultMatchedDialogVisible) ?
                    <ResultMatched
                        deliveryPackage={currentDeliveryPackage.current}
                        navigation={props.navigation}
                        route={props.route}
                        isVisibleState={resultMatchedDialogVisible}
                        setVisibleState={setResultMatchedDialogVisible}
                        onReject={onReject}
                        onAccept={onAccept}
                    /> : null
            }

        </View>
    )
}

// ---------------------------------------------
type CurrentDelivery = {
    navigation: object,
    deliveryPackage?: GraphQLService.Type.DeliveryPackage,
    onPress?: () => void
}

function CurrentDelivery(props: CurrentDelivery) {
    const textWidth = 80

    return (
        <View style={[styles.activeCardContainer, mt_25]}>
            <Shadow distance={10} startColor='#ced4da'>
                <TouchableNativeFeedback
                    style={[Style.borderRadius(10)]}
                    onPress={props.onPress}
                    onLongPress={() => ToastAndroid.show('Tap to view details', ToastAndroid.SHORT)}
                >
                    <View style={[Style.width(350), p_10, bg_white, Style.borderRadius(10)]}>
                        <View style={[flex_row, align_self_center, border_radius_pill, px_10, py_5, Style.backgroundColor('#cce3deb3')]}>
                            <Icon name='package' type='feather' color={'#38b000'} />
                            <Text style={[fw_bold, fs_semi_large, Style.textColor('#38b000'), ml_5]}>Ongoing Delivery</Text>
                        </View>
                        <View style={[w_100, flex_row, mt_10]}>
                            <Text style={Style.width(textWidth)}>Destination:</Text>
                            <Text style={[flex_1, ml_5, Style.textColor('#364958')]}>{props.deliveryPackage?.recipientAddress?.displayName}</Text>
                        </View>
                        <View style={[w_100, flex_row, mt_5]}>
                            <Text style={Style.width(textWidth)}>Price:</Text>
                            <Text style={[fw_bold, flex_1, ml_5, Style.textColor('#364958')]}>{(props.deliveryPackage) ? Math.floor(props.deliveryPackage.price) : 0} (vnd)</Text>
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
    deliveryPackage?: GraphQLService.Type.DeliveryPackage,
    navigation: any,
    route: any,
    onReject?: () => void,
    onAccept?: () => void
}

function ResultMatched(props: ResultMatchedProps) {
    const [distance, setDistance] = useState<string>('0')
    const textWidth = 65

    useEffect(() => {
        try {
            if (props.deliveryPackage) {
                const { latitude: s_lat, longitude: s_lon } = props.deliveryPackage.senderAddress
                const { latitude: r_lat, longitude: r_lon } = props.deliveryPackage.recipientAddress

                LocationService.LocationIQ.direction(
                    { latitude: s_lat, longitude: s_lon },
                    { latitude: r_lat, longitude: r_lon },
                    (direction) => setDistance((direction.routes[0].distance / 1000).toFixed(2))
                )
            }
        } catch (error) {

        }
    }, [props.deliveryPackage])


    function previewPhoto() {
        console.log('--- url: ', props.deliveryPackage?.photoUrl)
        props.navigation.navigate("PhotoPreviewer", {
            photoUrl: props.deliveryPackage?.photoUrl
        })
    }

    return (
        <Dialog
            isVisible={props.isVisibleState}
            overlayStyle={{ borderRadius: 10, alignItems: 'center', width: '90%', maxWidth: 500 }}
        >
            <View style={[border_radius_pill, Style.backgroundColor('#d5bdaf'), p_5]}>
                <Avatar
                    size={80}
                    rounded
                    source={{ uri: props.deliveryPackage?.user.profilePictureUrl }}
                />
            </View>
            <Icon style={mt_5} name='star-four-points' type='material-community' color={'#f48c06'} />
            <Text style={[fs_semi_large, fw_bold, Style.textColor('#f48c06')]}>CUSTOMER MATCHED!</Text>
            <Button
                containerStyle={[border_radius_pill, mt_10]}
                title={'Preview item photo'}
                onPress={previewPhoto}
                titleStyle={[Style.textColor('#0c83fd')]}
                color='#e0edff'
            />
            <View style={[styles.divider, mt_10]} />
            <View style={[w_100, mt_5]}>
                <Text style={[fs_semi_large, fw_bold, mb_5, Style.textColor('#2f3e46')]}>Delivery overview:</Text>
                <View style={[flex_row, pl_10, mb_5]}>
                    <Text style={[mr_10, Style.width(textWidth)]}>Distance: </Text>
                    <Text style={[flex_1, fw_bold]}>{distance} km</Text>
                </View>
                <View style={[flex_row, pl_10, mb_5]}>
                    <Text style={[mr_10, Style.width(textWidth)]}>Price:</Text>
                    <Text style={[flex_1, fw_bold]}>{(props.deliveryPackage) ? Math.floor(props.deliveryPackage.price) : 0} (vnd)</Text>
                </View>
                <View style={[flex_row, pl_10, mb_5]}>
                    <Text style={[mr_10, Style.width(textWidth)]}>Sender:</Text>
                    <Text style={[flex_1, fw_bold]}>{props.deliveryPackage?.senderAddress.displayName}</Text>
                </View>
                <View style={[flex_row, pl_10]}>
                    <Text style={[mr_10, Style.width(textWidth)]}>Recipient:</Text>
                    <Text style={[flex_1, fw_bold]}>{props.deliveryPackage?.recipientAddress.displayName}</Text>
                </View>
            </View>
            <View style={[w_100, flex_row, mt_10]}>
                <Button
                    containerStyle={[flex_1, border_radius_pill, mr_5]}
                    buttonStyle={py_10}
                    title={'REJECT'}
                    titleStyle={[Style.textColor('#fe3c2e')]}
                    onPress={props.onReject}
                    color='#e0edff'
                />
                <Button
                    containerStyle={[flex_1, border_radius_pill]}
                    buttonStyle={py_10}
                    title={'ACCEPT'}
                    onPress={props.onAccept}
                    color='#0a84ff'
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
    },

    gifButtonContainer: {
        alignSelf: 'center',
        ...border_radius_pill,
        overflow: 'hidden',
        backgroundColor: 'transparent'
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