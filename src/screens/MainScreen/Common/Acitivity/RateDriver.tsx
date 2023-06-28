import { View, Text, StyleSheet, StatusBar, BackHandler, TouchableNativeFeedback, ScrollView, ToastAndroid, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Shadow } from 'react-native-shadow-2'
import { Style, align_items_center, align_self_center, border_radius_pill, bottom_0, flex_1, flex_row, fw_500, fw_700, fw_bold, justify_center, mb_10, mb_20, mt_10, mt_25, mx_15, p_20, position_absolute, px_10, px_20, py_10, py_5, w_100 } from '../../../../stylesheets/primary-styles'
import { AirbnbRating, Avatar, Button, Icon, Rating } from '@rneui/themed'
import { GraphQLService } from '../../../../services/GraphQLService'
import { TextInput } from 'react-native-gesture-handler'
import { UserService } from '../../../../services/UserService'

export default function RateDriver() {
    const navigation = useNavigation()
    const route = useRoute()

    const [rating, setRating] = useState(5)
    const [deliveryPackage, setDeliveryPackage] = useState<GraphQLService.Type.DeliveryPackage>()
    const content = useRef('')

    useEffect(() => {
        const dp = route.params?.package

        if (!dp) {
            navigation.goBack()
            ToastAndroid.show('Error occured, try again!', ToastAndroid.LONG)
            return
        }

        setDeliveryPackage(dp)
    })

    function onContentTyped(text: string) {
        text = text.trim()
        if (text === '')
            return

        content.current = text
    }

    function submitRating() {
        if (deliveryPackage?.shipper) {
            UserService.rateShipper(
                rating,
                content.current,
                deliveryPackage.id,
                () => {
                    DeviceEventEmitter.emit('event.RateShipper.onRated')
                    ToastAndroid.show(`You rated ${rating} stars`, ToastAndroid.LONG)
                    navigation.goBack()
                },
                (error) => ToastAndroid.show('Server error!', ToastAndroid.LONG)
            )
        }
    }

    return (
        <View style={flex_1}>
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
                        RATE DRIVER
                    </Text>
                </View>
            </Shadow>
            <ScrollView style={[flex_1, p_20]}>
                <View style={[align_items_center, justify_center, { marginBottom: 40 }]}>
                    <Avatar
                        source={{ uri: deliveryPackage?.shipper?.profilePictureUrl }}
                        size={110}
                        rounded
                    />
                    <Text style={[mt_10, fw_700, Style.fontSize(18)]}>{deliveryPackage?.shipper?.firstName + ' ' + deliveryPackage?.shipper?.lastName}</Text>
                </View>
                <View style={[align_items_center, justify_center]}>
                    <View style={[flex_row, Style.backgroundColor('#f4d58d60'), py_5, px_20, border_radius_pill]}>
                        <Text style={[Style.fontSize(20), fw_bold, Style.textColor('#ee964b')]}>{rating}</Text>
                        <Text style={[Style.fontSize(20), fw_700]}> /5</Text >
                    </View>
                    <AirbnbRating
                        onFinishRating={(value: number) => setRating(value)}
                        defaultRating={5}
                    />
                </View>

                <Text style={[mt_25, fw_500, Style.fontSize(16)]}>Tell us your mind!</Text>
                <TextInput
                    placeholder='Type here...'
                    style={[Style.backgroundColor('#d3d3d3a3'), Style.borderRadius(10), mt_10, px_20]}
                    multiline
                    onChangeText={onContentTyped}
                />

            </ScrollView>
            <Button
                title={'SUBMIT RATING'}
                containerStyle={[position_absolute, bottom_0, align_self_center, mb_10]}
                buttonStyle={[Style.borderRadius(100), px_20, py_10]}
                titleStyle={[Style.textColor('#ca6702')]}
                color={'#f4d35ea3'}
                onPress={submitRating}
            />
        </View>
    )
}

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
});