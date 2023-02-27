import { StatusBar, StyleSheet, Text, ToastAndroid, View, Linking, Pressable, Dimensions, TouchableNativeFeedback } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Avatar, Button, Divider, Icon } from '@rneui/themed'
import { align_items_center, align_self_baseline, align_self_center, align_self_flex_start, bg_danger, bg_dark, bg_primary, bg_white, border_radius_pill, clr_danger, flex_1, flex_column, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, mb_10, ml_10, ml_5, mr_10, mt_10, mx_15, mx_20, mx_25, my_10, my_15, m_10, px_10, px_15, px_25, py_10, py_5, p_15, p_20, p_25, Style, text_black, text_white, w_100 } from '../../../../stylesheets/primary-styles'
import SimpleHeaderNavigation from '../../../../components/SimpleHeaderNavigation'
import { ScrollView } from 'react-native-gesture-handler'
import Clipboard from '@react-native-clipboard/clipboard'
import { Shadow } from 'react-native-shadow-2'
import User from '../../../../entities/User'
import axios from 'axios'
import { APIService } from '../../../../services/APIService'
//const SockJS = require('sockjs')

const SCREEN_WIDTH = Dimensions.get('screen').width

function test() {
    // var sock = new SockJS(APIService.buildDefaultEndpoint('/websocket'))
    // sock.onopen = function () {
    //     console.log('open');
    //     //sock.send('test');
    // };

    // sock.onmessage = (error: any) => {
    //     console.log('message', error.data);
    //     //sock.close();
    // };

    // sock.onclose = function () {
    //     console.log('close');
    // };
}

export default function OngoingDelivery({ route, navigation }) {
    const client = useRef<User>({
        id: 1,
        firstname: 'Andre',
        lastname: 'W',
        phone: '0123456789'
    })

    return (
        <View style={[flex_1]}>
            <SimpleHeaderNavigation
                navigation={navigation}
                title='Ongoing Delivery'
                parentStatusBarValues={{
                    backgroundColor: 'transparent',
                    barStyle: 'dark-content'
                }}
            />
            <ScrollView>
                <Button title={'click'}
                    onPress={() => {
                        console.log('test')
                        test()
                    }}
                />
                <View style={[p_25, align_items_center]}>
                    <Shadow
                        distance={10}
                        startColor={'#ced4dab3'}
                        style={[bg_white]}
                    >
                        <View style={[styles.recipientContainer, px_10]}>
                            <View style={[w_100, align_items_center]}>
                                <Text style={[fw_bold, fs_semi_large, text_black]}>Recipient:</Text>
                                <Avatar
                                    containerStyle={[mt_10, mb_10]}
                                    size={90}
                                    rounded
                                    source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
                                />
                                <Text style={[fw_bold, fs_large, mb_10, Style.backgroundColor('#22577a'), border_radius_pill, px_10, py_5, text_white]}>
                                    Andie W
                                </Text>
                            </View>
                            <TouchableNativeFeedback
                                onLongPress={() => ToastAndroid.show('Call this number in dialer', ToastAndroid.SHORT)}
                                onPress={() => {
                                    Linking.openURL(`tel:${client.current.phone}`)
                                        .catch(error => ToastAndroid.show('Cannot launch dialer', ToastAndroid.SHORT))
                                }}
                            >
                                <View style={[flex_row, align_items_center, border_radius_pill, px_10, py_5]}>
                                    <Icon name='phone' type='entypo' size={18} color='#007f5f' />
                                    <Text style={[fs_semi_large, mr_10, ml_5, fw_bold]}>{client.current.phone}</Text>
                                </View>
                            </TouchableNativeFeedback>
                            <TouchableNativeFeedback
                                onLongPress={() => ToastAndroid.show('Open this address in Google map', ToastAndroid.SHORT)}
                                onPress={() => {
                                    Linking.openURL(`geo:0,0?q=${10.820384},${106.6743788}`)
                                        .catch(error => ToastAndroid.show('Cannot launch Google map', ToastAndroid.SHORT))
                                }}
                            >
                                <View style={[flex_row, border_radius_pill, px_10, py_5]}>
                                    <Icon name='location-pin' type='entypo' size={22} color='#f72585' />
                                    <Text style={[fs_semi_large, mr_10, ml_5]}>sdfsd sdfs ds fdsf ds fs fds fs fds fdf fdg dffd fdfdgd dfgdfg df dfg  dgf dfg dfg</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </Shadow>
                </View>
                <View>
                    <Text>Recipient</Text>
                </View>
            </ScrollView>
            <Button color={clr_danger} title='CANCEL DELIVERY' />
            <Button title='CONFIRM ITEM PICKED UP' />
        </View>
    )
}

const styles = StyleSheet.create({
    recipientContainer: {
        justifyContent: 'center',
        borderRadius: 20,
        width: SCREEN_WIDTH * 0.8,
        maxWidth: 400,
        height: SCREEN_WIDTH * 0.8,
        maxHeight: 400,
    }
})

