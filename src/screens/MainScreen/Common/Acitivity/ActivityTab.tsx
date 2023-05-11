import { View, ScrollView, ToastAndroid, StyleSheet, StatusBar, ListRenderItemInfo, Text, FlatList, TouchableNativeFeedback, TouchableHighlight, TouchableOpacity, Pressable, RefreshControl, DeviceEventEmitter } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { align_items_center, align_self_baseline, align_self_flex_end, align_self_flex_start, bg_black, bg_danger, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_pill, clr_danger, flex_1, flex_row, fs_giant, fs_large, fs_semi_giant, fs_semi_large, fs_semi_small, fw_400, fw_500, fw_600, fw_bold, justify_center, mb_10, ml_10, mr_10, mr_5, mt_10, mx_10, my_10, my_5, overflow_hidden, pl_10, position_center, px_10, size_fill, Style, text_white, w_100 } from '../../../../stylesheets/primary-styles';
import { Avatar, Button, Icon, ListItem } from '@rneui/themed';
import { LinearGradient } from 'react-native-svg';
import { Global } from '../../../../Global';
import { Shadow } from 'react-native-shadow-2';
import { GraphQLService } from '../../../../services/GraphQLService';
import { DeliveryService } from '../../../../services/DeliveryService';
import { useNavigation } from '@react-navigation/native'



const RenderListItem = (props: ListRenderItemInfo<any>) => {
    const deliveryPackage: GraphQLService.Type.DeliveryPackage | undefined = props.item

    const iconColor = (deliveryPackage?.status.name.toLowerCase() === 'delivering') ? '#ff0a54' : '#087e8b'

    function onView(action: () => void) {
        DeviceEventEmitter.emit('event.local.ActivityTab.onViewItem', deliveryPackage)
        action?.()
    }

    return (
        <>
            <View>
                <Shadow
                    containerStyle={[w_100, my_5]}
                    style={w_100}
                    distance={8}
                    startColor={'#ced4da99'}
                >
                    <ListItem.Swipeable
                        onLongPress={() => ToastAndroid.show('Swipe left for more options', 1000)}
                        leftWidth={0}
                        rightWidth={70}
                        minSlideWidth={40}
                        rightContent={(action) => (
                            <Button
                                containerStyle={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    backgroundColor: iconColor,
                                }}
                                type="clear"
                                icon={{ name: 'remove-red-eye', color: 'white' }}
                                onPress={() => onView(action)}
                            />
                        )}
                    >
                        <View style={[border_radius_pill, overflow_hidden, Style.backgroundColor(iconColor), align_items_center, justify_center, Style.dimen(40, 40)]}>
                            <Icon style={[]} name="delivery-dining" type="material" color={'#fff'} />
                        </View>
                        <ListItem.Content>
                            <ListItem.Title style={[fw_bold]} numberOfLines={2}>{deliveryPackage?.recipientAddress?.displayName}</ListItem.Title>
                            <ListItem.Subtitle style={Style.textColor(iconColor)}>{deliveryPackage?.price} VND</ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron style={{ transform: [{ scaleX: -1 }] }} />
                    </ListItem.Swipeable>
                </Shadow>
                <View style={[bg_transparent, w_100, Style.height(10)]} />
            </View>
        </>
    )
}

// -------------------------------------------

export default function ActivityTab() {
    const navigation = useNavigation()
    const [packageList, setPackageList] = useState<GraphQLService.Type.DeliveryPackage[]>([])
    const [_pullToRefresh, _setPullToRefresh] = useState(false)
    const indexes = useRef<{ start: number, end: number }>({ start: 0, end: 5 })

    useEffect(() => {
        loadPackages()

        DeviceEventEmitter.addListener('event.local.ActivityTab.onViewItem', (deliveryPackage: GraphQLService.Type.DeliveryPackage) => {
            if (Global.User.CurrentUser.isRegularUser())
                navigation.navigate('ActiveActivity' as never, { packageId: deliveryPackage.id } as never)
            else if (Global.User.CurrentUser.isShipper())
                navigation.navigate('OngoingDelivery' as never, { deliveryPackage } as never)
        })
    }, [])

    function loadPackages(setNewList: boolean = true) {
        DeliveryService.Common.packageHistory(
            indexes.current.start,
            indexes.current.end,
            (list) => {
                if (setNewList) {
                    setPackageList(list)
                    _setPullToRefresh(false)
                } else {
                    setPackageList([...packageList, ...list])
                }
            },
            (error) => ToastAndroid.show('Cannot ', ToastAndroid.LONG)
        )
    }

    function refreshList() {
        indexes.current.start = 0
        indexes.current.end = 5
        loadPackages()
    }

    const SeeMoreItem = useCallback(() => {
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                style={align_items_center}
                onPress={() => {
                    indexes.current.start = indexes.current.end + 1
                    indexes.current.end = indexes.current.start + 5
                    loadPackages(false)
                }}
            >
                <Text style={[fw_bold, mt_10, Style.textColor(Global.Color.PRIMARY_THEME)]}>See older activities</Text>
            </TouchableOpacity>
        )
    }, [])

    return (
        <>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={[fw_500, fs_semi_giant]}>Activity</Text>
                </View>
                <View style={styles.headerContentContainer}>
                    {/* <Button
                        title="History"
                        buttonStyle={[bg_transparent]}
                        titleStyle={{ fontSize: 14, color: '#000' }}
                        containerStyle={styles.headerContentItem}
                    >
                        <Icon style={mr_5} name='history' type='FontAwesome5' />
                        History
                    </Button> */}
                    <Button
                        title="History"
                        buttonStyle={[bg_transparent]}
                        titleStyle={{ fontSize: 14, color: '#000' }}
                        containerStyle={styles.headerContentItem}
                        onPress={() => navigation.navigate('Reports' as never)}
                    >
                        <Icon style={mr_5} name='line-graph' type='entypo' />
                        Reports
                    </Button>
                </View>
            </View>
            <Text style={[ml_10, fs_large]}>Recent</Text>
            <FlatList
                style={[mt_10, flex_1]}
                renderItem={RenderListItem}
                data={packageList}
                ListFooterComponent={SeeMoreItem}
                refreshControl={<RefreshControl refreshing={_pullToRefresh} onRefresh={refreshList} />}
            />
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        ...w_100,
        height: 50,
        marginTop: StatusBar.currentHeight,
        ...flex_row,
    },
    headerTitle: {
        ...position_center,
        ...pl_10
    },
    headerContentContainer: {
        ...flex_row,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    headerContentItem: {
        ...mr_10,
        ...border_radius_pill,
        ...overflow_hidden,
        backgroundColor: '#219ebc4d'
    }
})
