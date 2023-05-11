import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableNativeFeedback, ScrollView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { Style, flex_1, m_10, overflow_hidden, w_100 } from '../../../../stylesheets/primary-styles'
import { p_10 } from '../../../../stylesheets/primary-styles'
import { Icon } from '@rneui/themed'
import { position_absolute } from '../../../../stylesheets/primary-styles'
import { border_radius_pill } from '../../../../stylesheets/primary-styles'
import { align_items_center } from '../../../../stylesheets/primary-styles'
import { fw_bold } from '../../../../stylesheets/primary-styles'
import { flex_row } from '../../../../stylesheets/primary-styles'
import { Global } from '../../../../Global'

export default function Reports() {
    return (
        <ScrollView style={styles.container}>
            <View style={align_items_center}>
                <View style={styles.header}>
                    <Text style={[fw_bold, Style.fontSize(19), Style.textColor('#fff')]}>Reports Dashboard</Text>
                </View>
            </View>
            {
                (Global.User.CurrentUser.isShipper()) ? <ShipperReports /> : null
            }
            {
                (Global.User.CurrentUser.isRegularUser()) ? <UserReports /> : null
            }
        </ScrollView>
    )
}

// ------------------------------

function UserReports() {
    return (
        <View style={[flex_row]}>
            <Card
                borderRadius={10}
                wrapperStyle={[flex_1]}
            >
                <View style={[align_items_center]}>
                    <Text style={[fw_bold, Style.fontSize(20), Style.textColor('#fcbf49')]}>2</Text>
                    <Text>Shippers</Text>
                </View>
            </Card>
            <Card
                borderRadius={10}
                wrapperStyle={flex_1}
            >
                <View style={[align_items_center]}>
                    <Text style={[fw_bold, Style.fontSize(20), Style.textColor('#ef476f')]}>2</Text>
                    <Text>Clients</Text>
                </View>
            </Card>
        </View>
    )
}

// ------------------------------

function ShipperReports() {
    const packagesThisMonth = useState(0)
    const allTimePackages = useState(0)

    return (
        <View style={[flex_row]}>
            <Card
                borderRadius={10}
                wrapperStyle={[flex_1]}
            >
                <View style={[align_items_center]}>
                    <Text style={[fw_bold, Style.fontSize(20), Style.textColor('#fcbf49')]}>{packagesThisMonth}</Text>
                    <Text>Packages This Month</Text>
                </View>
            </Card>
            <Card
                borderRadius={10}
                wrapperStyle={flex_1}
            >
                <View style={[align_items_center]}>
                    <Text style={[fw_bold, Style.fontSize(20), Style.textColor('#ef476f')]}>{allTimePackages}</Text>
                    <Text>All Time Packages</Text>
                </View>
            </Card>
        </View>
    )
}

// ------------------------------

function Card(props: {
    borderRadius: number,
    wrapperStyle?: StyleProp<ViewStyle>
    contentContainerStyle?: StyleProp<ViewStyle>
    children?: React.ReactNode,
}) {
    const [focus, setFocus] = React.useState(false)

    return (
        <View style={[props.wrapperStyle]}>
            <Shadow style={[w_100]} containerStyle={[flex_1, m_10]} distance={8} startColor='#ced4dacc'>
                <View style={[Style.borderRadius(props.borderRadius), overflow_hidden]}>
                    <TouchableNativeFeedback
                        onPressIn={() => setFocus(true)}
                        onPressOut={() => setFocus(false)}
                    >
                        <View style={[p_10, props.contentContainerStyle]}>
                            <Icon name='dot-fill' type='octicon' containerStyle={[position_absolute, { right: 10, top: 5 }]} color={(focus) ? '#6c757d' : '#ced4da'} />
                            {props.children}
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </Shadow>
        </View>
    )
}

// ------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        paddingHorizontal: 10,
    },

    header: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#07beb8',
        ...border_radius_pill,
        paddingHorizontal: 20,
        paddingVertical: 5
    },
});