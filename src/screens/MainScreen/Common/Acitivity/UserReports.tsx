import { View, Text, ScrollView, StyleProp, ViewStyle, TouchableNativeFeedback, StyleSheet, StatusBar, ToastAndroid } from 'react-native'
import { Style, align_items_center, border_radius_pill, flex_1, flex_row, fw_600, fw_bold, m_10, mb_10, mb_25, mb_5, mt_15, overflow_hidden, p_10, position_absolute, w_100 } from '../../../../stylesheets/primary-styles'
import React, { useEffect, useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { Icon } from '@rneui/themed'
import { ReportService } from '../../../../services/ReportService'

export default function UserReports() {
    const [packagesThisMonth, setPackagesThisMonth] = useState(0)
    const [allTimePackages, setAllTimePackages] = useState(0)
    const [spendingThisMonth, setSpendingThisMonth] = useState(0)
    const [allTimeSpending, setAllTimeSpending] = useState(0)

    useEffect(() => {
        ReportService.User.quickReports(
            (reports) => {
                setPackagesThisMonth(reports.packagesThisMonth)
                setAllTimePackages(reports.allTimePackages)
                setSpendingThisMonth(reports.spendingThisMonth)
                setAllTimeSpending(reports.allTimeSpending)
            },
            (error) => ToastAndroid.show('Quick reports error: server timeout', ToastAndroid.LONG)
        )

    }, [])

    return (
        <ScrollView style={styles.container}>
            <View style={[align_items_center, mt_15, mb_25]}>
                <View style={styles.header}>
                    <Text style={[fw_bold, Style.fontSize(19), Style.textColor('#fff')]}>Reports Dashboard</Text>
                </View>
            </View>


            <View style={[flex_row, mb_5]}>
                <Card
                    borderRadius={10}
                    wrapperStyle={[flex_1]}
                >
                    <View style={[align_items_center]}>
                        <Text style={[fw_bold, Style.fontSize(22), Style.textColor('#3a7ca5')]}>{spendingThisMonth}</Text>
                        <Text style={[Style.fontSize(15), fw_600]}>This Month Spending</Text>
                    </View>
                </Card>
            </View>
            <View style={[flex_row, mb_5]}>
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
            <View style={[flex_row]}>
                <Card
                    borderRadius={10}
                    wrapperStyle={[flex_1]}
                >
                    <View style={[align_items_center]}>
                        <Text style={[fw_bold, Style.fontSize(22), Style.textColor('#57cc99')]}>{allTimeSpending}</Text>
                        <Text style={[Style.fontSize(15), fw_600]}>All Time Spending</Text>
                    </View>
                </Card>
            </View>
        </ScrollView>
    )
}

// ------------------------------------

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

// ------------------------------------


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
