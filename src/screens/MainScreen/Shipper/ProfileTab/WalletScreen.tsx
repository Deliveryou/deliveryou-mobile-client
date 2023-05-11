import { View, Text, StyleSheet, StatusBar, ToastAndroid, ScrollView, TouchableOpacity, StyleProp, ViewStyle, TextStyle, DeviceEventEmitter } from 'react-native'
import React, { ReactNode, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import { Style, align_items_baseline, align_items_center, align_items_end, align_items_start, bg_black, bg_danger, bg_dark, border_radius_pill, bottom_0, flex_1, flex_row, flex_row_reverse, fw_500, fw_600, fw_800, fw_bold, h_100, justify_center, justify_space_between, mb_10, mb_5, ml_10, ml_20, mr_10, mr_20, mt_10, mt_20, mt_5, mx_10, mx_20, my_10, overflow_hidden, p_0, p_10, p_15, p_20, p_5, position_absolute, px_10, px_15, px_20, py_10, py_15, py_5, text_white, w_100 } from '../../../../stylesheets/primary-styles'
import { Avatar, Icon, Image } from '@rneui/themed'
import { GraphQLService } from '../../../../services/GraphQLService'
import { WalletService } from '../../../../services/WalletService'
import { Shadow } from 'react-native-shadow-2'

function formatCredits(credit: number) {

}

export default function WalletScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const [wallet, setWallet] = useState<GraphQLService.Type.Wallet>()

    useEffect(() => {
        DeviceEventEmitter.addListener('event.Wallet.onChanged', getWalletInfo)
        getWalletInfo()

    }, [])

    function getWalletInfo() {
        WalletService.Common.getWalletInfo(
            (wallet) => setWallet(wallet),
            (error) => {
                ToastAndroid.show('Server timeout', ToastAndroid.LONG)
                navigation.goBack()
            }
        )
    }

    const cardSize = Style.dimen(200, 350)
    const buttonSize = Style.dimen(60, 60)

    function openWalletSend() {
        navigation.navigate('WalletSend' as never, { wallet } as never)
    }

    function openWidthdraw() {
        navigation.navigate('Widthdraw' as never, { wallet } as never)
    }

    return (
        <ScrollView style={styles.root}>
            <View style={[py_10, px_15]}>
                <Shadow startColor='#ced4dacc' distance={8}>
                    <View style={[flex_row, align_items_center, Style.borderRadius(100), p_5]}>
                        <Avatar
                            source={(wallet?.shipper?.profilePictureUrl) ? { uri: wallet.shipper.profilePictureUrl } : undefined}
                            icon={{ name: 'person-circle-outline', type: 'ionicon', size: 35 }}
                            size={50}
                            rounded
                            containerStyle={Style.backgroundColor('#6c757d')}
                        />
                        {
                            (wallet?.shipper) ?
                                <Text style={[mx_10, Style.fontSize(15), fw_bold, Style.textColor('#403d39')]}>{wallet.shipper.firstName + ' ' + wallet.shipper.lastName}'s Wallet</Text>
                                : null
                        }
                    </View>
                </Shadow>
            </View>
            {/* ---------- CARD ------------ */}
            <View style={[align_items_center, justify_center, px_10, mt_20]}>
                <Image
                    source={require('../../../../resources/elements/gradient-card.jpg')}
                    style={cardSize}
                    containerStyle={[Style.borderRadius(10), overflow_hidden, cardSize]}
                />
                <View style={[position_absolute, cardSize, p_15]}>
                    <Text style={[Style.textColor('#503981'), Style.fontSize(16)]}>
                        {
                            (wallet?.shipper) ? (wallet.shipper.firstName + ' ' + wallet.shipper.lastName) : '[ Wallet owner ]'
                        }
                    </Text>
                    <View style={[flex_row, { marginTop: 40 }]}>
                        <Text style={[Style.fontSize(40), fw_bold, Style.textColor('#4d3a7b')]}>{(wallet) ? wallet.credit : 0}</Text>
                        <Text style={[mt_10, ml_10, Style.fontSize(15), fw_bold, Style.textColor('#4d3a7b')]}>credits</Text>
                    </View>
                    <View style={[flex_1, flex_row_reverse, align_items_end]}>
                        <Icon
                            name='ios-grid'
                            type='ionicon'
                            color={'#f3722c'}
                            containerStyle={[Style.backgroundColor('#ede7e3'), py_5, px_10, Style.borderRadius(10)]}
                        />
                    </View>
                </View>
            </View>
            {/* ---------- CARD ------------ */}

            {
                (wallet) ?
                    <FunctionalButton
                        containerStyle={[mx_20, mt_20, mb_10]}
                        buttonStyle={[align_items_start]}
                    >
                        <Text style={[mr_10, Style.fontSize(15), fw_600, text_white, mb_5]}>Exchange Rate:</Text>
                        <Text style={[Style.fontSize(15), text_white, flex_1]}>{wallet.credit} credits = {wallet.credit * 100} VND</Text>
                    </FunctionalButton>
                    : null
            }

            <View style={[flex_row, px_20, py_10]}>
                <FunctionalButton
                    title='History'
                    containerStyle={mr_20}
                    buttonStyle={buttonSize}
                >
                    <Icon name='history' type='material-community' color={'#fff'} />
                </FunctionalButton>
                <FunctionalButton
                    title='Send'
                    containerStyle={mr_20}
                    buttonStyle={buttonSize}
                    onPress={openWalletSend}
                >
                    <Icon name='arrow-up-right' type='feather' color={'#fff'} />
                </FunctionalButton>
                <FunctionalButton
                    title='Widthdraw'
                    buttonStyle={buttonSize}
                    onPress={openWidthdraw}
                >
                    <Icon name='attach-money' type='material' color={'#fff'} />
                </FunctionalButton>
            </View>

        </ScrollView>
    )
}

// ------------------------------------

function FunctionalButton(props: {
    containerStyle?: StyleProp<ViewStyle>
    buttonStyle?: StyleProp<ViewStyle>
    titleContainerStyle?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    title?: string
    onPress?: () => void
    children?: ReactNode
}) {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={props.onPress}>
            <View style={[props.containerStyle]}>
                <View style={[Style.backgroundColor('#4d3a7b'), Style.borderRadius(8), align_items_center, justify_center, p_10, props.buttonStyle]}>
                    {props.children}
                </View>
                {
                    (props.title && props.title.trim() !== '') ?
                        <View style={[align_items_center, mt_5, props.titleContainerStyle]}>
                            <Text style={[props.titleStyle]}>{props.title}</Text>
                        </View>
                        : null
                }
            </View>
        </TouchableOpacity>
    )
}

// -------------------------------------

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: StatusBar.currentHeight
    }
});