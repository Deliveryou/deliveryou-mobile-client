import { Avatar, BottomSheet, Button, CheckBox, Dialog, Icon, ListItem, TabView, Text } from '@rneui/themed'
import { View, DeviceEventEmitter, BackHandler, Image, TextInput, TextInputProps, Dimensions, StyleSheet, StatusBar, Animated, TouchableNativeFeedback, TouchableOpacity, Pressable, ToastAndroid, Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { align_items_center, align_self_center, align_self_flex_start, bg_danger, bg_dark, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_0, border_radius_1, border_radius_4, border_radius_pill, clr_primary, flex_1, flex_column, flex_row, fs_large, fs_normal, fs_semi_large, fw_500, fw_600, fw_bold, h_100, justify_center, mb_10, mb_20, mb_25, mb_5, ml_10, mr_10, mr_5, mt_0, mt_10, mt_20, mt_25, mt_5, mx_10, my_10, my_20, m_10, m_15, m_20, overflow_hidden, pb_10, pb_25, pl_10, pl_20, position_absolute, position_center, pt_15, pt_20, pt_25, px_10, px_15, px_20, py_10, py_15, py_20, p_10, p_20, Style, text_white, w_100, w_75 } from '../../../../stylesheets/primary-styles'
import { LocationSelector } from './HomeTab'
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { LocationService } from '../../../../services/LocationService'
import { ObtainKeys } from '../../../../utils/ultilities'
import ItemType, { ItemTypeDetails } from '../../../../entities/ItemType'
import { Global } from '../../../../Global'
import { GraphQLService } from '../../../../services/GraphQLService'
import User from '../../../../entities/User'
import { CameraService } from '../../../../services/CameraService'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { CameraDevice } from 'react-native-vision-camera/lib/typescript/CameraDevice'
import Validator from '../../../../utils/Validator'
import { ImageUploadService } from '../../../../services/ImageUploadService'
import { DeliveryService } from '../../../../services/DeliveryService'

const BOX_SHADOW_COLOR = '#6c757d26'

// --------------------------------------------------
interface AddDeliveryDetailsProps {
    // refreshHomeLocationSelector?: () => void
}

type Promotion = GraphQLService.Type.Promotion
const PICKUP_TYPES = ['Pick up right now', 'Pick up within 6 hours']

export default function AddDeliveryDetails({ route, navigation }, props: AddDeliveryDetailsProps) {
    //StatusBar.setBackgroundColor('')
    const locationSelectorRef = useRef({})
    const [tabIndex, setTabIndex] = useState(0);
    const distance = useRef(5)
    const pickupTypePrices = useRef<number[]>([50000, 30000])
    const currentItemTypeDetails = useRef(ItemType.Food)
    const senderInfo = useRef({} as PersonInfo)
    const recipientInfo = useRef({ name: '', phone: '', address: '' } as PersonInfo)
    const note = useRef<string>('')
    const [_refresh, setRefresh] = useState(0)
    const photoUri = useRef<string | undefined>(undefined)
    const promotion = useRef<Promotion>()
    const price = useRef<DeliveryService.User.AdvisorResponse>({ distance: 0, price: 0 })
    const [loadingDialogVisible, setLoadingDialogVisible] = useState(true)
    const loadingDialogContent = useRef('')

    const refresh = () => setRefresh(value => value + 1)

    useEffect(() => {
        DeviceEventEmitter.addListener(
            'event.AddDeliveryDetails.onPhotoChosen',
            (uri: string) => {
                photoUri.current = uri
                refresh()
            }
        )

    }, [])


    function setSenderInfo(user: User) {
        senderInfo.current = {
            name: user.firstName + ' ' + user.lastName,
            phone: user.phone,
            address: ''
        }
        reloadAddresses()
    }

    function reloadAddresses() {
        const s_addr = (route.params.startingPointRef.current as LocationService.LocationIQ.Response.Data).display_name
        senderInfo.current.address = s_addr
        const r_addr = (route.params.destinationRef.current as LocationService.LocationIQ.Response.Data).display_name
        recipientInfo.current.address = r_addr
        refresh()
    }

    function findDriver() {
        validatePersonInfo(senderInfo.current, 'Sender')
            .then(() => {
                validatePersonInfo(recipientInfo.current, 'Recipient')
                    .then(() => {
                        if (photoUri.current) {
                            //console.log('---------- uri: ', photoUri.current)
                            ImageUploadService.upload(photoUri.current, {
                                onUploadBegan: () => {
                                    loadingDialogContent.current = 'Uploading your photo'
                                    setLoadingDialogVisible(true)
                                },
                                onUploaded: (url) => {
                                    console.log('------- upload url: ', url)
                                    setLoadingDialogVisible(false)
                                    loadingDialogContent.current = ''
                                },
                                onUploadFailure: () => ToastAndroid.show('Failed to upload your photo', ToastAndroid.LONG)
                            })
                            // main
                            console.log('--- post: ', {
                                senderInfo,
                                recipientInfo,
                                note,
                                itemType: currentItemTypeDetails.current.name
                            })
                        } else
                            ToastAndroid.show('Product photo is required', ToastAndroid.LONG)
                    })
            })
            .catch(error => ToastAndroid.show('Error occured while validating your info', ToastAndroid.SHORT))
    }

    function removePhoto() {
        photoUri.current = undefined
        refresh()
    }



    useEffect(() => {
        locationSelectorRef.current?.refresh?.()
        BackHandler.addEventListener('hardwareBackPress', () => {
            goBack()
            return true
        })
        StatusBar.setBarStyle('light-content')
        // -------------------
        GraphQLService.getCurrentUserInfo(
            Global.User.CurrentUser.id,
            setSenderInfo,
            (error) => ToastAndroid.show('Error occured while getting sender info!\nTry again!', ToastAndroid.SHORT)
        )
        // -------------------
        type Data = LocationService.LocationIQ.Response.Data
        const sp: LocationService.Coordinates = {
            latitude: Number((route.params.startingPointRef.current as Data).lat),
            longitude: Number((route.params.startingPointRef.current as Data).lon)
        }
        const d: LocationService.Coordinates = {
            latitude: Number((route.params.destinationRef.current as Data).lat),
            longitude: Number((route.params.destinationRef.current as Data).lon)
        }
        DeliveryService.User.advisorPrice(sp, d,
            (data => {
                price.current = data
                refresh()
            }),
            (error) => {
                Alert.alert('Crtitical error', "Cannot load your delivery price", [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ])
            }
        )
    }, [])
    // 
    function goBack() {
        DeviceEventEmitter.emit('event.homeLocationSelectorRefresh')
        navigation.goBack()
    }

    return (
        <View style={styles.rootContainer}>
            <View style={[styles.rootHeader]}>
                <Icon
                    onPress={goBack}
                    containerStyle={styles.rootHeaderIcon}
                    size={32}
                    name='chevron-small-left'
                    type='entypo'
                    color='white'
                />
                <View style={[flex_1, align_items_center, justify_center]}>
                    <Text style={[{ fontSize: 18, fontFamily: Style.fonts.Raleway.SemiBold }, text_white]}>
                        Delivery Details
                    </Text>
                </View>
            </View>

            <TabView disableSwipe={true} value={tabIndex} onChange={setTabIndex} animationType="spring">
                <TabView.Item style={{ width: '100%' }}>
                    <Tab1
                        locationSelectorRef={locationSelectorRef}
                        navigation={navigation}
                        route={route}
                        distance={distance}
                        prices={pickupTypePrices}
                        promotion={promotion}
                        deliveryPrice={price}
                    />
                </TabView.Item>
                <TabView.Item style={{ width: '100%' }}>
                    <Tab2
                        removePhoto={removePhoto}
                        photoUri={photoUri}
                        navigation={navigation}
                        route={route}
                        note={note}
                        senderInfo={senderInfo.current}
                        recipientInfo={recipientInfo.current}
                        currentItemTypeDetails={currentItemTypeDetails}
                    />
                </TabView.Item>
            </TabView>

            <View style={[flex_row, position_absolute, overflow_hidden, { bottom: 0, borderRadius: 10, backgroundColor: '#028090' }, m_10]}>
                {
                    (tabIndex === 0) ?
                        <Button color={'#028090'} containerStyle={flex_1} buttonStyle={[border_radius_0, Style.height(40)]} title='NEXT'
                            onPress={() => {
                                setTabIndex(current => current + 1)
                                reloadAddresses()
                            }}
                        />
                        : null
                }
                {
                    (tabIndex === 1) ?
                        <>
                            <Button color={'#028090'} containerStyle={flex_1} buttonStyle={[border_radius_0, Style.height(40)]} title='PREVIOUS'
                                onPress={() => {
                                    setTabIndex(current => current - 1)
                                }}
                            />
                            <Button color={'#8338ec'} containerStyle={flex_1} buttonStyle={[border_radius_0, Style.height(40)]} title='FIND DRIVER'
                                onPress={findDriver}
                            />
                        </>
                        : null
                }

            </View>

            <Dialog overlayStyle={styles.loadingDialog} isVisible={loadingDialogVisible} onBackdropPress={() => setLoadingDialogVisible(false)}>
                <Dialog.Loading />
                <Text style={Style.textColor('#6c757d')}>{loadingDialogContent.current}</Text>
            </Dialog>
        </View >
    )
}

// --------------------------------------------
async function validatePersonInfo(personInfo: PersonInfo, personRole: 'Sender' | 'Recipient') {
    personInfo.name = personInfo.name.trim().replace(/\s+/, ' ')
    personInfo.address = personInfo.address.trim().replace(/\s+/, ' ')
    personInfo.phone = personInfo.phone.trim()

    if (personInfo.name === '') {
        ToastAndroid.show(`${personRole}'s name is invalid`, ToastAndroid.LONG)
        return false
    }

    if (personInfo.address.length < 25) {
        ToastAndroid.show(`${personRole}'s address is invalid`, ToastAndroid.LONG)
        return false
    }

    if (!Validator.TYPE.PHONE.VN.test(personInfo.phone)) {
        ToastAndroid.show(`${personRole}'s phone number is invalid`, ToastAndroid.LONG)
        return false
    }
    return true
}

// --------------------------------------------
type Tab1Props = DeliveryTypeSelectorProps & {
    locationSelectorRef: any,
    navigation: any,
    route: any,
    promotion: React.MutableRefObject<GraphQLService.Type.Promotion | undefined>,
    deliveryPrice: React.MutableRefObject<DeliveryService.User.AdvisorResponse>
}

function Tab1(props: Tab1Props) {
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    function openOfferScreen() {
        props.navigation.navigate('OfferScreen', {
            parentStatusBarColor: 'transparent',
            parentStatusBarStyle: 'light-content'
        })
    }

    function removePromo() {
        props.promotion.current = undefined
        refresh()
    }

    useEffect(() => {
        DeviceEventEmitter.addListener('event.AddDeliveryDetails.Tab1.onPromotionUsed',
            (promotion: Promotion) => {
                props.promotion.current = promotion
                refresh()
            })
    }, [])

    const deliveryPrice = Math.floor(props.deliveryPrice.current.price)
    const discount: number = (props.promotion.current) ? props.promotion.current.discountPercentage : 0
    let promoPrice = Math.floor(discount * deliveryPrice)
    const maxDiscount: number = (props.promotion.current) ? props.promotion.current.maximumDiscountAmount : Number.MAX_VALUE
    promoPrice = (promoPrice > maxDiscount) ? maxDiscount : promoPrice

    return (
        <ScrollView
            style={[styles.rootScrollView, px_15]}
        >
            <Shadow
                containerStyle={[my_10, align_self_center]}
                distance={10}
                startColor={BOX_SHADOW_COLOR}
            >
                <LocationSelector
                    ref={props.locationSelectorRef}
                    style={styles.locationSelector}
                    navigation={props.navigation}
                    route={props.route}
                    startingPoint={props.route.params.startingPointRef}
                    destination={props.route.params.destinationRef}
                    disablePressable={true}
                />
            </Shadow>

            {/* <DeliveryTypeSelector
                distance={props.distance}
                prices={props.prices}
                navigation={props.navigation}
                route={props.route}
            /> */}

            <Text style={[styles.boldText, mb_10, mt_20]}>Apply Offers</Text>

            {
                (props.promotion.current === undefined) ?
                    <Shadow containerStyle={[align_self_center, mb_20]} distance={10} startColor={BOX_SHADOW_COLOR}>
                        <TouchableOpacity activeOpacity={0.6} style={{ borderRadius: 10 }} onPress={openOfferScreen}>
                            <ListItem containerStyle={[bg_transparent, styles._90ScreenWidth]}>
                                <Icon style={[Style.backgroundColor('#e0afa0'), border_radius_pill, Style.padding(2)]} name="tags" type="antdesign" color="#bb3e03" />
                                <ListItem.Content style={{ flexGrow: 1 }}>
                                    <ListItem.Title>Use offers to get discounts</ListItem.Title>
                                </ListItem.Content>
                                <ListItem.Chevron color='#463f3a' size={22} />
                            </ListItem>
                        </TouchableOpacity>
                    </Shadow>
                    :
                    <Shadow containerStyle={[align_self_center, mb_20]} distance={10} startColor={BOX_SHADOW_COLOR}>
                        <TouchableOpacity activeOpacity={0.6} style={{ borderRadius: 10 }}>
                            <ListItem containerStyle={[bg_transparent, styles._90ScreenWidth]}>
                                <Icon style={[border_radius_pill, Style.padding(2)]} name="ticket-percent" type="material-community" color="#43aa8b" />
                                <ListItem.Content style={{ flexGrow: 1 }}>
                                    <ListItem.Title style={fw_bold}>{props.promotion.current?.promoCode}</ListItem.Title>
                                </ListItem.Content>
                                <TouchableNativeFeedback onPress={removePromo}>
                                    <View style={bg_white}>
                                        <Icon style={m_10} name='delete' type='material-icon' color={'#bc4b51'} />
                                    </View>
                                </TouchableNativeFeedback>
                            </ListItem>
                        </TouchableOpacity>
                    </Shadow>

            }

            <Text style={[styles.boldText, mb_10, mt_20]}>Delivery Price</Text>

            <Shadow containerStyle={[align_self_center, mb_20]} distance={10} startColor={BOX_SHADOW_COLOR}>
                <View style={[styles._90ScreenWidth, p_20, Style.borderRadius(10)]}>
                    <View style={[flex_row, Style.borderRadius(10)]}>
                        <Text style={{ flexGrow: 1 }}>Distance:</Text>
                        <View style={flex_row}>
                            <Text style={[fw_bold, Style.textColor('#393d3f')]}>{(props.deliveryPrice.current.distance / 1000).toFixed(1)}</Text>
                            <Text> KM</Text>
                        </View>
                    </View>
                    <View style={[flex_row, Style.borderRadius(10), mt_5]}>
                        <Text style={{ flexGrow: 1 }}>Delivery price:</Text>
                        <View style={flex_row}>
                            <Text style={[fw_bold, Style.textColor('#393d3f')]}>{deliveryPrice}</Text>
                            <Text> VND</Text>
                        </View>
                    </View>
                    {
                        (props.promotion.current) ?
                            <View style={[flex_row, Style.borderRadius(10), mt_5]}>
                                <Text style={{ flexGrow: 1 }}>Promotion:</Text>
                                <View style={flex_row}>
                                    <Text style={[fw_bold, Style.textColor('#40916c')]}>-{promoPrice}</Text>
                                    <Text> VND</Text>
                                </View>
                            </View>
                            : null
                    }
                    <View style={[w_100, Style.height(1), Style.backgroundColor('#bfc0c0'), mt_10]} />

                    <View style={[flex_row, Style.borderRadius(10), mt_5]}>
                        <Text style={{ flexGrow: 1 }}>Total:</Text>
                        <View style={flex_row}>
                            <Text style={[fw_bold, Style.textColor('#0077b6'), Style.fontSize(15)]}>{deliveryPrice - promoPrice}</Text>
                            <Text> VND</Text>
                        </View>
                    </View>
                </View>
            </Shadow>

        </ScrollView>
    )
}

// --------------------------------------------
function formatCurrencyString(value: number | string) {
    let _s = ''
    if (typeof value === "number")
        _s = `${value}`
    else if (typeof value === "string") {
        if (isNaN(parseInt(value)))
            _s = '0'
        else
            _s = `${parseInt(value)}`
    }

    let totalChar = _s.length
    let result = ''

    for (let char of _s) {
        result += char
        totalChar--
        if (totalChar > 0 && totalChar % 3 === 0)
            result += ' '
    }

    return result
}

// class PickupOption {
//     private _price: string
//     private _distance: number

//     get price() { return this._price }
//     get distance() { return this._distance }

//     set price(value: string | number) {
//         this._price = formatCurrencyString(value)
//     }
//     set distance(value: number) {
//         this._distance = value
//     }

//     constructor(price: string | number, distance: number) {
//         this._price = formatCurrencyString(price)
//         this._distance = distance
//     }
// }

interface DeliveryTypeSelectorProps {
    route: any,
    navigation: any,
    distance: React.MutableRefObject<number>,
    prices: React.MutableRefObject<number[]>
}

function DeliveryTypeSelector(props: DeliveryTypeSelectorProps) {
    const [expanded, setExpanded] = useState(false);
    const [pickupIndex, setPickupIndex] = useState(0);

    return (
        <>
            <Text style={[styles.boldText, mb_10, mt_10]}>Pickup Type</Text>
            <Shadow containerStyle={align_self_center} distance={10} startColor={BOX_SHADOW_COLOR}>
                <ListItem.Accordion
                    containerStyle={[styles._90ScreenWidth, { borderRadius: 10 }]}
                    style={{ borderRadius: 10 }}
                    content={
                        <ListItem.Content>
                            <ListItem.Title style={[fw_bold, Style.textColor('#4a4e69')]}>
                                {
                                    PICKUP_TYPES[pickupIndex]
                                }
                            </ListItem.Title>
                            <ListItem.Subtitle>
                                <Text style={Style.textColor('#735d78')}>
                                    {`${props.distance.current}km`}
                                </Text>
                                <Text style={[fw_bold, fs_semi_large, Style.textColor('#735d78')]}> • </Text>
                                <Text style={[fw_bold, Style.textColor('#8338ec')]}>
                                    {
                                        formatCurrencyString(props.prices.current[pickupIndex])
                                    }
                                </Text>
                            </ListItem.Subtitle>
                        </ListItem.Content>
                    }
                    isExpanded={expanded}
                    onPress={() => {
                        setExpanded(!expanded);
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => setPickupIndex(0)}
                    >
                        <ListItem>
                            <Avatar
                                rounded
                                source={{
                                    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                                }}
                            />
                            <ListItem.Content>
                                <ListItem.Title style={[fw_bold, Style.textColor('#4a4e69')]}>{PICKUP_TYPES[0]}</ListItem.Title>
                                <ListItem.Subtitle>{formatCurrencyString(props.prices.current[0])}</ListItem.Subtitle>
                            </ListItem.Content>
                            <CheckBox
                                checked={pickupIndex === 0}
                                onPress={() => setPickupIndex(0)}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checkedColor='#8338ec'
                            />
                        </ListItem>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => setPickupIndex(1)}
                    >
                        <ListItem>
                            <Avatar
                                rounded
                                source={{
                                    uri: 'https://randomuser.me/api/portraits/men/32.jpg',
                                }}
                            />
                            <ListItem.Content>
                                <ListItem.Title style={[fw_bold, Style.textColor('#4a4e69')]}>{PICKUP_TYPES[1]}</ListItem.Title>
                                <ListItem.Subtitle>{formatCurrencyString(props.prices.current[1])}</ListItem.Subtitle>
                            </ListItem.Content>
                            <CheckBox
                                checked={pickupIndex === 1}
                                onPress={() => setPickupIndex(1)}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checkedColor='#8338ec'
                            />
                        </ListItem>
                    </TouchableOpacity>

                </ListItem.Accordion>
            </Shadow>
        </>
    )
}

// --------------------------------------------
interface Tab2Props {
    senderInfo: PersonInfo,
    recipientInfo: PersonInfo,
    currentItemTypeDetails: React.MutableRefObject<ItemTypeDetails>,
    note: React.MutableRefObject<string>,
    navigation: object,
    route: object,
    photoUri: React.MutableRefObject<string | undefined>,
    removePhoto?: () => void
}

interface PersonInfo {
    name: string,
    phone: string,
    address: string
}

function Tab2(props: Tab2Props) {
    const [senderExpanded, setSenderExpanded] = useState(false);
    const [recipientExpanded, setRecipientExpanded] = useState(true);
    const { senderInfo, recipientInfo, note } = props
    const photoUri = props.photoUri.current
    const [_refresh, setRefresh] = useState(0)
    const currentItemTypeDetails = props.currentItemTypeDetails
    // camera


    const refresh = () => setRefresh(value => value + 1)

    async function launchCamera() {
        CameraService.requestPermission(
            async () => {
                props.navigation.navigate('CameraScreen')
            },
            async () => ToastAndroid.show('Requires camera permission to take photos', ToastAndroid.LONG)
        )
    }

    return (
        <>
            <ScrollView style={flex_1} contentContainerStyle={{ paddingBottom: 60 }}>
                <ListItem.Accordion
                    content={
                        <ListItem.Content>
                            <View style={[flex_row, align_items_center]}>
                                <Icon name='vinyl' type='entypo' color={'#0081a7'} />
                                <Text style={[styles.tab2_title, ml_10]}>Sender</Text>
                            </View>
                            {
                                (!senderExpanded) ?
                                    <View style={mt_10}>
                                        <Text style={[styles.tab2_subtitle, mb_5]}>{senderInfo.name}</Text>
                                        <Text style={[styles.tab2_subtitle, mb_5]}>{senderInfo.phone}</Text>
                                        <Text style={styles.tab2_subtitle}>{senderInfo.address}</Text>
                                    </View> : null
                            }
                        </ListItem.Content>
                    }
                    isExpanded={senderExpanded}
                    onPress={() => {
                        setSenderExpanded(!senderExpanded);
                        //refresh()
                    }}
                >
                    <SenderInfo
                        senderInfo={senderInfo}
                    //onInfoChanged={(info) => refresh()}
                    />
                </ListItem.Accordion>

                <ListItem.Accordion
                    content={
                        <ListItem.Content>
                            <View style={[flex_row, align_items_center]}>
                                <Icon name='location-pin' type='entypo' color={'#ff686b'} size={30} />
                                <Text style={[styles.tab2_title, { marginLeft: 4 }]}>Recipient</Text>
                            </View>
                        </ListItem.Content>
                    }
                    isExpanded={recipientExpanded}
                    onPress={() => {
                        setRecipientExpanded(!recipientExpanded);
                    }}
                >
                    <Recipient
                        note={note}
                        recipientInfo={recipientInfo}
                        currentItemTypeDetails={currentItemTypeDetails}
                    />
                </ListItem.Accordion>

                <View style={[m_15, mt_25]}>
                    <View style={[flex_row, align_items_center]}>
                        <Icon name='photo' type='material-icon' color={'#02c39a'} size={25} />
                        <Text style={[styles.tab2_title, { marginLeft: 12 }]}>Product photo</Text>
                    </View>
                    <View style={[flex_row, pl_10]}>
                        <Text style={[Style.textColor("#a4133c"), fs_semi_large, fw_bold, mr_5]}>*</Text>
                        <Text style={Style.textColor('#6c757d')}>Required to verify your products</Text>
                    </View>
                    {
                        (!photoUri) ?
                            <TouchableNativeFeedback onPress={launchCamera}>
                                <View style={[Style.backgroundColor('#dee2e6'), w_100, mt_10, px_10, py_15, Style.borderRadius(10)]}>
                                    <Icon name='photo-camera' type='material-icon' color={'#3c096c'} />
                                </View>
                            </TouchableNativeFeedback>
                            :
                            <View>
                                <Button
                                    containerStyle={[mt_10, Style.borderRadius(10)]}
                                    title={'Remove This Photo'}
                                    onPress={props.removePhoto}
                                />
                                <Image
                                    source={{ uri: photoUri }}
                                    style={[w_100, Style.borderRadius(10), mt_10, { aspectRatio: Dimensions.get('screen').width / Dimensions.get('screen').height }]}

                                />
                            </View>
                    }
                </View>

            </ScrollView>
        </>
    )
}

// --------------------------------------------

// --------------------------------------------
interface SenderInfoProps {
    senderInfo: PersonInfo
}

function SenderInfo(props: SenderInfoProps) {
    const senderRef_phone = useRef()
    const senderRef_address = useRef()
    const senderInfo = props.senderInfo

    console.log('rerendered')

    return (
        <View style={px_15}>
            <View style={[flex_row]}>
                <TextInput
                    defaultValue={senderInfo.name}
                    style={styles.textInput}
                    placeholder='Full name'
                    textContentType='name'
                    returnKeyType='next'
                    onSubmitEditing={() => senderRef_phone.current?.focus()}
                    onChangeText={(text) => senderInfo.name = text}
                />
                <Icon style={styles.textInputIcon} color='#495057' name='pencil' type='entypo' size={18} />
            </View>
            <View style={[flex_row]}>
                <TextInput
                    ref={senderRef_phone}
                    style={styles.textInput}
                    defaultValue={senderInfo.phone}
                    placeholder='Phone'
                    textContentType='telephoneNumber'
                    returnKeyType='next'
                    onSubmitEditing={() => senderRef_address.current?.focus()}
                    onChangeText={(text) => senderInfo.phone = text}
                />
                <Icon style={styles.textInputIcon} color='#495057' name='pencil' type='entypo' size={18} />
            </View>
            <View style={[flex_row]}>
                <TextInput
                    ref={senderRef_address}
                    style={styles.textInput}
                    defaultValue={senderInfo.address}
                    placeholder="Sender's address"
                    textContentType='fullStreetAddress'
                    onChangeText={(text) => senderInfo.address = text}
                />
                <Icon style={styles.textInputIcon} color='#495057' name='pencil' type='entypo' size={18} />
            </View>
        </View>
    )
}

// --------------------------------------------
interface RecipientProps {
    onItemTypePressed?: (itemTypeDetails: ItemTypeDetails) => void,
    currentItemTypeDetails: React.MutableRefObject<ItemTypeDetails>,
    recipientInfo: PersonInfo,
    note: React.MutableRefObject<string>
}

function Recipient(props: RecipientProps) {
    const [btmSheetExpanded, setBtmSheetExpanded] = useState(false)
    const currentItemTypeDetails = props.currentItemTypeDetails
    const recipientInfo = props.recipientInfo
    const note = props.note
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    return (
        <View style={px_15}>
            <View style={flex_row}>
                <TextInput
                    //ref={senderRef_address}
                    style={styles.textInput}
                    placeholder='Full name'
                    textContentType='fullStreetAddress'
                    onChangeText={(text) => recipientInfo.name = text}
                />
            </View>
            <View style={flex_row}>
                <TextInput
                    //ref={senderRef_address}
                    style={styles.textInput}
                    placeholder='Phone number'
                    keyboardType='number-pad'
                    textContentType='fullStreetAddress'
                    onChangeText={(text) => recipientInfo.phone = text}
                />
            </View>
            <View style={flex_row}>
                <TextInput
                    //ref={senderRef_address}
                    style={styles.textInput}
                    defaultValue={recipientInfo.address}
                    placeholder='Address'
                    textContentType='fullStreetAddress'
                />
            </View>
            <View style={[flex_row, mt_20]}>
                <Icon style={{ marginTop: 11.5 }} name='view-headline' type='MaterialIcons' color={'#495057'} />
                <TextInput
                    style={{ marginLeft: 5, fontSize: 15, flex: 1, paddingHorizontal: 15, backgroundColor: '#dee2e6', borderRadius: 10 }}
                    multiline
                    placeholder='Add a note to driver'
                    onChangeText={(text) => note.current = text}
                />
            </View>
            <View style={[flex_row, mt_10]}>
                <Icon style={{ marginTop: 11.5 }} name={currentItemTypeDetails.current.iconName} type={currentItemTypeDetails.current.iconType} color={'#495057'} size={20} />
                <TouchableOpacity
                    activeOpacity={0.6}
                    style={[{ backgroundColor: '#dee2e6', borderRadius: 10, paddingVertical: 14 }, flex_1, flex_row, px_10, ml_10]}
                    onPress={() => setBtmSheetExpanded(true)}
                >
                    <Text style={[fw_bold, Style.textColor('#'), mr_10]}>Item Type:</Text>
                    <Text>{currentItemTypeDetails.current.name}</Text>
                </TouchableOpacity>
            </View>


            <BottomSheet modalProps={{}} isVisible={btmSheetExpanded} onBackdropPress={() => setBtmSheetExpanded(false)}>
                <View style={[bg_white, py_15, px_15, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}>
                    <Text style={[fw_bold, fs_large, Style.textColor('#343a40')]}>Type Of Item</Text>

                    <TouchableNativeFeedback
                        onPress={() => {
                            currentItemTypeDetails.current = ItemType.Food
                            setBtmSheetExpanded(false)
                        }}
                    >
                        <View style={[align_items_center, flex_row, py_10, px_10, mt_10]}>
                            <Icon name={ItemType.Food.iconName} type={ItemType.Food.iconType} color={'#343a40'} />
                            <Text style={[fs_semi_large, ml_10, Style.textColor('#343a40')]}>Food</Text>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback
                        onPress={() => {
                            currentItemTypeDetails.current = ItemType.Clothing
                            setBtmSheetExpanded(false)
                        }}
                    >
                        <View style={[align_items_center, flex_row, py_10, px_10]}>
                            <Icon name={ItemType.Clothing.iconName} type={ItemType.Clothing.iconType} color={'#343a40'} />
                            <Text style={[fs_semi_large, ml_10, Style.textColor('#343a40')]}>Clothing</Text>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback
                        onPress={() => {
                            currentItemTypeDetails.current = ItemType.Electronics
                            setBtmSheetExpanded(false)
                        }}
                    >
                        <View style={[align_items_center, flex_row, py_10, px_10]}>
                            <Icon name={ItemType.Electronics.iconName} type={ItemType.Electronics.iconType} color={'#343a40'} />
                            <Text style={[fs_semi_large, ml_10, Style.textColor('#343a40')]}>Electronics</Text>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback
                        onPress={() => {
                            currentItemTypeDetails.current = ItemType.Fragile
                            setBtmSheetExpanded(false)
                        }}
                    >
                        <View style={[align_items_center, flex_row, py_10, px_10]}>
                            <Icon name={ItemType.Fragile.iconName} type={ItemType.Fragile.iconType} color={'#343a40'} />
                            <Text style={[fs_semi_large, ml_10, Style.textColor('#343a40')]}>Fragile</Text>
                        </View>
                    </TouchableNativeFeedback>

                    <TouchableNativeFeedback
                        onPress={() => {
                            currentItemTypeDetails.current = ItemType.Other
                            setBtmSheetExpanded(false)
                        }}
                    >
                        <View style={[align_items_center, flex_row, py_10, px_10]}>
                            <Icon name={ItemType.Other.iconName} type={ItemType.Other.iconType} color={'#343a40'} />
                            <Text style={[fs_semi_large, ml_10, Style.textColor('#343a40')]}>Other</Text>
                        </View>
                    </TouchableNativeFeedback>

                </View>
            </BottomSheet >

        </View >
    )
}


// --------------------------------------------

const styles = StyleSheet.create({
    loadingDialog: {
        width: 180,
        maxHeight: 300,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20
    },

    rootContainer: {
        paddingTop: StatusBar.currentHeight + 50,
        height: '100%',
    },

    rootHeader: {
        height: 100,
        width: '100%',
        ...bg_primary,
        position: 'absolute',
        paddingTop: StatusBar.currentHeight,
        paddingBottom: 10
    },

    rootHeaderIcon: {
        marginTop: StatusBar.currentHeight,
        position: 'absolute',
        height: 90 - StatusBar.currentHeight,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },

    rootScrollView: {
        ...flex_1
    },

    locationSelector: {
        width: Dimensions.get('screen').width * 0.9,
        maxWidth: 380,
        height: 150,
        ...bg_white,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 10
    },

    boldText: {
        fontSize: 15,
        fontWeight: 'bold'
    },

    _90ScreenWidth: {
        width: Dimensions.get('screen').width * 0.9,
    },

    tab2_title: {
        ...fw_bold,
        ...fs_semi_large,
        color: '#353535'
    },

    tab2_subtitle: {
        fontSize: 14.5,
        color: '#343a40'
    },

    textInput: {
        borderBottomColor: "#adb5bd",
        borderBottomWidth: 1,
        paddingTop: 0,
        paddingBottom: 5,
        fontSize: 15,
        color: '#343a40',
        marginBottom: 10,
        flex: 1,
        marginRight: 12,
        paddingHorizontal: 5
    },

    textInputIcon: {
        ...border_radius_pill,
        backgroundColor: '#ced4da',
        padding: 3
    }
})