import { View, Text, StyleSheet, StatusBar, PermissionsAndroid, Pressable, TextInput, TouchableNativeFeedback, TouchableHighlight, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react'
import { align_items_center, align_self_flex_start, bg_danger, bg_primary, bg_warning, bg_white, border_radius_1, border_radius_2, border_radius_pill, flex_1, flex_column, flex_row, fs_giant, fs_large, fs_semi_large, fw_500, fw_bold, h_100, justify_center, mb_5, ml_10, mr_10, mr_5, mt_10, mt_5, m_0, pb_10, pl_0, pl_10, pl_5, position_center, pr_10, px_10, px_15, px_5, p_0, p_10, p_5, Style, text_white, w_100, w_50 } from '../../../../stylesheets/primary-styles';
import { Avatar, Icon, ListItem } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';
import { Global } from '../../../../Global';
import Address from '../../../../entities/Address';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import LocationService from '../../../../services/LocationService';
import axios from 'axios'
import NetInfo from '@react-native-community/netinfo'
import PropTypes, { Requireable } from 'prop-types';

const emptyObject = {}
const PICKUP_LOC_INDEX = 0
const DESTINATION_LOC_INDEX = 1
const getHighlightStyle = (currentInputIndex: number, inputIndex: number) => {
    return (currentInputIndex === inputIndex) ? styles.highlightInput : emptyObject
}

class AddressHolder {
    display_name: string = ''
    address: Address = new Address()
}

export default function LocationPicker({ navigation }) {
    const [currentInputIndex, setCurrentInputIndex] = useState(0)
    const startingPoint = useRef<AddressHolder>(new AddressHolder())
    const destination = useRef<AddressHolder>(new AddressHolder())


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
                        <SuggestionItem.Item
                            onItemPressed={data => {
                                console.log(12639126)
                                NetInfo.fetch().then(state => console.log("---- state: ", state))
                            }}
                            icon={{ name: 'my-location', type: 'MaterialIcons', color: '#ff006e', backgroundColor: '#ffc8dd' }}
                            backgroundColor={['#845EC2', '#D65DB5', '#FF6F91']}
                        /> : null
                }
            </ScrollView>
        </View>
    )
}

// ----------------------------------------------
let prev_location = {
    lat: 0.0,
    long: 0.0,
    set(lat: number, long: number) {
        this.lat = lat
        this.long = long
    }
}
let current_loc_display_name = 'Loading...'

function getCurrentLocation(reloader?: () => void) {
    Geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude
            const long = position.coords.longitude

            if (prev_location.lat !== lat || prev_location.long !== long || current_loc_display_name === 'Loading...') {
                console.log('location----: ', position.coords)
                prev_location.set(lat, long)
                axios.get(`${Global.API.LocationIQ.buildEndPoint(prev_location.lat, prev_location.long)}`)
                    .then(res => {
                        current_loc_display_name = res.data.display_name
                        reloader?.()
                    })
            }
        },
        error => {
            // See error code charts below.
            console.log('location error: ', error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    )
}

namespace SuggestionItem {

    /**
     * 
     * @FunctionComponent support linear gradient bg
     */
    export const Item = (props) => {
        const [reloadValue, setReloadValue] = useState(0)
        const reload = () => {
            setReloadValue(value => value + 1)
        }
        getCurrentLocation(reload)

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => props.onItemPressed?.()}
            >
                <LinearGradient
                    colors={props.backgroundColor}
                    start={props.gradientDirection.start} end={props.gradientDirection.end}
                    style={styles.item}
                >
                    <Icon
                        containerStyle={[Style.backgroundColor(props.icon.backgroundColor), border_radius_pill, Style.padding(2), mr_10]}
                        name={props.icon.name}
                        type={props.icon.type}
                        color={props.icon.color}
                    />
                    <View style={[flex_column, flex_1]}>
                        <View style={flex_row}>
                            <Text style={[Style.fontSize(14), fw_500, Style.backgroundColor('#cfbaf0'), border_radius_pill, px_10]}>
                                Current location
                            </Text>
                        </View>
                        <Text style={[Style.textColor('#edf2f4'), mt_5]}>
                            {current_loc_display_name}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    Item.propTypes = {
        header: PropTypes.shape({

        }),
        onItemPressed: PropTypes.func,
        icon: PropTypes.shape({
            name: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            color: PropTypes.string,
            backgroundColor: PropTypes.string
        }),
        backgroundColor: PropTypes.arrayOf(PropTypes.string.isRequired),
        gradientDirection: PropTypes.shape({
            start: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
            end: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
        })
    }

    Item.defaultProps = {
        icon: {
            name: 'location',
            type: 'entypo',
            color: '#000',
            backgroundColor: '#fff'
        },
        backgroundColor: ['#fff'],
        gradientDirection: {
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 }
        }
    }


}


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
    item: {
        width: '100%',
        //height: 50,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexDirection: 'row',
        alignItems: 'center',
    },
})
