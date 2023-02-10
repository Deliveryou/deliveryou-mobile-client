import { Image, StatusBar, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { bottom_0, flex_1, left_0, mt_20, mt_25, position_absolute, Style } from '../../../../stylesheets/primary-styles'
import { Button } from '@rneui/themed'

const v1 = require('../../../../resources/gifs/on_to_off.gif')
const v2 = require('../../../../resources/gifs/off_to_on.gif')

export default function HomeTab() {
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    return (
        <View style={styles.rootContainer}>
            <Image
                source={(_refresh % 2 == 0) ? v1 : v2}
                style={styles.gifButton}
                fadeDuration={0}

            />
            <Button title={'refresh'} onPress={refresh} />
        </View>
    )
}

const styles = StyleSheet.create({
    rootContainer: {
        paddingTop: StatusBar.currentHeight,
        flex: 1,
        backgroundColor: '#daeaea'
    },

    gifButton: {
        marginTop: StatusBar.currentHeight + 100,
        width: 180,
        height: 180,
        alignSelf: 'center',
        position: 'absolute',
        ...Style.border('#000', 1, 'solid')
    }
})