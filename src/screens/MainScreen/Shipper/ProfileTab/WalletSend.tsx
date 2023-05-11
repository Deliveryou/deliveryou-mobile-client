import { View, Text, StyleSheet, StatusBar, ToastAndroid, TextInput, TouchableOpacity, ScrollView, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GraphQLService } from '../../../../services/GraphQLService';
import { useNavigation, useRoute } from '@react-navigation/native'
import { Style, align_items_center, flex_1, flex_row, fw_500, fw_600, fw_bold, justify_center, m_5, mb_20, ml_10, mr_5, mt_10, mt_15, mt_20, mt_5, mx_10, mx_5, my_10, p_0, p_10, p_5, pl_15, position_absolute, px_10, px_15, py_10, py_5, right_0, text_white, w_100 } from '../../../../stylesheets/primary-styles';
import { Shadow } from 'react-native-shadow-2';
import { Avatar, Button, Icon } from '@rneui/themed';
import Validator from '../../../../utils/Validator';
import { WalletService } from '../../../../services/WalletService';

export default function WalletSend() {
    const route = useRoute()
    const navigation = useNavigation()
    const [wallet, setWallet] = useState<GraphQLService.Type.Wallet>()
    const seachPhone = useRef('')
    const previousSearched = useRef('')
    const [enableSearch, setEnableSearch] = useState(false)
    const [driverList, setDriverList] = useState<GraphQLService.Type.User[]>([])
    const [selectedDriver, setSelectedDriver] = useState<GraphQLService.Type.User>()
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(val => val + 1)

    useEffect(() => {
        if (route.params?.wallet)
            setWallet(route.params.wallet)
        else {
            ToastAndroid.show('Error occured', ToastAndroid.LONG)
            navigation.goBack()
        }
    }, [])

    function onTyped(text: string) {
        seachPhone.current = text
        Validator.validate(
            Validator.TYPE.PHONE.VN,
            text,
            () => setEnableSearch(true),
            () => setEnableSearch(false)
        )
    }

    function search() {
        if (seachPhone.current != previousSearched.current) {
            WalletService.Common.searchDriversWithPhone(
                seachPhone.current,
                (list) => {
                    previousSearched.current = seachPhone.current
                    setSelectedDriver(undefined)
                    setDriverList(list)
                },
                (error) => {
                    ToastAndroid.show('Cannot search: Server timeout', ToastAndroid.LONG)
                    console.log('pppppppppppppppppp error: ', error)
                }
            )
        }
    }

    function gift() {
        if (wallet?.id && selectedDriver?.id && seachPhone.current != '') {
            const amountToGift = Number(seachPhone.current)

            if (isNaN(amountToGift) || amountToGift % 1 !== 0) {
                ToastAndroid.show('Invalid number format', ToastAndroid.LONG)
                return
            }

            if (amountToGift < 100) {
                ToastAndroid.show('The minimum credit to gift is 100', ToastAndroid.LONG)
                return
            } else if (amountToGift > wallet.credit) {
                ToastAndroid.show("Don't have enough credit to gift", ToastAndroid.LONG)
                return
            }

            WalletService.Shipper.giftCredits(
                wallet.id,
                selectedDriver.id,
                amountToGift,
                () => {
                    wallet.credit -= amountToGift
                    ToastAndroid.show(`Gifted ${amountToGift} credits to ${selectedDriver.firstName + '' + selectedDriver.firstName}`, ToastAndroid.LONG)
                    setSelectedDriver(undefined)
                    DeviceEventEmitter.emit('event.Wallet.onChanged')
                },
                (error) => ToastAndroid.show("Cannot gift credits: server timeout", ToastAndroid.LONG)
            )

        } else
            ToastAndroid.show('Cannot gift credits: encountered error', ToastAndroid.LONG)
    }

    return (
        <View style={styles.root}>
            <View style={[py_10]}>
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
                            (wallet) ?
                                <Text style={[mx_10, Style.fontSize(15), fw_bold, Style.textColor('#403d39')]}>
                                    {wallet.credit} credits
                                </Text>
                                : null
                        }
                    </View>
                </Shadow>
            </View>

            <Text style={[Style.fontSize(20), fw_600, mt_10, mb_20, Style.textColor('#463f3a')]}>Gift your credits to other drivers</Text>

            <Shadow
                startColor='#ced4dacc'
                distance={8}
                containerStyle={w_100}
                style={w_100}
            >
                <View style={[Style.borderRadius(10), p_10]}>
                    <View style={[flex_row, align_items_center]}>
                        <Text style={[Style.fontSize(16), fw_500]}>Available credits:</Text>
                        <Text style={[ml_10, Style.fontSize(16)]}>{wallet?.credit}</Text>
                    </View>

                    <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), mt_15]}>
                        <TextInput
                            style={[px_15, py_10, Style.fontSize(16.8)]}
                            placeholder='Search for phone number'
                            keyboardType='phone-pad'
                            onChangeText={onTyped}
                        />
                        {
                            (enableSearch) ?
                                <Icon
                                    onPress={search}
                                    name='search'
                                    type='feather'
                                    size={30}
                                    color={'#fff'}
                                    containerStyle={[position_absolute, right_0, Style.borderRadius(100), Style.backgroundColor('#725ac1'), align_items_center, justify_center, Style.dimen(45, 45)]}
                                />
                                : null
                        }
                    </View>

                    <ScrollView horizontal style={mt_5}>
                        {
                            driverList.map((driver, index) => {
                                return (
                                    <TouchableOpacity activeOpacity={0.6} key={index} onPress={() => setSelectedDriver(driver)}>
                                        <Shadow
                                            startColor='#ced4dacc'
                                            distance={8}
                                            containerStyle={[my_10, ml_10, mr_5]}
                                        >
                                            <View style={[flex_row, align_items_center, Style.borderRadius(100), p_5]}>
                                                <Avatar
                                                    source={(driver.profilePictureUrl) ? { uri: driver.profilePictureUrl } : undefined}
                                                    icon={{ name: 'person-circle-outline', type: 'ionicon', size: 28 }}
                                                    size={40}
                                                    rounded
                                                    containerStyle={Style.backgroundColor('#6c757d')}
                                                />
                                                <Text style={[mx_10, Style.fontSize(15), fw_bold, Style.textColor('#403d39')]}>{driver.firstName + ' ' + driver.lastName}</Text>
                                            </View>
                                        </Shadow>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>

                    {/* ---------- recipient info ---------- */}

                    {
                        (selectedDriver) ?
                            <>
                                <View style={[flex_row, mt_20]}>
                                    <Text style={[Style.backgroundColor('#725ac1'), Style.fontSize(15), text_white, Style.borderRadius(100), px_10, py_5]}>Driver's information</Text>
                                </View>
                                <View style={pl_15}>
                                    <View style={[flex_row, align_items_center, mt_15]}>
                                        <Text style={[Style.fontSize(16), fw_500, Style.width(120)]}>Name:</Text>
                                        <Text style={[ml_10, Style.fontSize(16), flex_1]}>{selectedDriver.firstName + ' ' + selectedDriver.lastName}</Text>
                                    </View>
                                    <View style={[flex_row, align_items_center, mt_5]}>
                                        <Text style={[Style.fontSize(16), fw_500, Style.width(120)]}>Phone number:</Text>
                                        <Text style={[ml_10, Style.fontSize(16), flex_1]}>{selectedDriver.phone}</Text>
                                    </View>
                                </View>
                                <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), mt_15]}>
                                    <TextInput
                                        style={[px_15, py_10, Style.fontSize(15.5)]}
                                        placeholder='Amount of credit to gift'
                                        keyboardType='number-pad'
                                        onChangeText={onTyped}
                                    />
                                    <Button
                                        title={"Gift"}
                                        color={'#725ac1'}
                                        onPress={gift}
                                        buttonStyle={[Style.borderRadius(100), Style.dimen(47, 60)]}
                                        containerStyle={[position_absolute, right_0]}
                                    />
                                </View>
                            </>
                            : null
                    }
                </View>

            </Shadow>

            <Shadow
                startColor={'#ced4dacc'}
                distance={8}
                containerStyle={[w_100, mt_20]}
                style={w_100}
            >
                <View style={[Style.borderRadius(10), p_10]}>
                    <Text>Instructions:</Text>
                </View>
            </Shadow>

        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        padding: 20
    }
});