import { StyleSheet, View, StatusBar, Text, BackHandler, ScrollView, TouchableNativeFeedback, TextInput, ToastAndroid } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BottomSheet, Button, Icon } from '@rneui/themed'
import { align_items_center, align_self_flex_end, bg_black, bg_danger, bg_primary, bg_transparent, bg_warning, bg_white, flex_1, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, mb_10, mb_5, ml_10, mr_10, mr_15, mr_20, mt_10, mt_20, position_absolute, pt_10, px_10, px_15, py_15, py_20, Style, text_white, w_100 } from '../../../../stylesheets/primary-styles'

export default function MatchingOptions({ route, navigation }) {
    const [minPriceOptionVisible, setMinPriceOptionVisible] = useState(false)
    const [matchRadiusOptionVisible, setMatchRadiusOptionVisible] = useState(false)
    const [maxDeliveryDistanceOptionVisible, setMaxDeliveryDistanceOptionVisible] = useState(false)
    const recMinPrice = useRef(14000)
    const minPrice = useRef<number>(recMinPrice.current)
    const matchRadius = useRef<number>(10)
    const maxDeliveryDistance = useRef(12)

    useEffect(() => {
        StatusBar.setBarStyle('light-content')
        setTimeout(() => StatusBar.setBackgroundColor('#2c6e49'), 200)
    }, [])

    function goBack() {
        navigation.goBack()
        setTimeout(() => {
            StatusBar.setBackgroundColor('transparent')
            StatusBar.setBarStyle('dark-content')
        }, 100)
    }

    return (
        <View style={styles.rootContainer}>
            <View style={styles.rootHeader}>
                <Icon onPress={goBack} containerStyle={styles.rootHeaderIcon} name='chevron-back' type='ionicon' color={'white'} />
                <View style={styles.rootHeaderText}>
                    <Text style={[fs_large, fw_bold, text_white]}>Matching Options</Text>
                </View>
            </View>

            <ScrollView style={[flex_1, pt_10]}>

                <TouchableNativeFeedback
                    onPress={() => ToastAndroid.show('Only support Vietnamese region', ToastAndroid.SHORT)}
                >
                    <View style={[flex_row, px_15, py_15, mb_5]}>
                        <Icon style={mr_15} name='globe' type='entypo' color={'#023e8a'} />
                        <Text style={[fs_semi_large, flex_1, Style.textColor('#343a40')]} >Region</Text>
                        <Text style={[fs_semi_large]} >Vietnam</Text>
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback
                    onPress={() => setMinPriceOptionVisible(true)}
                >
                    <View style={[flex_row, px_15, py_15]}>
                        <Icon style={{ marginRight: 12 }} name='money' type='font-awesome' color={'#ca6702'} />
                        <Text style={[fs_semi_large, flex_1, Style.textColor('#343a40')]} >Minimum price per kilometer (vnd)</Text>
                        <Text style={[fs_semi_large]} >{minPrice.current}</Text>
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback
                    onPress={() => setMatchRadiusOptionVisible(true)}
                >
                    <View style={[flex_row, px_15, py_15]}>
                        <Icon style={mr_15} name='globe' type='entypo' color={'#3c6e71'} />
                        <Text style={[fs_semi_large, flex_1, Style.textColor('#343a40')]} >Matching radius (km)</Text>
                        <Text style={[fs_semi_large]} >{matchRadius.current}</Text>
                    </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback
                    onPress={() => setMaxDeliveryDistanceOptionVisible(true)}
                >
                    <View style={[flex_row, px_15, py_15]}>
                        <Icon style={mr_15} name='map-marker-distance' type='material-community' color={'#ef476f'} />
                        <Text style={[fs_semi_large, flex_1, Style.textColor('#343a40')]} >Maximum delivery distance (km)</Text>
                        <Text style={[fs_semi_large]} >{maxDeliveryDistance.current}</Text>
                    </View>
                </TouchableNativeFeedback>

            </ScrollView>

            <MinimumPriceOption
                isVisibleState={minPriceOptionVisible}
                setVisibleState={setMinPriceOptionVisible}
                recMinPrice={recMinPrice}
                minPrice={minPrice}
            />

            <MatchingRadiusOption
                isVisibleState={matchRadiusOptionVisible}
                setVisibleState={setMatchRadiusOptionVisible}
                matchRadius={matchRadius}
            />

            <MaxDeliveryDistanceOption
                isVisibleState={maxDeliveryDistanceOptionVisible}
                setVisibleState={setMaxDeliveryDistanceOptionVisible}
                maxDistance={maxDeliveryDistance}
            />
        </View>
    )
}

// ----------------------------------------------
interface OptionProps {
    isVisibleState: boolean
    setVisibleState: React.Dispatch<React.SetStateAction<boolean>>
}

// ----------------------------------------------
type MinimumPriceOptionProps = OptionProps & {
    recMinPrice: React.MutableRefObject<number>,
    minPrice: React.MutableRefObject<number>
}

function MinimumPriceOption(props: MinimumPriceOptionProps) {
    const minPrice = useRef(props.recMinPrice.current)

    function closeAndSave() {
        props.minPrice.current = minPrice.current
        props.setVisibleState(false)
    }

    return (
        <BottomSheet onBackdropPress={() => props.setVisibleState(false)} modalProps={{}} isVisible={props.isVisibleState}>
            <View style={styles.btmSheet}>
                <Text style={[fs_semi_large, fw_bold, Style.textColor('#343a40')]} >Recommended price per kilometer:</Text>
                <Text style={[fs_semi_large, fw_bold, Style.textColor('#38a3a5')]} >{props.recMinPrice.current}</Text>
                <View style={[styles.inputWrapper, mt_20]}>
                    <TextInput
                        style={styles.input}
                        defaultValue={`${props.minPrice.current}`}
                        placeholder='Minimum price per km'
                        onChangeText={(text) => minPrice.current = parseInt(text)}
                        onSubmitEditing={closeAndSave}
                        keyboardType='number-pad'
                    />
                </View>
                <Button onPress={closeAndSave} title={'SET'} containerStyle={[styles.buttonWrapper, mt_20]} color='#38a3a5' />
            </View>
        </BottomSheet>
    )
}

// ----------------------------------------------
type MatchingRadiusOptionProps = OptionProps & {
    matchRadius: React.MutableRefObject<number>
}

function MatchingRadiusOption(props: MatchingRadiusOptionProps) {
    const matchRadius = useRef(props.matchRadius.current)

    function closeAndSave() {
        props.matchRadius.current = matchRadius.current
        props.setVisibleState(false)
    }

    return (
        <BottomSheet onBackdropPress={() => props.setVisibleState(false)} modalProps={{}} isVisible={props.isVisibleState}>
            <View style={styles.btmSheet}>
                <Text style={[fs_semi_large, fw_bold, Style.textColor('#343a40')]} >Maximum matching distance from you to the sender (calculated in kilometer)</Text>
                <View style={[styles.inputWrapper, mt_20]}>
                    <TextInput
                        style={styles.input}
                        defaultValue={`${props.matchRadius.current}`}
                        placeholder='Minimum price per km'
                        onChangeText={(text) => matchRadius.current = parseInt(text)}
                        onSubmitEditing={closeAndSave}
                        keyboardType='number-pad'
                    />
                </View>
                <Button onPress={closeAndSave} title={'SET'} containerStyle={[styles.buttonWrapper, mt_20]} color='#38a3a5' />
            </View>
        </BottomSheet>
    )
}

// ----------------------------------------------

type MaxDeliveryDistanceOptionProps = OptionProps & {
    maxDistance: React.MutableRefObject<number>
}

function MaxDeliveryDistanceOption(props: MaxDeliveryDistanceOptionProps) {
    const maxDistance = useRef(props.maxDistance.current)

    function closeAndSave() {
        props.maxDistance.current = maxDistance.current
        props.setVisibleState(false)
    }

    return (
        <BottomSheet onBackdropPress={() => props.setVisibleState(false)} modalProps={{}} isVisible={props.isVisibleState}>
            <View style={styles.btmSheet}>
                <Text style={[fs_semi_large, fw_bold, Style.textColor('#343a40')]} >Maximum delivery distance from the sender to the recipient (calculated in kilometer)</Text>
                <View style={[styles.inputWrapper, mt_20]}>
                    <TextInput
                        style={styles.input}
                        defaultValue={`${props.maxDistance.current}`}
                        placeholder='Minimum price per km'
                        onChangeText={(text) => maxDistance.current = parseInt(text)}
                        onSubmitEditing={closeAndSave}
                        keyboardType='number-pad'
                    />
                </View>
                <Button onPress={closeAndSave} title={'SET'} containerStyle={[styles.buttonWrapper, mt_20]} color='#38a3a5' />
            </View>
        </BottomSheet>
    )
}

// ----------------------------------------------

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#daeaea'
    },

    rootHeader: {
        flexDirection: 'row',
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#4c956c'
    },

    rootHeaderIcon: {
        position: 'absolute',
        top: StatusBar.currentHeight,
        left: 5,
        padding: 10
    },

    rootHeaderText: {
        ...w_100,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,
    },

    btmSheet: {
        ...bg_white,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },

    input: {
        borderBottomColor: '#40916c',
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5
    },

    buttonWrapper: {
        borderRadius: 10
    },

    inputWrapper: {
        backgroundColor: '#dee2e6',
        borderRadius: 10,
        overflow: 'hidden'
    }

})