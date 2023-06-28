import { View, Text, StyleSheet, Image, StatusBar, ToastAndroid, TouchableNativeFeedback, ScrollView, BackHandler, DeviceEventEmitter, Linking } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Style, align_items_center, align_self_center, bg_primary, bg_white, border_radius_pill, flex_1, flex_row, fw_bold, h_100, justify_center, mb_10, mb_15, ml_10, mt_10, mt_15, mt_20, mt_25, mt_5, my_10, my_20, p_15, pl_15, pl_25, position_absolute, px_10, px_20, px_5, py_5, w_100 } from '../../../../stylesheets/primary-styles';
import { Avatar, Button, FAB, Icon } from '@rneui/themed';
import { BottomSheet } from '@rneui/base';
import { DeliveryService } from '../../../../services/DeliveryService';
import { useNavigation, useRoute } from '@react-navigation/native'
import SockJs from 'react-stomp';
import { APIService } from '../../../../services/APIService';
import { Global } from '../../../../Global';
import { GraphQLService } from '../../../../services/GraphQLService';
import { Shadow } from 'react-native-shadow-2';
import { UserService } from '../../../../services/UserService';

function sockTopic(topic: string) {
    return `/user/${Global.User.CurrentUser.id}/notification/package/${topic}`
}

export default function ActiveActivity() {
    const navigation = useNavigation()
    const route = useRoute()
    const [btmSheetVisible, setBtmSheetVisible] = useState(false)
    const [deliveryPackage, setDeliveryPackage] = useState<GraphQLService.Type.DeliveryPackage>()
    const [chatUrl, setChatUrl] = useState<string>()
    const [_refresh, set_refresh] = useState(0)
    const [canRateShipper, setOnCanRateShipper] = useState(false)

    const refresh = () => set_refresh(val => val + 1)

    useEffect(() => {
        const stackEntry = StatusBar.pushStackEntry({
            barStyle: 'dark-content'
        })

        return () => {
            StatusBar.popStackEntry(stackEntry)
        }
    }, [])

    function getPackage() {
        try {
            const packageId: number | undefined = route.params?.packageId

            if (packageId === undefined)
                throw 'null id'

            if (packageId)

                DeliveryService.Common.getPackage(
                    packageId,
                    (deliveryPackage) => {
                        if (deliveryPackage) {
                            setDeliveryPackage(deliveryPackage)

                            UserService.canRateShiper(
                                deliveryPackage.id,
                                () => setOnCanRateShipper(true)
                            )

                        } else
                            throw ''
                    },
                    (error) => {
                        ToastAndroid.show('Cannot open: Server timeout!', ToastAndroid.LONG)
                        navigation.goBack()
                    }
                )
        } catch (error) {
            ToastAndroid.show('Cannot open!', ToastAndroid.LONG)
            navigation.goBack()
        }
    }

    useEffect(() => {
        getPackage()

        DeviceEventEmitter.addListener('event.RateShipper.onRated', () => setOnCanRateShipper(false))

    }, [])

    useEffect(() => {
        getChatChannel()
    }, [deliveryPackage])

    const statusColor = () => {
        if (deliveryPackage?.status.name.toLowerCase() === 'pending')
            return '#d68c45'

        if (deliveryPackage?.status.name.toLowerCase() === 'delivering')
            return '#2a6f97'

        if (deliveryPackage?.status.name.toLowerCase() === 'finished')
            return '#70798c'

        if (deliveryPackage?.status.name.toLowerCase() === 'canceled')
            return '#c44536'

        return '#70798c'
    }

    function statusTitle() {
        if (deliveryPackage?.status.name.toLowerCase() === 'pending')
            return 'Your parcel is being picked up by'

        if (deliveryPackage?.status.name.toLowerCase() === 'delivering')
            return 'Your parcel is being delivered by:'

        if (deliveryPackage?.status.name.toLowerCase() === 'finished')
            return 'Your parcel was delivered'

        if (deliveryPackage?.status.name.toLowerCase() === 'canceled')
            return 'Your parcel was canceled'

        return ''
    }

    function getChatChannel() {
        if (deliveryPackage && deliveryPackage.user && deliveryPackage.shipper) {
            GraphQLService.getChatSession(
                deliveryPackage.user.id,
                deliveryPackage.shipper.id,
                (session) => {
                    if (session)
                        setChatUrl(session.channelUrl)
                }
            )
        }
    }

    function openChat() {
        if (chatUrl)
            navigation.navigate('GroupChannel' as never, { channelUrl: chatUrl } as never);
        else
            ToastAndroid.show('Error, try to open from Chat tab', ToastAndroid.LONG)
    }

    function onMatched() {
        // if (deliveryPackage) {
        //     deliveryPackage.status = { id: 4, name: 'DELIVERING' }
        //     refresh()
        // }
        getPackage()
        refresh()
    }

    function cancelWaiting() {
        if (deliveryPackage) {
            DeliveryService.User.cancelWaiting(
                deliveryPackage.id,
                () => {
                    ToastAndroid.show('Package has been canceled!', ToastAndroid.LONG)
                    navigation.goBack()
                },
                () => ToastAndroid.show('Failed to cancel this package!', ToastAndroid.LONG)
            )
        }
    }

    const titleWidth = 82

    function onSockMessage(message: string | object, topic: string) {
        if (deliveryPackage) {
            switch (topic) {
                case sockTopic('driver-confirmed'):
                    deliveryPackage.status = { id: 4, name: 'DELIVERING' }
                    ToastAndroid.show('Driver has picked up your package', ToastAndroid.LONG)
                    break
                case sockTopic('finished'):
                    deliveryPackage.status = { id: 2, name: 'FINISHED' }
                    ToastAndroid.show('Your package was delivered', ToastAndroid.LONG)
                    break
                case sockTopic('canceled'):
                    deliveryPackage.status = { id: 1, name: 'CANCELED' }
                    ToastAndroid.show('Your package was canceled', ToastAndroid.LONG)
                    break
            }
            refresh()
        }
    }

    function callForHelp() {
        Linking.openURL(`tel:0851234567`)
    }

    const canRate = useMemo(() => {
        if (deliveryPackage?.creationDate) {

            const milis = Date.parse(deliveryPackage.creationDate)

            if (isNaN(milis))
                return false

            const milisIn1Day = 86400000
            console.log('>>>>>>> date: ', new Date(milis))
            return (Date.now() - milis < milisIn1Day)
        }
        return false
    }, [deliveryPackage?.creationDate])

    function openRateDriver() {
        if (deliveryPackage)
            navigation.navigate('RateDriver' as never, {
                package: deliveryPackage
            } as never)
    }


    return (
        <View style={styles.container}>
            {/* -------- TOP BAR -------- */}
            <Shadow
                style={w_100}
                containerStyle={mb_10}
                startColor='#d3d3d3f2'
            >
                <View style={styles.topBar}>
                    <TouchableNativeFeedback onPress={navigation.goBack} >
                        <View style={styles.topBarBack}>
                            <Icon name='chevron-back' type='ionicon' size={28} color={'#240046'} />
                        </View>
                    </TouchableNativeFeedback>
                    <Text style={[align_self_center, fw_bold, Style.fontSize(17), Style.textColor('#240046')]}>
                        DELIVERY DETAILS
                    </Text>
                </View>
            </Shadow>
            {/* -------------------------- */}
            <ScrollView style={flex_1}>
                {
                    (deliveryPackage && deliveryPackage?.shipper) ?
                        <>
                            <SockJs
                                url={APIService.buildDefaultEndpoint('/websocket')}
                                topics={[sockTopic('driver-confirmed'), sockTopic('finished'), sockTopic('canceled')]}
                                onMessage={onSockMessage}
                                onConnectFailure={(error: any) => console.log('error: ', error)}
                            />
                            <View style={[align_items_center, justify_center, { paddingTop: 50 }, mt_10]}>
                                <Avatar
                                    source={{ uri: deliveryPackage?.shipper?.profilePictureUrl }}
                                    rounded
                                    size={100}
                                    containerStyle={[{ zIndex: 2, top: 0 }, position_absolute, Style.border('#b1a7a6', 1, 'solid')]}
                                />
                                <Shadow startColor='#d3d3d3a4'>
                                    <View style={styles.avatarBanner}>
                                        <View style={[align_items_center]}>
                                            <Text style={[mb_15, Style.fontSize(14.5), Style.textColor('#231942')]}>{statusTitle()}</Text>
                                            <Text style={[Style.fontSize(15), fw_bold, Style.backgroundColor('#9d4edd'), Style.textColor('#fff'), border_radius_pill, px_10, py_5]}>
                                                {deliveryPackage?.shipper?.firstName + ' ' + deliveryPackage?.shipper?.lastName}
                                            </Text>
                                            <Text style={[mt_10, Style.fontSize(15), Style.backgroundColor('#9d4edd'), Style.textColor('#fff'), border_radius_pill, px_10, py_5]}>
                                                {deliveryPackage?.shipper?.phone}
                                            </Text>
                                            <Text style={[mt_10, Style.fontSize(15), Style.backgroundColor(statusColor()), Style.textColor('#fff'), border_radius_pill, px_10, py_5]}>
                                                {deliveryPackage?.status.name}
                                            </Text>
                                        </View>
                                    </View>
                                </Shadow>
                            </View>

                            <View style={[mb_15, mt_25, Style.dimen(2, '100%'), Style.backgroundColor('#ccdbdc'), border_radius_pill]}>
                            </View>

                            <View style={[align_items_center, justify_center, { paddingTop: 50 }, mt_10]}>
                                <Avatar
                                    source={{ uri: deliveryPackage?.user?.profilePictureUrl }}
                                    rounded
                                    size={100}
                                    containerStyle={[{ zIndex: 2, top: 0 }, position_absolute, Style.border('#b1a7a6', 1, 'solid')]}
                                />
                                <Shadow startColor='#d3d3d3a4'>
                                    <View style={[styles.avatarBanner, Style.height(600)]}>
                                        <View style={[flex_row, align_items_center, Style.backgroundColor('#e0aaff'), border_radius_pill, px_10, py_5]}>
                                            <Icon name='gps-fixed' type='material-icon' color={'#5a189a'} />
                                            <Text style={[ml_10, fw_bold, Style.fontSize(14.5)]}>Sender's information</Text>
                                        </View>
                                        <View style={[pl_25, mt_10]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Name:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.user.firstName + ' ' + deliveryPackage?.user.lastName}</Text>
                                            </View>
                                        </View>
                                        <View style={[pl_25, mt_5]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Phone:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.user.phone}</Text>
                                            </View>
                                        </View>
                                        <View style={[pl_25, mt_5]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Address:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.senderAddress.displayName}</Text>
                                            </View>
                                        </View>
                                        {/* ------------------------------- */}
                                        <View style={[flex_row, align_items_center, Style.backgroundColor('#ffb3c1'), border_radius_pill, px_10, py_5, mt_20]}>
                                            <Icon name='location-sharp' type='ionicon' color={'#ff5e5b'} size={22} />
                                            <Text style={[ml_10, fw_bold, Style.fontSize(14.5)]}>Recipient's information</Text>
                                        </View>
                                        <View style={[pl_25, mt_10]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Name:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.recipientName}</Text>
                                            </View>
                                        </View>
                                        <View style={[pl_25, mt_5]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Phone:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.recipientPhone}</Text>
                                            </View>
                                        </View>
                                        <View style={[pl_25, mt_5]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Address:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.recipientAddress.displayName}</Text>
                                            </View>
                                        </View>
                                        {/* ------------------------------- */}
                                        <View style={[flex_row, align_items_center, Style.backgroundColor('#ffeaae'), border_radius_pill, px_10, py_5, mt_20]}>
                                            <Icon name='package' type='feather' color={'#f18805'} size={22} />
                                            <Text style={[ml_10, fw_bold, Style.fontSize(14.5)]}>Delivery information</Text>
                                        </View>
                                        <View style={[pl_25, mt_10]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Price:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.price} VND</Text>
                                            </View>
                                        </View>
                                        {
                                            (deliveryPackage?.promotion) ?
                                                <View style={[pl_25, mt_5]}>
                                                    <View style={flex_row}>
                                                        <Text style={Style.width(titleWidth)}>Promotion:</Text>
                                                        <Text style={[flex_1, fw_bold]}>-{deliveryPackage?.promotion?.discountPercentage * 100} %</Text>
                                                    </View>
                                                </View>
                                                :
                                                null
                                        }
                                        <View style={[pl_25, mt_5]}>
                                            <View style={flex_row}>
                                                <Text style={Style.width(titleWidth)}>Note:</Text>
                                                <Text style={[flex_1, fw_bold]}>{deliveryPackage?.note}</Text>
                                            </View>
                                        </View>

                                    </View>
                                </Shadow>
                            </View>

                            <View style={Style.dimen(100, '100%')} />
                        </>
                        :
                        <WaitingBtmSheet
                            onMatched={onMatched}
                            onCancelWaiting={cancelWaiting}
                        />
                }
            </ScrollView>
            {
                (deliveryPackage?.status.name.toLowerCase() === 'delivering') ?
                    <FAB
                        onPress={openChat}
                        placement="right"
                        icon={{ name: 'chatbubble-ellipses', color: 'white', type: 'ionicon' }}
                        color="#ad1457"
                        title={"Chat with driver"}
                        containerStyle={{ marginBottom: 8, marginRight: 8 }}
                    />
                    :
                    null
            }
            {
                (deliveryPackage && ['finished', 'canceled'].includes(deliveryPackage.status.name.toLowerCase()) && canRate && canRateShipper) ?
                    <FAB
                        onPress={openRateDriver}
                        placement="right"
                        icon={{ name: 'star', color: 'white', type: 'font-awesome' }}
                        color="#ff9f1c"
                        title={"Rate driver"}
                        containerStyle={{ marginBottom: 8, marginRight: 8 }}
                    />
                    :
                    null
            }
            {
                (deliveryPackage && ['canceled'].includes(deliveryPackage.status.name.toLowerCase())) ?
                    <FAB
                        onPress={callForHelp}
                        placement="left"
                        icon={{ name: 'call', color: '#fff', type: 'ionicons' }}
                        color="#ef476f"
                        title={"Call for help"}
                        containerStyle={{ marginBottom: 8, marginRight: 8 }}
                    />
                    : null
            }
        </View>
    )
}

// -------------------------------------------

function WaitingBtmSheet(props: {
    onMatched: () => void,
    onCancelWaiting: () => void
}) {
    const navigation = useNavigation()
    const [visible, setVisible] = useState(true)
    const [matched, setMatched] = useState(false)
    const [canCancel, setCanCancel] = useState(true)

    const matchedGif = useMemo(() => {
        return (matched) ? require('../../../../resources/gifs/matched.gif') : require('../../../../resources/gifs/driverLoading.gif')
    }, [matched])

    function onSockMessage(deliveryPackage: GraphQLService.Type.DeliveryPackage) {
        if (deliveryPackage) {
            setMatched(true)
            setCanCancel(false)
            setTimeout(() => {
                setVisible(false)
                props.onMatched()
            }, 2000)
        }
    }

    return (
        <BottomSheet isVisible={visible}>
            <SockJs
                url={APIService.buildDefaultEndpoint('/websocket')}
                topics={[`/user/${Global.User.CurrentUser.id}/notification/package/driver-matched`]}
                onMessage={onSockMessage}
                onConnectFailure={(error: any) => console.log('error: ', error)}
            />
            <View style={[bg_white, Style.borderRadius(20, ['top-left', 'top-right']), p_15]}>
                <View style={[align_items_center, justify_center]}>
                    <Image
                        source={matchedGif}
                        style={Style.dimen(100, 100)}
                    />
                    {
                        (matched) ?
                            <Text style={[Style.fontSize(16), Style.textColor('#52b156'), fw_bold]}>Driver matched!</Text>
                            :
                            <>
                                <Text style={[Style.fontSize(16), Style.textColor('#ff6f22'), fw_bold]}>Waiting for drivers</Text>
                                {
                                    (canCancel) ?
                                        <Button
                                            title={"Cancel"}
                                            containerStyle={mt_20}
                                            buttonStyle={border_radius_pill}
                                            color={'#ff246133'}
                                            titleStyle={Style.textColor('#ff513d')}
                                            onPress={props.onCancelWaiting}
                                        />
                                        : null
                                }
                            </>

                    }
                    <Button
                        title={"Exit"}
                        containerStyle={mt_20}
                        buttonStyle={[border_radius_pill, px_20]}
                        color={'#cfdbd5'}
                        titleStyle={Style.textColor('#343a40')}
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </View>
        </BottomSheet>
    )
}

// -------------------------------------------

const styles = StyleSheet.create({
    topBar: {
        paddingTop: StatusBar.currentHeight + 10,
        paddingBottom: 15,
    },

    topBarBack: {
        position: 'absolute',
        marginTop: StatusBar.currentHeight + 7,
        marginLeft: 10,
    },

    container: {
        flex: 1,
    },

    avatarBanner: {
        minWidth: 300,
        height: 250,
        paddingTop: 50 + 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderRadius: 15
    }
});