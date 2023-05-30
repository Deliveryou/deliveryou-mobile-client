import { View, Text, StyleSheet, ScrollView, StatusBar, ToastAndroid, FlatList, ListRenderItemInfo } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Style, align_items_center, flex_1, flex_row, fw_600, fw_bold, mb_10, mb_20, mt_10, mx_10, mx_20, p_5, px_15, px_25, py_10 } from '../../../../stylesheets/primary-styles';
import { Shadow } from 'react-native-shadow-2';
import { Avatar, ListItem } from '@rneui/themed';
import { GraphQLService } from '../../../../services/GraphQLService';
import { WalletService } from '../../../../services/WalletService';
import { useNavigation } from '@react-navigation/native'

function HistoryListItem(props: ListRenderItemInfo<GraphQLService.Type.TransactionHistory>) {
    const item = props.item

    const iconBgColor = (item.amount < 0) ? '#fb8b24' : '#227c9d'
    const iconName = (item.amount < 0) ? 'bank-minus' : 'bank-plus'

    return (
        <ListItem bottomDivider containerStyle={[px_25, mb_10]}>
            <Avatar
                rounded
                icon={{ name: iconName, type: 'material-community', size: 24 }}
                containerStyle={Style.backgroundColor(iconBgColor)}
                size={35}
            />
            <ListItem.Content>
                <ListItem.Title style={[Style.textColor(iconBgColor), fw_bold, Style.fontSize(18)]}>{item.amount}</ListItem.Title>
                <ListItem.Subtitle style={[Style.textColor('#463f3a')]}>{item.creationTime}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem>
    )
}

export default function WalletHistory() {
    const navigation = useNavigation()
    const [wallet, setWallet] = useState<GraphQLService.Type.Wallet>()
    const [transactionList, setTransactionList] = useState<GraphQLService.Type.TransactionHistory[]>([])

    useEffect(() => {
        const sbstack = StatusBar.pushStackEntry({
            backgroundColor: '#e9ecef'
        })

        WalletService.Common.getWalletInfo(
            (wallet) => setWallet(wallet),
            (error) => {
                ToastAndroid.show('Server timeout', ToastAndroid.LONG)
                navigation.goBack()
            }
        )

        return () => {
            StatusBar.popStackEntry(sbstack)
        }

    }, [])

    useEffect(() => {
        if (wallet) {
            WalletService.Common.getHistory(
                wallet.id,
                (list) => setTransactionList(list),
                (error) => ToastAndroid.show('Cannot load history: server timeout', ToastAndroid.LONG)
            )
        }
    }, [wallet])



    return (
        <View style={styles.root}>
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

            <Text style={[Style.fontSize(20), fw_600, mt_10, mb_20, , mx_20, Style.textColor('#463f3a')]}>
                Transaction history
            </Text>

            <FlatList
                style={flex_1}
                data={transactionList}
                renderItem={(props) => <HistoryListItem {...props} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#e9ecef'
    }
});