import { View, Text, StyleSheet, StatusBar, ToastAndroid, Alert, DeviceEventEmitter, TouchableNativeFeedback, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Icon } from '@rneui/themed'
import { AuthenticationService } from '../../../../services/AuthenticationService'
import { align_items_center, align_self_center, bg_black, bg_danger, bg_primary, bg_white, border_radius_pill, flex_1, flex_row, fs_large, fs_semi_large, fw_bold, h_100, justify_center, mb_10, mb_20, mb_5, ml_10, ml_5, mr_10, mr_15, mr_20, mt_0, mt_10, mt_20, mt_25, mt_5, m_15, px_10, px_15, px_25, py_10, py_15, py_20, py_5, p_10, p_15, p_5, Style, text_black, w_100 } from '../../../../stylesheets/primary-styles'
import { Shadow } from 'react-native-shadow-2'
import { GraphQLService } from '../../../../services/GraphQLService'
import { Global } from '../../../../Global'

export default function ProfileTab({ route, navigation }) {
    const failedLogoutAttempt = useRef(0)
    const currentUser = useRef<GraphQLService.Type.User>();
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    useEffect(() => {
        DeviceEventEmitter.addListener('event.User.ProfileTab.onUserInfoChanged', getUser)
        // waiting for apollo client to be set before using graphql
        setTimeout(getUser, 500)
    }, [])

    function getUser() {
        const u = GraphQLService.Schema.User
        GraphQLService.getCurrentUser(
            Global.User.CurrentUser.id,
            [u.profilePictureUrl, u.firstName, u.lastName, u.phone],
            (user) => {
                currentUser.current = user
                refresh()
            },
            () => ToastAndroid.show('Cannot contact server!\nCheck your connection', ToastAndroid.LONG),
            true
        )
    }

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
                        source={{ uri: currentUser.current?.profilePictureUrl }}
                        containerStyle={Style.border('#fff', 5, 'solid')}
                    />
                </View>
                <View style={styles.profileImgText}>
                    <Text style={[fs_large, fw_bold, Style.textColor('#43474E')]}>{currentUser.current?.firstName + ' ' + currentUser.current?.lastName}</Text>
                    <View style={[flex_row, align_items_center, mt_5]}>
                        <Icon name='telephone' type='foundation' size={22} color='#8a817c' />
                        <Text style={[ml_5, fs_semi_large, Style.textColor('#43474E')]}>{currentUser.current?.phone}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainSectionContainer}>
                <View style={[align_items_center, mt_10, mb_20]}>
                    <View style={[Style.dimen(2, '20%'), Style.backgroundColor('#d9d9d9')]} />
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
        marginTop: 30,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    }

})