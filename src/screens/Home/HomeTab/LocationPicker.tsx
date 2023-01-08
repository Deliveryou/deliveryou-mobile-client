import { View, Text, StyleSheet, StatusBar, Pressable, TextInput, TouchableNativeFeedback } from 'react-native';
import React, { useState, useMemo } from 'react'
import { align_items_center, align_self_flex_start, bg_danger, bg_primary, bg_warning, bg_white, border_radius_1, border_radius_2, border_radius_pill, flex_1, flex_row, fs_giant, fw_bold, h_100, justify_center, ml_10, mr_10, mr_5, mt_10, mt_5, m_0, pb_10, pl_0, pl_5, position_center, px_10, px_15, px_5, p_0, p_10, p_5, Style, w_100, w_50 } from '../../../stylesheets/primary-styles';
import { Avatar, Icon, ListItem } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';
import { Global } from '../../../stylesheets/Global';
import { LinearGradient } from 'react-native-svg';

const emptyObject = {}
const PICKUP_LOC_INDEX = 0
const DESTINATION_LOC_INDEX = 1
const getHighlightStyle = (currentInputIndex: number, inputIndex: number) => {
    return (currentInputIndex === inputIndex) ? styles.highlightInput : emptyObject
}

export default function LocationPicker({ navigation }) {
    const [currentInputIndex, setCurrentInputIndex] = useState(0)

    return (
        <View style={styles.outterMostContainer}>
            <View style={styles.headerContainer}>
                <Pressable onPress={navigation.goBack}>
                    <Icon containerStyle={[{ paddingTop: 8 }]} size={32} name='chevron-small-left' type='entypo' color='black' />
                </Pressable>
                <View style={[flex_1, mt_5]}>
                    <Pressable
                        style={[flex_row, align_items_center, px_10, getHighlightStyle(currentInputIndex, PICKUP_LOC_INDEX)]}
                        onPress={() => {
                            setCurrentInputIndex(PICKUP_LOC_INDEX)
                        }}
                    >
                        <Icon name='gps-fixed' type='MaterialIcons' style={mr_10} color='#ef476f' />
                        <TextInput placeholder='ldkfgnbfdkjn' editable={false} />
                    </Pressable>
                    <Pressable
                        style={[flex_row, align_items_center, px_10, getHighlightStyle(currentInputIndex, DESTINATION_LOC_INDEX)]}
                        onPress={() => {
                            setCurrentInputIndex(DESTINATION_LOC_INDEX)
                        }}                    >
                        <Icon name='location' type='entypo' style={mr_10} color='#118ab2' />
                        <TextInput placeholder='ldkfgnbfdkjn' editable={false} />
                    </Pressable>
                </View>
            </View>

            <ScrollView style={[flex_1, mt_10]}>
                {
                    (currentInputIndex === PICKUP_LOC_INDEX) ?
                        <CurrentLocationPicker /> : null
                }
            </ScrollView>
        </View>
    )
}

interface SuggestionItemProps {
    iconSize?: number,
    iconName: string,
    iconType: string,
    title?: string,
    content?: string
}

// ----------------------------------------------

const CurrentLocationPicker = () => {
    return (
        <ListItem
            linearGradientProps={{
                colors: ['#FF9800', '#F44336'],
                start: { x: 1, y: 0 },
                end: { x: 0.2, y: 0 },
            }}
            ViewComponent={LinearGradient} // Only if no expo
        >
            <Avatar
                rounded
                source={{ uri: 'https://randomuser.me/api/portraits/men/33.jpg' }}
            />
            <ListItem.Content>
                <ListItem.Title style={{ color: 'white', fontWeight: 'bold' }}>
                    Chris Jackson
                </ListItem.Title>
                <ListItem.Subtitle style={{ color: 'white' }}>
                    Vice Chairman
                </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="white" />
        </ListItem>
    )
}

// const SuggestionItem = (props: SuggestionItemProps) => {
//     const iconSize = props.iconSize ? props.iconSize : 14
//     const title = props.title ? props.title : ''
//     const content = props.content ? props.content : ''

//     return (
//         <TouchableNativeFeedback>
//             <View style={styles.suggestionItemContainer}>
//                 <Icon
//                     containerStyle={[styles.suggestionItemIcon, { padding: 0.57 * iconSize }]}
//                     size={iconSize} name={props.iconName}
//                     type={props.iconType}
//                     color='#fff'
//                 />
//                 <View style={[flex_1, ml_10]}>
//                     <Text style={styles.suggestionItemTitle}>{title}</Text>
//                     <Text>{content}</Text>
//                 </View>
//             </View>
//         </TouchableNativeFeedback>
//     )
// }

const styles = StyleSheet.create({
    outterMostContainer: {
        flex: 1,
        backgroundColor: '#dee2e6'
    },
    headerContainer: {
        paddingTop: StatusBar.currentHeight,
        flexDirection: 'row',
        ...bg_white,
        ...pb_10,
        ...px_10
    },
    highlightInput: {
        backgroundColor: '#dee2e6',
        ...border_radius_2
    },
    // suggestionItemContainer: {
    //     ...bg_white,
    //     ...Style.height(50),
    //     ...w_100,
    //     ...flex_row,
    //     ...align_items_center,
    //     ...px_15
    // },
    // suggestionItemIcon: {
    //     backgroundColor: Global.Color.PRIMARY_THEME,
    //     ...border_radius_pill,
    // },
    // suggestionItemTitle: {
    //     ...fw_bold
    // }
})
