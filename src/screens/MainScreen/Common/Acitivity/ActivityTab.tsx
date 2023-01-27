import { View, ScrollView, ToastAndroid, StyleSheet, StatusBar, Text, FlatList, TouchableNativeFeedback, TouchableHighlight, TouchableOpacity, Pressable } from 'react-native';
import React, { } from 'react'
import { align_items_center, align_self_baseline, align_self_flex_end, align_self_flex_start, bg_black, bg_danger, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_pill, clr_danger, flex_1, flex_row, fs_giant, fs_large, fs_semi_giant, fs_semi_large, fs_semi_small, fw_400, fw_500, fw_600, fw_bold, justify_center, mb_10, ml_10, mr_10, mr_5, mt_10, overflow_hidden, pl_10, position_center, px_10, size_fill, Style, text_white, w_100 } from '../../../../stylesheets/primary-styles';
import { Avatar, Button, Icon, ListItem } from '@rneui/themed';
import { LinearGradient } from 'react-native-svg';
import { Global } from '../../../../Global';

const data = [
    { title: 'title 1', content: 'content 1' },
    { title: 'title 2', content: 'content 2' },
    { title: 'title 3', content: 'content 3' },
    { title: 'title 4', content: 'content 4' },
    { title: 'title 5', content: 'content 5' },
    { isLastItem: true }
]

const RenderListItem = (props: object) => {
    console.log('props: ', props)
    return (
        <>
            {
                (props.item?.isLastItem === true) ?
                    <Pressable style={align_items_center}>
                        <Text style={[fw_bold, mt_10, Style.textColor(Global.Color.PRIMARY_THEME)]}>See older activities</Text>
                    </Pressable>
                    :
                    <View>
                        <ListItem.Swipeable
                            onLongPress={() => ToastAndroid.show('Swipe left to delete', 1000)}
                            leftWidth={0}
                            rightWidth={70}
                            minSlideWidth={40}
                            rightContent={(action) => (
                                <Button
                                    containerStyle={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        backgroundColor: '#e63946',
                                    }}
                                    type="clear"
                                    icon={{ name: 'delete-outline', color: 'white' }}
                                    onPress={action}
                                />
                            )}
                        >
                            <Icon style={mr_10} name="label-important-outline" type="material" />
                            <ListItem.Content>
                                <ListItem.Title style={[fw_bold]}>{props.item?.title}</ListItem.Title>
                                <ListItem.Subtitle>{props.item?.content}</ListItem.Subtitle>
                            </ListItem.Content>
                            <ListItem.Chevron style={{ transform: [{ scaleX: -1 }] }} />
                        </ListItem.Swipeable>
                        <View style={[bg_transparent, w_100, Style.height(10)]} />
                    </View>
            }
        </>
    )
}
export default function ActivityTab() {
    return (
        <>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={[fw_500, fs_semi_giant]}>Activity</Text>
                </View>
                <View style={styles.headerContentContainer}>
                    <Button
                        title="History"
                        buttonStyle={[bg_transparent]}
                        titleStyle={{ fontSize: 14, color: '#000' }}
                        containerStyle={styles.headerContentItem}
                    >
                        <Icon style={mr_5} name='history' type='FontAwesome5' />
                        History
                    </Button>
                    <Button
                        title="History"
                        buttonStyle={[bg_transparent]}
                        titleStyle={{ fontSize: 14, color: '#000' }}
                        containerStyle={styles.headerContentItem}
                    >
                        <Icon style={mr_5} name='line-graph' type='entypo' />
                        Reports
                    </Button>
                </View>
            </View>
            <Text style={[ml_10, fs_large]}>Recent</Text>
            <FlatList
                style={mt_10}
                renderItem={RenderListItem}
                data={data}
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
