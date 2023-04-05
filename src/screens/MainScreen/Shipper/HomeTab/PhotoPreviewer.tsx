import { View, Text, BackHandler, DeviceEventEmitter, StyleSheet, StatusBar, Image } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Button } from '@rneui/base'
import { bg_danger, flex_1, fs_large, fw_bold, Style, text_white, w_100 } from '../../../../stylesheets/primary-styles'
import { Icon } from '@rneui/themed'

export default function PhotoPreviewer({ route, navigation }) {
    const statusBarEntry = useRef<any>()

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", () => {
            goBack()
            return true
        })

        statusBarEntry.current = StatusBar.pushStackEntry({ barStyle: 'light-content' })

    }, [])

    const goBack = () => {
        navigation.goBack()
        if (statusBarEntry.current) {
            StatusBar.popStackEntry(statusBarEntry.current)
            console.log('----- p')
        }
        DeviceEventEmitter.emit('event.ShipperHomeTab.backFromPreview',)
    }

    const imgSource: string = route.params?.photoUrl

    return (
        <View style={styles.rootContainer}>
            <View style={[styles.header]}>
                <Icon onPress={goBack} containerStyle={styles.headerIcon} name='chevron-back' type='ionicon' color={'#fff'} />
                <View style={styles.headerText}>
                    <Text style={[fs_large, fw_bold, text_white]}>Preview Photo</Text>
                </View>
            </View>
            {
                (imgSource) ?
                    <Image
                        source={{ uri: imgSource }}
                        style={[flex_1, { resizeMode: 'contain' }]}
                    />
                    : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#353535A6',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10
    },

    headerIcon: {
        position: 'absolute',
        top: StatusBar.currentHeight,
        left: 5,
        padding: 10
    },

    headerText: {
        ...w_100,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,
    }
})