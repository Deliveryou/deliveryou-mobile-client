import { View, Text, StyleSheet, StatusBar, ToastAndroid, Alert, DeviceEventEmitter, TouchableNativeFeedback, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Icon } from '@rneui/themed'
import { AuthenticationService } from '../../../../services/AuthenticationService'
import { align_items_center, align_self_center, bg_black, bg_danger, bg_primary, bg_white, border_radius_pill, flex_1, flex_row, fs_large, fs_semi_large, fw_bold, h_100, justify_center, mb_10, mb_5, ml_10, ml_5, mr_10, mr_15, mr_20, mt_0, mt_10, mt_20, mt_25, mt_5, m_15, px_10, px_15, px_25, py_10, py_15, py_20, py_5, p_10, p_15, p_5, Style, text_black, w_100 } from '../../../../stylesheets/primary-styles'
import { Shadow } from 'react-native-shadow-2'

export default function ProfileTab({ route, navigation }) {
    const failedLogoutAttempt = useRef(0)

    function failedLogoutAttemptAlert() {
        Alert.alert("😔  Seems like you're having trouble logging out!",
            "If this error persists, try to clear the app data",
            [
                {
                    text: "OK",
                    onPress: () => failedLogoutAttempt.current = 0
                }
            ]
        )
    }

    function logout() {
        AuthenticationService.logout(
            () => {
                DeviceEventEmitter.emit('event.app.authenticationState', false)
                ToastAndroid.show('Logged out', ToastAndroid.SHORT)
            },
            (error) => {
                ToastAndroid.show('Error has occured! Try again', ToastAndroid.SHORT)
                failedLogoutAttempt.current = failedLogoutAttempt.current + 1
                if (failedLogoutAttempt.current === 3)
                    failedLogoutAttemptAlert()
            }
        )
    }

    function openProfileEditor() {
        navigation.navigate('ProfileEditor')
    }

    return (
        <View style={styles.rootContainer}>
            <View style={styles.profileImgContainer}>
                <View style={[border_radius_pill]}>
                    <Avatar
                        size={100}
                        rounded
                        source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
                        containerStyle={Style.border('#fff', 5, 'solid')}
                    />
                </View>
                <View style={styles.profileImgText}>
                    <Text style={[fs_large, fw_bold, Style.textColor('#43474E')]}>Andie W</Text>
                    <View style={[flex_row, align_items_center, mt_5]}>
                        <Icon name='checkcircle' type='antdesign' size={15} color='#38b000' />
                        <Text style={ml_5}>Verified shipper</Text>
                    </View>
                    <View style={[flex_row, align_items_center, mt_5]}>
                        <Icon name='telephone' type='foundation' size={22} color='#8a817c' />
                        <Text style={[ml_5, fs_semi_large, Style.textColor('#43474E')]}>0123456789</Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainSectionContainer}>
                <View style={[px_25, { top: -50 }]}>
                    <Shadow style={[w_100, Style.borderRadius(20), bg_white]}>
                        <View style={[Style.dimen(4, '18%'), Style.backgroundColor('#d9d9d9'), align_self_center, mt_10, border_radius_pill]} />
                        <View style={[flex_row, py_10, px_15]}>
                            <TouchableNativeFeedback>
                                <View style={[align_items_center, justify_center, px_10, py_20, flex_1]}>
                                    <Text style={[Style.fontSize(18), mb_5, fw_bold, Style.textColor('#38b000')]}>$12</Text>
                                    <Text style={Style.textColor('#031261')}>Wallet</Text>
                                </View>
                            </TouchableNativeFeedback>
                            <View style={[Style.dimen('88%', 1.5), Style.backgroundColor('#ced4da'), align_self_center]} />
                            <TouchableNativeFeedback>
                                <View style={[align_items_center, justify_center, px_10, py_20, flex_1]}>
                                    <Text style={[Style.fontSize(18), mb_5, fw_bold, Style.textColor('#38b000')]}>$12</Text>
                                    <Text style={Style.textColor('#031261')}>Delivered</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </Shadow>
                </View>

                <ScrollView style={[flex_1]}>
                    <TouchableNativeFeedback onPress={openProfileEditor}>
                        <View style={[flex_row, py_10, align_items_center, { paddingHorizontal: 30 }]}>
                            <Icon style={[Style.width(40), mr_10]} name='account-edit' type='material-community' color={'#3b75fa'} size={25} />
                            <Text style={[fw_bold, Style.fontSize(17), Style.textColor('#031261')]}>Edit your profile</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback onPress={logout}>
                        <View style={[flex_row, py_10, align_items_center, { paddingHorizontal: 30 }]}>
                            <Icon style={[Style.width(40), mr_10]} name='poweroff' type='antdesign' color={'#ff062e'} size={18} />
                            <Text style={[fw_bold, Style.fontSize(17), Style.textColor('#ff062e')]}>Log out</Text>
                        </View>
                    </TouchableNativeFeedback>
                </ScrollView>

            </View>



            {/* <ScrollView style={[flex_1, bg_black]}>
                <View style={flex_row}>
                    <Icon name='logout' type='antdesign' />
                    <Text>Log out</Text>
                </View>
            </ScrollView> */}

            {/* <Button
                containerStyle={mt_10}
                title={"Log out"}
                onPress={logout}
            /> */}
        </View >
    )
}

const styles = StyleSheet.create({
    rootContainer: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#bcb8b1',
        flexDirection: 'column',
        flex: 1
    },

    profileImgContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 15,
    },

    profileImgText: {
        marginLeft: 25,
        flexGrow: 1
    },

    mainSectionContainer: {
        flex: 1,
        backgroundColor: '#FFFDFA',
        marginTop: 70,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    }

})