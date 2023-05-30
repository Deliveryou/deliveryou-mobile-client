import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableNativeFeedback, ScrollView, StatusBar, Dimensions, ToastAndroid } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { Style, align_self_center, bg_danger, flex_1, fw_400, fw_600, justify_center, m_10, m_20, mb_15, mb_20, mt_20, overflow_hidden, pt_10, pt_15, w_100 } from '../../../../stylesheets/primary-styles'
import { p_10 } from '../../../../stylesheets/primary-styles'
import { Icon } from '@rneui/themed'
import { position_absolute } from '../../../../stylesheets/primary-styles'
import { border_radius_pill } from '../../../../stylesheets/primary-styles'
import { align_items_center } from '../../../../stylesheets/primary-styles'
import { fw_bold } from '../../../../stylesheets/primary-styles'
import { flex_row } from '../../../../stylesheets/primary-styles'
import { Global } from '../../../../Global'
import { BarChart, ContributionGraph, LineChart } from 'react-native-chart-kit'
import { ReportService } from '../../../../services/ReportService'

export default function ShipperReports() {
    const thisDate = useMemo(() => new Date(Date.now()), [])

    useEffect(() => {
        const stack = StatusBar.pushStackEntry({
            backgroundColor: '#fff'
        })

        return () => {
            StatusBar.popStackEntry(stack)
        }
    }, [])


    return (
        <ScrollView style={styles.container}>
            <View style={align_items_center}>
                <View style={styles.header}>
                    <Text style={[fw_bold, Style.fontSize(19), Style.textColor('#fff')]}>Reports Dashboard</Text>
                </View>
            </View>

            <CardReports />

            <View style={[align_items_center, mt_20]}>
                <View style={styles.header}>
                    <Text style={[fw_bold, Style.fontSize(19), Style.textColor('#fff')]}>Visualization</Text>
                </View>
            </View>

            <MonthlyRevanueChart
                thisMonth={thisDate.getMonth() + 1}
                thisYear={thisDate.getFullYear()}
            />

            <MonthlyContributionGraph
                thisMonth={thisDate.getMonth() + 1}
                thisYear={thisDate.getFullYear()}
            />

            <View style={Style.dimen(100, '100%')} />

        </ScrollView>
    )
}

// --------------------------

function CardReports(prop: {

}) {
    const [packagesThisMonth, setPackagesThisMonth] = useState(0)
    const [allTimePackages, setAllTimePackages] = useState(0)

    useEffect(() => {
        ReportService.Shipper.quickReports(
            (reports) => {
                setPackagesThisMonth(reports.packagesThisMonth)
                setAllTimePackages(reports.allTimePackages)
            },
            (error) => ToastAndroid.show('Quick reports error: server timeout', ToastAndroid.LONG)
        )

    }, [])


    return (
        <>
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
        </>
    )
}

// ------------------------------

const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function last6Months(thisMonth: number, thisYear: number) {
    const list: string[] = []

    if (thisMonth < 1 || thisMonth > 12 || thisYear < 1999)
        return list

    let startMonth = thisMonth

    for (let i = 0; i < 6; i++) {
        const month = startMonth
        const year = thisYear
        list.push(`${month}-${year}`)

        if (startMonth - 1 < 1) {
            startMonth = 12
            thisYear--
        } else
            startMonth = startMonth - 1
    }
    return list
}

function last6MonthsLabels(thisMonth: number) {
    let list: string[] = []
    if (thisMonth < 1 || thisMonth > 12)
        return list

    let startIndex = thisMonth - 1

    for (let i = 0; i < 6; i++) {
        list.push(monthName[startIndex])
        startIndex = (startIndex - 1 < 0) ? 11 : startIndex - 1
    }
    list = list.reverse()
    return list
}

function MonthlyRevanueChart(props: {
    thisMonth: number
    thisYear: number
}) {
    const [data, setData] = useState<ReportService.Types.MonthlyRevenue[]>([])
    const labels = useMemo(() => last6MonthsLabels(props.thisMonth), [])

    useEffect(() => {
        ReportService.Shipper.revenuesOfMonths(
            last6Months(props.thisMonth, props.thisYear),
            (list) => setData(list),
            (error) => {
                console.log('>>>>>>>> err: ', { ...error })
                ToastAndroid.show('Revanue chart error: server timeout', ToastAndroid.LONG)
            }
        )

    }, [])


    return (
        <Shadow distance={8} startColor='#ced4dacc' containerStyle={[m_10, mb_20]} style={w_100} >
            <View style={[Style.borderRadius(15)]}>
                <LineChart
                    data={{
                        labels,
                        datasets: [
                            {
                                data: (data.length > 0) ? data.map(dat => dat.value).reverse() : [0]
                            },
                        ],
                    }}
                    width={Dimensions.get('window').width - 45} // from react-native
                    height={220}
                    chartConfig={{
                        backgroundGradientFrom: '#eff3ff',
                        backgroundGradientTo: '#efefef',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 255) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    bezier
                    style={{ marginVertical: 15 }}
                />
                <Text style={[align_self_center, mb_15, Style.fontSize(15), fw_600]}>Monthly Revanue</Text>
            </View>
        </Shadow>
    )
}

// ------------------------------

function daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

function MonthlyContributionGraph(props: {
    thisMonth: number
    thisYear: number
}) {
    const numOfDays = useMemo(() => daysInMonth(props.thisMonth, props.thisYear), [])
    const endDays = useMemo(() => new Date(`${props.thisYear}-${props.thisMonth}-${numOfDays}`), [])
    const [contributionList, setContributionList] = useState<ReportService.Types.ContributionGraphData[]>([])

    function onDatePress(data: { date: Date, count: number }) {
        const date: Date = data.date
        ToastAndroid.show(`Date:   ${date}\nCount: ${data.count}`, ToastAndroid.LONG)
    }

    useEffect(() => {
        ReportService.Shipper.packagesPerMonth(
            props.thisMonth,
            props.thisYear,
            (list) => setContributionList(list),
            (error) => ToastAndroid.show('Cannot load contribution chart', ToastAndroid.LONG)
        )

    }, [])

    return (
        <Shadow distance={8} startColor='#ced4dacc' containerStyle={m_10} style={w_100} >
            <View style={[Style.borderRadius(15)]}>
                <ContributionGraph
                    values={contributionList}
                    endDate={endDays}
                    numDays={numOfDays}
                    horizontal={false}
                    width={'100%'}
                    height={230}
                    showMonthLabels={false}
                    squareSize={35}
                    gutterSize={3}
                    onDayPress={onDatePress}
                    style={pt_15}
                    chartConfig={{
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        color: (opacity) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        }
                    }}

                />
                <Text style={[align_self_center, mb_15, Style.fontSize(15), fw_600]}>Delivery frequency per day</Text>
            </View>
        </Shadow>
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