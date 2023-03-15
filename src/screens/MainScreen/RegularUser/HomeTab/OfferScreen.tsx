import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableNativeFeedback, DeviceEventEmitter, ToastAndroid, Modal } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { align_items_center, align_self_center, bg_danger, bg_warning, bg_white, clr_primary, flex_1, flex_column, flex_row, fs_large, fs_semi_large, fw_bold, justify_center, left_0, mb_10, mb_15, mb_20, mb_5, ml_10, ml_5, mr_10, mt_10, mt_15, my_10, my_15, my_5, m_10, position_absolute, position_relative, px_10, py_10, py_5, p_10, p_5, right_0, Style, text_white, w_100, w_50 } from '../../../../stylesheets/primary-styles'
import SimpleHeaderNavigation from '../../../../components/SimpleHeaderNavigation'
import { Button, Icon, Skeleton } from '@rneui/themed'
import { Shadow } from 'react-native-shadow-2'
import LinearGradient from 'react-native-linear-gradient'
import { GraphQLService } from '../../../../services/GraphQLService'

const BOX_SHADOW_COLOR = '#6c757d33'

type Promotion = GraphQLService.Type.Promotion

export default function OfferScreen({ route, navigation }) {
    const promotionMap = useRef<Map<number, Promotion>>(new Map())
    const [enableSkeleton, setEnableSkeleton] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const modalPromoContent = useRef<Promotion>()

    useEffect(() => {
        GraphQLService.getApplicablePromotion(
            (list) => {
                console.log('- promo list: ', list)
                list.forEach(promo => promotionMap.current.set(promo.id, promo))
                setEnableSkeleton(false)
            },
            (error) => ToastAndroid.show('Cannot load your promotion', ToastAndroid.LONG)
        )
    }, [])

    function onItemPressed(id: number) {
        const promo = promotionMap.current.get(id)
        if (promo) {
            modalPromoContent.current = promotionMap.current.get(id)
            setModalVisible(true)
        }
    }

    function applyCode() {
        if (modalPromoContent.current) {
            DeviceEventEmitter.emit('event.AddDeliveryDetails.Tab1.onPromotionUsed', modalPromoContent.current)
            navigation.goBack()
        }
    }

    return (
        <View style={[flex_1, Style.backgroundColor('#eaf4f4')]}>
            <SimpleHeaderNavigation
                navigation={navigation}
                title="Select Offer"
                parentStatusBarValues={{
                    backgroundColor: (route.params?.parentStatusBarColor) ? route.params.parentStatusBarColor : 'transparent',
                    barStyle: (route.params?.parentStatusBarStyle) ? route.params.parentStatusBarStyle : 'light-content'
                }}
                newStatusBarValues={{
                    backgroundColor: clr_primary,
                    barStyle: 'light-content'
                }}
                titleBarColor={clr_primary}
            />
            <View style={styles.topBanner}>
                <View style={[flex_row, mb_5]}>
                    <Icon name='pin' type='entypo' size={17} color='#595959' />
                    <Text style={[Style.textColor('#595959'), align_self_center, Style.fontSize(16), ml_10]}>Apply an offer to get a discount on your delivery price!</Text>
                </View>
                <View style={flex_row}>
                    <Icon name='pin' type='entypo' size={17} color='#595959' />
                    <Text style={[Style.textColor('#595959'), align_self_center, Style.fontSize(16), ml_10]}>Only ONE promo code can be applied at a time.</Text>
                </View>
            </View>
            <ScrollView style={[px_10, flex_1]}>
                {
                    (enableSkeleton) ?
                        <Skeleton
                            style={styles.skeleton}
                            LinearGradientComponent={LinearGradient}
                            animation="wave"
                            width={80}
                            height={40}
                        />
                        :
                        (promotionMap.current.size === 0) ?
                            <Text>Empty</Text>
                            :
                            Array.from(promotionMap.current.values()).map(promo =>
                                <OfferItem
                                    key={promo.id}
                                    promoCode={promo.promoCode}
                                    maximumDiscountAmount={promo.maximumDiscountAmount}
                                    discountPercentage={promo.discountPercentage}
                                    id={promo.id}
                                    onPress={onItemPressed}
                                />)

                }
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modal}>
                        <View style={styles.modalTop}>
                            <View style={[Style.backgroundColor('#cccccc'), Style.borderRadius(8), p_5, justify_center, align_items_center]}>
                                <View style={[position_absolute, { left: 5 }]}>
                                    <Icon name='shopping-sale' type='fontisto' color='#E67422' size={30} />
                                </View>
                                <Text style={[my_5, fw_bold, fs_semi_large]}>{modalPromoContent.current?.promoCode}</Text>
                            </View>
                            <Text style={[fw_bold, mt_10, Style.fontSize(15)]}>Description:</Text>
                            <Text style={Style.fontSize(15)} numberOfLines={8}>{modalPromoContent.current?.description}</Text>
                            <View style={[flex_row, mt_10]}>
                                <Text style={[fw_bold, mr_10, Style.fontSize(15)]}>Discount percentage:</Text>
                                <Text style={Style.fontSize(15)}>{modalPromoContent.current?.discountPercentage * 100}%</Text>
                            </View>
                            <View style={[flex_row, mt_10]}>
                                <Text style={[fw_bold, mr_10, Style.fontSize(15)]}>Maximum discount:</Text>
                                <Text style={Style.fontSize(15)}>{modalPromoContent.current?.maximumDiscountAmount}</Text>
                            </View>
                            <View style={[flex_row, mt_10]}>
                                <Text style={[fw_bold, mr_10, Style.fontSize(15)]}>Maximum delivery price:</Text>
                                <Text style={Style.fontSize(15)}>{modalPromoContent.current?.maximumDiscountAmount}</Text>
                            </View>
                        </View>

                        <View style={styles.modalBottom}>
                            <Button
                                containerStyle={[flex_1, Style.borderRadius(8), mr_10]}
                                buttonStyle={py_10}
                                title={'Use Another'}
                                color='#e5e5ea'
                                titleStyle={Style.textColor('#0a83ff')}
                                onPress={() => setModalVisible(false)}
                            />
                            <Button
                                containerStyle={[flex_1, Style.borderRadius(8)]}
                                buttonStyle={py_10}
                                color='#0a83ff'
                                title={'Use This Code'}
                                onPress={applyCode}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// ---------------------------------------
interface OfferItemProps {
    id: number,
    promoCode: string,
    maximumDiscountAmount: number,
    discountPercentage: number,
    onPress?: (id: number) => void
}

function OfferItem(props: OfferItemProps) {
    return (
        <Shadow containerStyle={[align_self_center, my_10]} distance={10} startColor={BOX_SHADOW_COLOR}>
            <TouchableNativeFeedback
                style={styles.offerItemToucableWrapper}
                onPress={() => props.onPress?.(props.id)}
            >
                <View style={styles.offerItem}>
                    <Icon name='shopping-sale' type='fontisto' color='#E67422' style={styles.offerItemIcon} size={30} />
                    <View style={flex_column}>
                        <Text style={[Style.textColor('#463f3a'), fw_bold, Style.fontSize(16)]}>{props.promoCode}</Text>
                        <Text>Max amount: {props.maximumDiscountAmount}</Text>
                    </View>
                    <View style={styles.offerItemRightMost}>
                        <Text style={[text_white, fw_bold, fs_large]}>-{props.discountPercentage * 100}%</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </Shadow>
    )
}

const styles = StyleSheet.create({
    offerItemToucableWrapper: {
        borderRadius: 10
    },

    offerItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 10,
        width: Dimensions.get('screen').width * 0.9,
        borderRadius: 10,
        height: 65,
        alignItems: 'center',
        overflow: 'hidden'
    },

    topBanner: {
        width: Dimensions.get('screen').width * 0.9,
        backgroundColor: '#cccccc',
        alignSelf: 'center',
        padding: 10,
        marginVertical: 10,
        borderRadius: 10,
    },

    offerItemIcon: {
        padding: 5,
        backgroundColor: '#cccccc',
        borderRadius: 8,
        marginRight: 10
    },

    offerItemRightMost: {
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        position: 'absolute',
        backgroundColor: '#ca6702',
        width: 65,
        height: 65
    },

    skeleton: {
        borderRadius: 10,
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        height: 65
    },

    modalContainer: {
        backgroundColor: '#343a404d',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    modal: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        width: Dimensions.get('screen').width * 0.9
    },

    modalTop: {
        marginBottom: 15
    },

    modalBottom: {
        flexDirection: 'row',
        ...w_100,
    }

})