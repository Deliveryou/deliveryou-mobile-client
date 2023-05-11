import { StatusBar, StyleSheet, Text, ToastAndroid, View, Linking, Pressable, Dimensions, TouchableNativeFeedback, Alert, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Divider, FAB, Icon, Tab, TabView } from '@rneui/themed'
import { align_items_center, align_self_baseline, align_self_center, align_self_flex_start, bg_black, bg_danger, bg_dark, bg_primary, bg_warning, bg_white, border_radius_pill, clr_danger, flex_1, flex_column, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, mb_10, mb_5, ml_10, ml_5, mr_10, mt_10, mx_15, mx_20, mx_25, my_10, my_15, m_0, m_10, overflow_hidden, pl_15, pl_20, pr_15, pr_20, pr_25, pt_0, pt_10, pt_5, px_10, px_15, px_25, px_5, py_10, py_15, py_5, p_0, p_15, p_20, p_25, Style, text_black, text_white, w_100, mt_5, p_5, mb_25, p_10, ml_20, ml_25, mt_20, mx_10 } from '../../../../stylesheets/primary-styles'
import SimpleHeaderNavigation from '../../../../components/SimpleHeaderNavigation'
import { ScrollView } from 'react-native-gesture-handler'
import Clipboard from '@react-native-clipboard/clipboard'
import { Shadow } from 'react-native-shadow-2'
import User from '../../../../entities/User'
import axios from 'axios'
import { APIService } from '../../../../services/APIService'
import { Global } from '../../../../Global'
import SockJs from 'react-stomp';
import { WebSocketService } from '../../../../services/WebsocketService'
import { GraphQLService } from '../../../../services/GraphQLService'
import { MirrorflyService } from '../../../../services/MirrorflyChatService'
import { useConnection } from '@sendbird/uikit-react-native'
import { DeliveryService } from '../../../../services/DeliveryService'

const SCREEN_WIDTH = Dimensions.get('screen').width

type WSChatResponse = WebSocketService.WSChatResponse
type WSChatUser = WebSocketService.WSChatUser

export default function OngoingDelivery({ route, navigation }) {
    const deliveryPackage = useRef<GraphQLService.Type.DeliveryPackage>()
    // only for session id access, don't access package here
    const chatSession = useRef<GraphQLService.Type.ChatSession>()
    const [_refresh, setRefresh] = useState(0)
    const { connect, disconnect } = useConnection()

    const refresh = () => setRefresh(value => value + 1)

    useEffect(() => {
        deliveryPackage.current = route.params.deliveryPackage
        if (!deliveryPackage.current) {
            navigation.goBack()
            ToastAndroid.show('Cannot load delivery details!', ToastAndroid.LONG)
            return
        } else {
            try {
                // get chat id
                GraphQLService.getChatSession(
                    deliveryPackage.current.user.id,
                    deliveryPackage.current.shipper.id,
                    (session) => {
                        if (session != null) {
                            chatSession.current = session
                        } else
                            ToastAndroid.show('Cannot get your chat session', ToastAndroid.LONG)
                    },
                    () => ToastAndroid.show('Cannot contact server', ToastAndroid.LONG)
                )
            } catch (error) { }

            refresh()
        }

        connect(`${Global.User.CurrentUser.id}`)
            .then(user => console.log('>>>>>>>>> connected to chat server:', user))
            .catch(error => {
                console.log('>>>>>>>>>  chat server error: ', error)
            })

        return () => {
            disconnect().catch(error => { })
        }
    }, [])


    function onSockMessage(response: WSChatResponse) {
        try {
            console.log('123245654')
        } catch (error) {
            console.log('----- ongo WS on msg error: ', error)
        }
    }

    function openChat() {
        if (deliveryPackage.current && chatSession.current) {
            navigation.navigate('GroupChannel', { channelUrl: chatSession.current.channelUrl });
        } else
            ToastAndroid.show('Cannot show chat', ToastAndroid.LONG)
    }

    function confirmPickup() {
        if (deliveryPackage.current) {
            DeliveryService.Shipper.confirmPickup(
                deliveryPackage.current.id,
                () => {
                    deliveryPackage.current.status = { id: 4, name: 'DELIVERING' }
                    refresh()
                    DeviceEventEmitter.emit('event.ShipperHomeTab.onDeliveryPickedUp')
                },
                (error) => ToastAndroid.show('Error: server timeout', ToastAndroid.LONG)
            )
        }
    }

    function confirmFinish() {
        Alert.alert(
            "This operation cannot be undone",
            'Are you sure to continue?',
            [
                {
                    text: 'Continue', onPress: () => {
                        if (deliveryPackage.current) {
                            DeliveryService.Shipper.confirmFinish(
                                deliveryPackage.current.id,
                                () => {
                                    ToastAndroid.show('Delivery finished', ToastAndroid.LONG)
                                    DeviceEventEmitter.emit('event.ShipperHomeTab.onDeliveryFinishedOrCanceled')
                                    navigation.goBack()
                                },
                                (error) => ToastAndroid.show('Error: server timeout', ToastAndroid.LONG)
                            )
                        }
                    }
                },
                { text: 'Cancel' }
            ]
        )
    }

    function cancelDelivery() {
        Alert.alert(
            "Cancel this delivery?",
            'Continue and take responsibility!',
            [
                {
                    text: 'Continue', onPress: () => {
                        if (deliveryPackage.current) {
                            DeliveryService.Shipper.cancelDelivery(
                                deliveryPackage.current.id,
                                () => {
                                    ToastAndroid.show('Delivery canceled', ToastAndroid.LONG)
                                    DeviceEventEmitter.emit('event.ShipperHomeTab.onDeliveryFinishedOrCanceled')
                                    navigation.goBack()
                                },
                                (error) => ToastAndroid.show('Error: server timeout', ToastAndroid.LONG)
                            )
                        }
                    }
                },
                { text: 'Cancel' }
            ]
        )
    }
    console.log('####################### del: ', deliveryPackage.current?.status)

    return (
        <View style={[flex_1]}>
            <SockJs
                url={APIService.buildDefaultEndpoint('/websocket')}
                topics={[`/user/${Global.User.CurrentUser.id}/notification/chat`]}
                onConnect={() => console.log('--- ws ongo: connected')}
                onDisconnect={() => console.log('--- ws ongo: disconnected')}
                onMessage={onSockMessage}
                onConnectFailure={(error: any) => console.log('error: ', error)}
            />
            <SimpleHeaderNavigation
                navigation={navigation}
                title='Ongoing Delivery'
                parentStatusBarValues={{
                    backgroundColor: 'transparent',
                    barStyle: 'dark-content'
                }}
            />
            <ScrollView>
                {
                    (deliveryPackage.current?.note) ?
                        <View style={[flex_row, p_10, m_10, Style.backgroundColor('#f0716799'), Style.borderRadius(10), Style.border('#f07167', 1, 'solid')]}>
                            <Text style={[mr_10, fw_bold, Style.fontSize(15)]}>NOTE:</Text>
                            <Text style={[flex_1, Style.textColor('#540b0e'), Style.fontSize(15)]}>{deliveryPackage.current?.note}</Text>
                        </View>
                        : null
                }
                <InfoCards
                    deliveryPackage={deliveryPackage.current}
                />
                <View style={[flex_row, { marginLeft: 40 }, mt_20]}>
                    <Text style={[Style.width(80), Style.fontSize(15), fw_bold]}>Price:</Text>
                    <Text style={[flex_1, Style.fontSize(15)]}>{deliveryPackage.current?.price} VND</Text>
                </View>
                {
                    (deliveryPackage.current?.promotion) ?
                        <View style={[flex_row, { marginLeft: 40 }]}>
                            <Text style={[Style.width(80), Style.fontSize(15), fw_bold]}>Discount:</Text>
                            <Text style={[flex_1, Style.fontSize(15)]}>{deliveryPackage.current.promotion.discountPercentage * 100} %</Text>
                        </View>
                        : null
                }
            </ScrollView>
            <View style={[flex_row, align_items_center, justify_center, mb_10]}>
                {
                    (!deliveryPackage.current || ['finished', 'canceled'].includes(deliveryPackage.current.status.name.toLowerCase())) ?
                        <View style={[Style.backgroundColor('#d3d3d3'), flex_1, align_items_center, py_10, mx_10, Style.borderRadius(10)]}>
                            <Text style={[Style.fontSize(15)]}>Package was {deliveryPackage.current?.status.name.toLowerCase()}</Text>
                        </View>
                        :
                        (deliveryPackage.current?.status.name.toLowerCase() === 'pending') ?
                            <Button
                                title='CONFIRM PICKUP'
                                buttonStyle={[py_10, pr_15, pl_20]}
                                color='#0a83ff'
                                containerStyle={[Style.borderRadius(10), flex_1, mx_10]}
                                onPress={confirmPickup}
                            />
                            :
                            <>
                                <Button
                                    color={'#e5e5eb'}
                                    title='CANCEL DELIVERY'
                                    onPress={cancelDelivery}
                                    buttonStyle={[py_10, pl_15, pr_25]}
                                    titleStyle={Style.textColor('#ff3d30')}
                                    containerStyle={{ borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
                                />
                                <Button
                                    title='CONFIRM FINFISH'
                                    onPress={confirmFinish}
                                    buttonStyle={[py_10, pr_15, pl_20]}
                                    color='#0a83ff'
                                    containerStyle={{ borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
                                />
                            </>
                }
            </View>
            {
                (deliveryPackage.current?.status.name.toLowerCase() === 'delivering') ?
                    < FAB
                        onPress={openChat}
                        placement="right"
                        icon={{ name: 'chatbubble-ellipses', color: 'white', type: 'ionicon' }}
                        color="#ad1457"
                        containerStyle={{ marginBottom: 50, marginRight: 8 }}
                    />
                    : null
            }
        </View>
    )
}

// -------------------------------------------
interface InfoCardsProps {
    deliveryPackage?: GraphQLService.Type.DeliveryPackage
}

function InfoCards(props: InfoCardsProps) {
    const [index, setIndex] = React.useState(0);
    const tabHeaderHeight = 45
    const tabHeight = 350

    return (
        <View style={[align_items_center]}>
            <View style={[bg_danger, p_5, border_radius_pill, Style.backgroundColor('#d7d7d7'), my_10]}>
                <View style={[Style.dimen(tabHeaderHeight, 250), overflow_hidden, border_radius_pill, Style.backgroundColor('#d7d7d7')]}>
                    <Tab
                        value={index}
                        onChange={(e) => setIndex(e)}
                        indicatorStyle={{
                            backgroundColor: 'white',
                            ...border_radius_pill,
                            height: tabHeaderHeight
                        }}
                        variant="default"
                        style={Style.height(tabHeaderHeight)}
                    >
                        <Tab.Item
                            title="Recipient"
                            titleStyle={[{ fontSize: 15 }]}
                            containerStyle={[{ zIndex: 10 }]}
                            buttonStyle={[p_0, Style.height(tabHeaderHeight)]}
                        />
                        <Tab.Item
                            title="Sender"
                            titleStyle={[{ fontSize: 15 }]}
                            containerStyle={[{ zIndex: 10 }]}
                            buttonStyle={[p_0, Style.height(tabHeaderHeight)]}
                        />
                    </Tab>
                </View>
            </View>
            <View style={[w_100, Style.height(tabHeight)]}>
                <TabView disableSwipe={true} value={index} onChange={setIndex} animationType="spring">
                    <TabView.Item style={{ width: '100%', height: tabHeight, alignItems: 'center', justifyContent: 'center' }}>
                        <Shadow
                            distance={10}
                            startColor={'#ced4dab3'}
                            style={[bg_white]}
                        >
                            <View style={[styles.shadowContainer, px_10]}>
                                <View style={[w_100, align_items_center]}>
                                    <Text style={[fw_bold, fs_large, mb_10, Style.backgroundColor('#22577a'), border_radius_pill, px_10, py_5, text_white]}>
                                        {(props.deliveryPackage) ? props.deliveryPackage.recipientName : '[No name]'}
                                    </Text>
                                </View>
                                <TouchableNativeFeedback
                                    onLongPress={() => ToastAndroid.show('Call this number in dialer', ToastAndroid.SHORT)}
                                    onPress={() => {
                                        Linking.openURL(`tel:${props.deliveryPackage?.recipientPhone}`)
                                            .catch(error => ToastAndroid.show('Cannot launch dialer', ToastAndroid.SHORT))
                                    }}
                                >
                                    <View style={[flex_row, align_items_center, border_radius_pill, px_10, py_5]}>
                                        <Icon name='phone' type='entypo' size={18} color='#007f5f' />
                                        <Text style={[fs_semi_large, mr_10, ml_5, fw_bold]}>{props.deliveryPackage?.recipientPhone}</Text>
                                    </View>
                                </TouchableNativeFeedback>
                                <TouchableNativeFeedback
                                    onLongPress={() => ToastAndroid.show('Open this address in Google map', ToastAndroid.SHORT)}
                                    onPress={() => {
                                        const address = props.deliveryPackage?.recipientAddress
                                        if (address) {
                                            Linking.openURL(`geo:0,0?q=${address.latitude},${address.longitude}`)
                                                .catch(error => ToastAndroid.show('Cannot launch Google map', ToastAndroid.SHORT))
                                        }
                                    }}
                                >
                                    <View style={[flex_row, border_radius_pill, px_10, py_5]}>
                                        <Icon name='location-pin' type='entypo' size={22} color='#f72585' />
                                        <Text style={[fs_semi_large, mr_10, ml_5]}>{props.deliveryPackage?.recipientAddress?.displayName}</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        </Shadow>
                    </TabView.Item>
                    <TabView.Item style={{ width: '100%', height: tabHeight, alignItems: 'center', justifyContent: 'center' }}>
                        <Shadow
                            distance={10}
                            startColor={'#ced4dab3'}
                            style={[bg_white]}
                        >
                            <View style={[styles.shadowContainer, px_10]}>
                                <View style={[w_100, align_items_center]}>
                                    <Avatar
                                        containerStyle={[mt_10, mb_10]}
                                        size={90}
                                        rounded
                                        source={{ uri: props.deliveryPackage?.user?.profilePictureUrl }}
                                    />
                                    <Text style={[fw_bold, fs_large, mb_10, Style.backgroundColor('#22577a'), border_radius_pill, px_10, py_5, text_white]}>
                                        {(props.deliveryPackage?.user) ? `${props.deliveryPackage.user.firstName} ${props.deliveryPackage.user.lastName}` : '[No name]'}
                                    </Text>
                                </View>
                                <TouchableNativeFeedback
                                    onLongPress={() => ToastAndroid.show('Call this number in dialer', ToastAndroid.SHORT)}
                                    onPress={() => {
                                        Linking.openURL(`tel:${deliveryPackage.current?.recipientPhone}`)
                                            .catch(error => ToastAndroid.show('Cannot launch dialer', ToastAndroid.SHORT))
                                    }}
                                >
                                    <View style={[flex_row, align_items_center, border_radius_pill, px_10, py_5]}>
                                        <Icon name='phone' type='entypo' size={18} color='#007f5f' />
                                        <Text style={[fs_semi_large, mr_10, ml_5, fw_bold]}>{props.deliveryPackage?.user?.phone}</Text>
                                    </View>
                                </TouchableNativeFeedback>
                                <TouchableNativeFeedback
                                    onLongPress={() => ToastAndroid.show('Open this address in Google map', ToastAndroid.SHORT)}
                                    onPress={() => {
                                        const address = props.deliveryPackage?.senderAddress
                                        if (address) {
                                            Linking.openURL(`geo:0,0?q=${address.latitude},${address.longitude}`)
                                                .catch(error => ToastAndroid.show('Cannot launch Google map', ToastAndroid.SHORT))
                                        }
                                    }}
                                >
                                    <View style={[flex_row, border_radius_pill, px_10, py_5]}>
                                        <Icon name='location-pin' type='entypo' size={22} color='#f72585' />
                                        <Text style={[fs_semi_large, mr_10, ml_5]}>{props.deliveryPackage?.senderAddress?.displayName}</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        </Shadow>
                    </TabView.Item>
                </TabView>
            </View>
        </View >
    )
}

// -------------------------------------------

const styles = StyleSheet.create({
    shadowContainer: {
        justifyContent: 'center',
        borderRadius: 20,
        width: SCREEN_WIDTH * 0.8,
        maxWidth: 400,
        height: SCREEN_WIDTH * 0.8,
        maxHeight: 400,
    }
})

