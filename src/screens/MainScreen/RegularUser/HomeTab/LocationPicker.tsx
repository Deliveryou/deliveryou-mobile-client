import { View, Text, StyleSheet, DeviceEventEmitter, StatusBar, PermissionsAndroid, Pressable, TextInput, TouchableNativeFeedback, TouchableHighlight, TouchableOpacity, ToastAndroid } from 'react-native';
import React, { useState, useRef, useEffect } from 'react'
import { align_items_center, align_self_flex_start, bg_danger, bg_primary, bg_warning, bg_white, border_radius_1, border_radius_2, border_radius_pill, flex_1, flex_column, flex_row, fs_giant, fs_large, fs_semi_large, fw_500, fw_bold, h_100, justify_center, mb_5, ml_10, mr_0, mr_10, mr_5, mt_10, mt_5, m_0, overflow_hidden, pb_10, pl_0, pl_10, pl_5, position_absolute, position_center, pr_0, pr_10, px_10, px_15, px_5, p_0, p_10, p_5, Style, text_white, w_100, w_50 } from '../../../../stylesheets/primary-styles';
import { Avatar, Icon, ListItem } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';
import { Global } from '../../../../Global';
import Address from '../../../../entities/Address';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios'
import NetInfo from '@react-native-community/netinfo'
import PropTypes, { func } from 'prop-types';
import { LocationService } from '../../../../services/LocationService';
import { debounce, throttle } from '../../../../utils/ultilities';
import { retriable } from '../../../../utils/ultilities'
import { Button } from '@rneui/base';
import { BlurView } from '@react-native-community/blur';

type Data = LocationService.LocationIQ.Response.Data
const EMPTY_DATA = LocationService.LocationIQ.Response.EMPTY_DATA

const emptyObject = {}
const PICKUP_LOC_INDEX = 0
const DESTINATION_LOC_INDEX = 1
const getHighlightStyle = (currentInputIndex: number, inputIndex: number) => {
    return (currentInputIndex === inputIndex) ? styles.highlightInput : emptyObject
}

let startingPointDataList: Data[] = []
let destinationDataList: Data[] = []

const onLocationTyped = throttle(
    (text: string, currentInputIndex: number, onRefreshNeeded?: () => void) => {
        getSuggestionsData(text,
            (dataList) => {
                console.log('++++++++++++ 12320792309730: ', dataList)
                if (currentInputIndex === PICKUP_LOC_INDEX)
                    startingPointDataList = dataList
                else
                    destinationDataList = dataList
                onRefreshNeeded?.()
            },
        )
    }, 1500
)


export default function LocationPicker({ route, navigation },) {
    const [currentInputIndex, setCurrentInputIndex] = useState(0)
    const startingPoint = useRef<Data>(EMPTY_DATA)
    const destination = useRef<Data>(EMPTY_DATA)
    const [_refresh, setRefresh] = useState(0)
    const startingPointInput = useRef<TextInput | null>()
    const destinationInput = useRef<TextInput | null>()
    const bottomBtnGroup = useRef({})

    function refresh() {
        setRefresh(value => value + 1)
    }

    function clearCurrentInput() {
        if (currentInputIndex === PICKUP_LOC_INDEX) {
            startingPointInput.current?.clear()
            startingPoint.current = EMPTY_DATA
            startingPointDataList = []
        } else if (currentInputIndex === DESTINATION_LOC_INDEX) {
            destinationInput.current?.clear()
            destination.current = EMPTY_DATA
            destinationDataList = []
        }
        bottomBtnGroup.current?.submitBtn?.setDisabled?.(true)
        refresh()
    }

    function ifBothSelected() {
        if (startingPoint.current && destination.current &&
            startingPoint.current.display_name?.trim() !== EMPTY_DATA.display_name &&
            destination.current.display_name?.trim() !== EMPTY_DATA.display_name) {
            bottomBtnGroup.current?.submitBtn?.setDisabled?.(false)
        }
    }

    function switchLocations() {
        const temp = destination.current
        destination.current = startingPoint.current
        destinationInput.current?.setNativeProps({ text: startingPoint.current?.display_name })
        startingPoint.current = temp
        startingPointInput.current?.setNativeProps({ text: temp?.display_name })
    }

    function setLocation(data: Data) {
        const { lon: sp_lon, lat: sp_lat } = startingPoint.current
        const { lon: d_lon, lat: d_lat } = destination.current

        if (currentInputIndex === PICKUP_LOC_INDEX) {
            if (data?.lon === d_lon && data?.lat === d_lat) {
                destination.current = startingPoint.current
                destinationInput.current?.setNativeProps({ text: startingPoint.current?.display_name })
            }
            startingPoint.current = data
            startingPointInput.current?.blur()
            startingPointInput.current?.setNativeProps({ text: data.display_name })
        }
        else if (currentInputIndex === DESTINATION_LOC_INDEX) {
            if (data.lon === sp_lon && data.lat === sp_lat) {
                startingPoint.current = destination.current
                startingPointInput.current?.setNativeProps({ text: destination.current?.display_name })
            }
            destination.current = data
            destinationInput.current?.blur()
            destinationInput.current?.setNativeProps({ text: data.display_name })
        }

        ifBothSelected()
    }

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
                        <TextInput
                            ref={(ref) => startingPointInput.current = ref}
                            onFocus={() => {
                                setCurrentInputIndex(PICKUP_LOC_INDEX)
                                bottomBtnGroup.current?.clearBtn?.setDisabled?.(true)
                            }}
                            onBlur={() => bottomBtnGroup.current?.clearBtn?.setDisabled?.(false)}
                            style={flex_1}
                            onChangeText={(text) => onLocationTyped(text, currentInputIndex, refresh)}
                            placeholder='Starting point'
                        />
                    </Pressable>

                    <Pressable
                        style={[flex_row, align_items_center, px_10, getHighlightStyle(currentInputIndex, DESTINATION_LOC_INDEX)]}
                        onPress={() => {
                            setCurrentInputIndex(DESTINATION_LOC_INDEX)
                        }}
                    >
                        <Icon name='location' type='entypo' style={mr_10} color='#118ab2' />
                        <TextInput
                            ref={destinationInput}
                            onFocus={() => {
                                setCurrentInputIndex(DESTINATION_LOC_INDEX)
                                bottomBtnGroup.current?.clearBtn?.setDisabled?.(true)
                            }}
                            onBlur={() => bottomBtnGroup.current?.clearBtn?.setDisabled?.(false)}
                            style={flex_1}
                            onChangeText={(text) => onLocationTyped(text, currentInputIndex, refresh)}
                            placeholder='Destination'
                        />
                    </Pressable>
                </View>
            </View>

            <CurrentLocationItem
                onItemPressed={(data) => {
                    setLocation(data)
                }}
            />

            <ScrollView style={[flex_1, mt_10]} contentContainerStyle={{ paddingBottom: 50 }}>
                <SuggestionItemsFromQuery
                    currentInputIndex={currentInputIndex}
                    onItemPressed={(data) => {
                        setLocation(data)
                    }}
                />
            </ScrollView>

            <ButtomButtonGroup
                ref={bottomBtnGroup}
                onSwitchLocationsPressed={switchLocations}
                onClearTextInputPressed={clearCurrentInput}
                onSubmitRoutePressed={() => {
                    const data = {
                        startingPointData: startingPoint.current,
                        destinationData: destination.current
                    }
                    //route.params?.onRouteSelected(data);
                    DeviceEventEmitter.emit('event.onRouteSelected', data)
                    navigation.goBack()
                }}
            />

        </View>
    )
}

interface ButtomButtonGroupProps {
    onSwitchLocationsPressed?: () => void,
    onClearTextInputPressed?: () => void,
    onSubmitRoutePressed?: () => void
}

const ButtomButtonGroup = React.forwardRef((props: ButtomButtonGroupProps, ref: any) => {
    const [disabled, _setDisabled] = useState(true)
    const [clearBtnVisible, _setClearBtnVisible] = useState(false)

    useEffect(() => {
        if (ref.current) {
            ref.current.submitBtn = {}
            ref.current.clearBtn = {}
            ref.current.submitBtn.setDisabled = setDisabled
            ref.current.clearBtn.setDisabled = setClearBtnVisible
        }
    }, [])


    function setDisabled(value: boolean) {
        _setDisabled(value)
    }

    function setClearBtnVisible(value: boolean) {
        _setClearBtnVisible(value)
    }

    const swapBtnStyles = (clearBtnVisible) ? {} : { borderTopRightRadius: 100, borderBottomRightRadius: 100 }
    const submitBtnStyle = (clearBtnVisible) ? { paddingLeft: 140 } : { paddingLeft: 0 }

    return (
        <View style={[styles.btm_container]}>
            <View style={[flex_row, position_absolute, { zIndex: 1 }]}>
                <Button
                    onPress={props.onSwitchLocationsPressed}
                    onLongPress={() => ToastAndroid.show('Switch starting point and destination', ToastAndroid.SHORT)}
                    color={'#457b9d'}
                    containerStyle={[{ width: 70 }, swapBtnStyles]}
                >
                    <Icon containerStyle={Style.rotate('90deg')} name='swap' color={'white'} type='entypo' />
                </Button>
                {
                    (clearBtnVisible) ?
                        <Button
                            color={'#457b9d'}
                            containerStyle={[{ width: 70, borderTopRightRadius: 100, borderBottomRightRadius: 100 }]}
                            onLongPress={() => ToastAndroid.show('Clear current text input', ToastAndroid.SHORT)}
                            onPress={props.onClearTextInputPressed}
                        >
                            <Icon name='closecircle' type='antdesign' color={'white'} />
                        </Button> : null
                }
            </View>

            <Button
                containerStyle={[flex_1]}
                buttonStyle={submitBtnStyle}
                disabled={disabled}
                disabledStyle={Style.backgroundColor('#ced4da')}
                titleStyle={[fw_bold]}
                color={'#219ebc'}
                title='USE THIS ROUTE'
                onPress={props.onSubmitRoutePressed}
            />
        </View>
    )
})

// ---------------------------------------------
interface SuggestionItems {
    onItemPressed?: (data: Data) => void,
    currentInputIndex: number
}

function SuggestionItemsFromQuery(props: SuggestionItems) {
    let targetList: Data[] = startingPointDataList

    if (props.currentInputIndex === DESTINATION_LOC_INDEX)
        targetList = destinationDataList

    return (
        <>
            {
                targetList.map(data =>
                    <View key={`item-${(Math.random() * 1.1) * 10000}`}>
                        <SuggestionItem.Item
                            onItemPressed={data => props.onItemPressed?.(data)}
                            icon={{ name: 'location-pin', type: 'entypo', color: '#023047', backgroundColor: '#a8dadc' }}
                            backgroundColor={['#edede9', '#edede9']}
                            header={{ content: 'Current location', disabled: true, style: styles.itemHeader }}
                            contentText={{ content: 'text', style: [Style.textColor('#2f3e46')] }}
                            location={data}
                        />
                        <View style={[w_100, Style.height(8)]} />
                    </View>
                )
            }
        </>
    )
}

function getSuggestionsData(searchQuery: string,
    onGetSuccessfully: (list: Data[]) => void,
    onGetFailed?: (error: any) => void) {

    console.log('get sugg')

    LocationService.LocationIQ.autoComplete({ query: searchQuery, limit: 10 },
        (dataList) => {
            console.log('+++++++++++ get sugg: ', dataList)
            onGetSuccessfully(dataList)
        },
        (error) => {
            console.log('get sugg err')
            ToastAndroid.show('Failed to load suggestion', ToastAndroid.SHORT)
            onGetFailed?.(error)
        }
    )
}

// ---------------------------------------------
function getGPSLocation(onGetSuccessfully: (coordinates: LocationService.Coordinates) => void, onGetFailed?: (error: Geolocation.GeoError) => void) {
    Geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude
            const long = position.coords.longitude

            onGetSuccessfully({ latitude: lat, longitude: long })
        },
        error => onGetFailed?.(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    )
}

function resolveGPSAddress(coordinates: LocationService.Coordinates, setLocation: React.Dispatch<React.SetStateAction<Data | undefined>>) {
    let retry = 3
    LocationService.LocationIQ.reverseGeocoding(
        coordinates,
        (data) => {
            setLocation(data)
            console.log('inside.......')
        },
        (error) => {
            ToastAndroid.show('Network error: failed to resolve GPS location into address', ToastAndroid.SHORT)
            if (retry > 0) {
                resolveGPSAddress(coordinates, setLocation)
                retry--
            }
        }
    )
}

function CurrentLocationItem(props: { onItemPressed?: (data: any) => void }) {
    // const [gpsAddress, setGpsAddress] = useState('Loading...')\
    const [location, setLocation] = useState<Data>()
    //const [refresh, setRefresh] = useState(0)

    const gotGPSLocationSuccessfully = useRef(true)

    useEffect(() => {
        getGPSLocation(
            (coordinates) => {
                gotGPSLocationSuccessfully.current = true
                resolveGPSAddress(coordinates, setLocation)
            },
            (error) => {
                gotGPSLocationSuccessfully.current = false
                ToastAndroid.show('Failed to retrieve GPS location', ToastAndroid.SHORT)
            }
        )
    }, [])

    return (
        <>
            {
                (gotGPSLocationSuccessfully) ?
                    <SuggestionItem.Item
                        key={`item-${(Math.random() * 1.1) * 10000}`}
                        onItemPressed={data => props.onItemPressed?.(data)}
                        icon={{ name: 'my-location', type: 'MaterialIcons', color: '#ff006e', backgroundColor: '#ffc8dd' }}
                        backgroundColor={['#845EC2', '#D65DB5', '#FF6F91']}
                        header={{ content: 'Current location', disabled: false, style: styles.itemHeader }}
                        contentText={{ content: 'Loading...', style: [Style.textColor('#edf2f4'), mt_5] }}
                        location={location}
                    /> : null
            }
        </>
    )
}

// ----------------------------------------------

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

        console.log('------------ item location: ', props.location)
        //getCurrentLocation(reload)

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => props.onItemPressed?.(props.location)}
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
                            {
                                (props.header.disabled === false) ?
                                    <Text style={props.header.style}>
                                        {props.header.content}
                                    </Text> : null
                            }
                        </View>
                        <Text style={props.contentText.style}>
                            {
                                (!props.location) ?
                                    props.contentText.content : props.location.display_name
                            }
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    Item.propTypes = {
        contentText: PropTypes.shape({
            style: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.arrayOf(PropTypes.object.isRequired)]),
            content: PropTypes.string.isRequired
        }).isRequired,
        header: PropTypes.shape({
            style: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.arrayOf(PropTypes.object.isRequired)]),
            content: PropTypes.string,
            disabled: PropTypes.bool
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
        }),
        location: PropTypes.object
    }

    interface x {
        s: number
    }

    Item.defaultProps = {
        contentText: {
            style: [Style.textColor('#edf2f4'), mt_5],
            content: 'Loading...'
        },
        header: {
            style: [Style.fontSize(14), fw_500, Style.backgroundColor('#cfbaf0'), border_radius_pill, px_10],
            content: 'Title',
            disabled: false
        },
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
    itemHeader: {
        ...Style.fontSize(14),
        ...fw_500,
        ...Style.backgroundColor('#cfbaf0'),
        ...border_radius_pill,
        ...px_10
    },
    btm_container: {
        ...flex_row,
        ...position_absolute,
        left: 0,
        bottom: 0,
        marginBottom: 5,
        marginHorizontal: 5,
        borderRadius: 100,
        overflow: 'hidden',
    }
})
