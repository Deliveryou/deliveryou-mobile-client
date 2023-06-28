import { View, Text, ToastAndroid, StyleSheet, StatusBar, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GraphQLService } from '../../../../services/GraphQLService'
import { Shadow } from 'react-native-shadow-2'
import { Style, align_items_center, bg_black, bg_white, border_radius_pill, flex_1, flex_row, fw_600, fw_bold, justify_center, justify_space_around, m_20, mb_20, ml_10, ml_20, mr_10, mr_15, mt_10, mt_15, mt_20, mt_5, mx_10, mx_20, my_10, my_15, my_20, p_10, p_15, p_20, p_25, p_5, pl_10, pl_15, pl_20, position_absolute, pr_25, px_10, px_15, px_20, px_25, py_10, py_15, py_20, py_5, right_0, text_white, w_100 } from '../../../../stylesheets/primary-styles'
import { Avatar, Button, Icon, ListItem } from '@rneui/themed'
import { WalletService } from '../../../../services/WalletService'
import { useNavigation, useRoute } from '@react-navigation/native'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import napas_banks from '../../../../resources/json/napas_banks.json'
import Validator from '../../../../utils/Validator'

type Bank = {
    en_name: string
    vn_name: string
    shortName: string
    bankCode: string
    napasSupported: boolean
}

function filterFromBankList(list: Bank[], keyword: string) {
    keyword = keyword.trim().replace(/\s{2,}/gm, ' ').toLowerCase()
    if (keyword.length === 0)
        return []

    return list.filter(bank => bank.en_name.toLowerCase().includes(keyword) || bank.vn_name.toLowerCase().includes(keyword) || bank.shortName.toLowerCase().includes(keyword))
        .slice(0, 6)
}

const bankList = napas_banks.banksnapas

export default function Widthdraw() {
    const navigation = useNavigation()
    const [wallet, setWallet] = useState<GraphQLService.Type.Wallet>()
    const [widthdraw, setWithdraw] = useState<GraphQLService.Type.Withdraw>()

    const [modalVisible, setModalVisible] = useState(false)
    const [otpModalVisible, setOtpModalVisible] = useState(false)
    const [bankInfoNotSet, setBankInfoNotSet] = useState(false)

    const [widthdrawAmount, setWidthdrawAmount] = useState('100')
    const canCreateRequest = useRef(false)


    useEffect(() => {
        const sbstack = StatusBar.pushStackEntry({
            backgroundColor: '#fff'
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
            if (accountInfoNotSet()) {
                setBankInfoNotSet(true)
                setModalVisible(true)
            }
            else
                WalletService.Common.getPendingWithdraw(
                    wallet.id,
                    (_withdraw) => setWithdraw(_withdraw),
                    (error) => ToastAndroid.show('Cannot retrieve your withdraws', ToastAndroid.LONG)
                )
        }
    }, [wallet])

    function accountInfoNotSet() {
        return (wallet &&
            ([undefined, null, ''].includes(wallet.accountNumber?.trim()) ||
                [undefined, null, ''].includes(wallet.accountOwner?.trim()) ||
                [undefined, null, ''].includes(wallet.branch?.trim())
            )
        )
    }

    function onWidthdrawAmountTyped(text: string) {
        setWidthdrawAmount(text)
    }

    function displayWidthdrawInVND() {
        const amount = Number(widthdrawAmount)
        canCreateRequest.current = false

        if (!isNaN(amount) && amount % 1 === 0) {
            if (amount < 100)
                return <Text style={[Style.fontSize(15), fw_600, Style.textColor('#f94144')]}>Error: The allowed minimum credits is 100</Text>

            if (wallet && amount > wallet.credit)
                return <Text style={[Style.fontSize(15), fw_600, Style.textColor('#f94144')]}>You do NOT have enough credits</Text>

            canCreateRequest.current = true
            return (
                <>
                    <Text style={[Style.fontSize(15)]}>You'll be widthdrawing:  </Text>
                    <Text style={[Style.fontSize(15), fw_600, Style.textColor('#ffa62b')]}>{(amount * 1000) + ' VND'}</Text>
                </>
            )
        }
        return <Text style={[Style.fontSize(15), fw_600, Style.textColor('#f94144')]}>Error: Not a number</Text>
    }

    function createWithdrawRequest() {
        if (widthdraw) {
            ToastAndroid.show('You still have a pending request\nCannot proceed!', ToastAndroid.LONG)
            return
        }
        if (wallet && widthdrawAmount !== '') {

            WalletService.Shipper.createWithdrawRequest(
                wallet.id,
                widthdrawAmount,
                (_withdraw) => setWithdraw(_withdraw),
                (error) => ToastAndroid.show('Cannot create withdraw request:\nserver timeout ', ToastAndroid.LONG)
            )

        } else
            ToastAndroid.show('Cannot create withdraw request', ToastAndroid.LONG)
    }

    const withdrawDate = (widthdraw?.date) ? new Date(Date.parse(widthdraw.date)) : undefined

    return (
        <>
            <ScrollView style={styles.root}>
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
                    Withdraw
                </Text>

                {/* --------------------- MAIN ------------------------ */}
                <Button
                    title={"View or edit bank account information"}
                    containerStyle={[mx_20]}
                    buttonStyle={[{ paddingVertical: 12 }, Style.borderRadius(100)]}
                    color={'#2087d933'}
                    titleStyle={Style.textColor('#1b4965')}
                    onPress={() => setModalVisible(true)}
                />

                <Shadow containerStyle={m_20} style={w_100} startColor='#ced4dacc' distance={8}>
                    <View style={[Style.borderRadius(10), p_20]}>
                        <Text style={[Style.fontSize(15)]}>Your current credits:</Text>
                        <Text style={[Style.fontSize(15), fw_600, Style.textColor('#16697a')]}>{wallet?.credit}</Text>

                        <Text style={[Style.fontSize(15), mt_15]}>Amount of CREDITS to widthdraw: </Text>
                        <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), my_20]}>
                            <TextInput
                                style={[px_15, py_10, Style.fontSize(15.5)]}
                                placeholder='10 points = 1000 vnd'
                                defaultValue={'100'}
                                keyboardType='number-pad'
                                onChangeText={onWidthdrawAmountTyped}
                            />
                        </View>
                        {
                            displayWidthdrawInVND()
                        }
                        {
                            (canCreateRequest.current) ?
                                <Button
                                    containerStyle={[mt_15]}
                                    title={'Create Withdraw Request'}
                                    buttonStyle={[{ paddingVertical: 12 }, Style.borderRadius(100)]}
                                    color={'#2087d933'}
                                    titleStyle={Style.textColor('#2087d9')}
                                    onPress={() => setOtpModalVisible(true)}
                                />
                                : null
                        }

                    </View>
                </Shadow>

                <Text style={[Style.fontSize(20), fw_600, mt_10, mb_20, , mx_20, Style.textColor('#463f3a')]}>
                    Withdraw request
                </Text>

                <Shadow containerStyle={[mx_20, mt_10, mb_20]} style={w_100} startColor='#ced4dacc' distance={8}>
                    <View style={[Style.borderRadius(10), p_20]}>
                        {
                            (widthdraw) ?
                                <View>
                                    <View style={[Style.backgroundColor('#ee6055'), px_15, py_5, border_radius_pill]}>
                                        <Text style={[Style.fontSize(15), fw_600, text_white]}>CURRENT REQUEST:</Text>
                                    </View>
                                    <View style={pl_20}>
                                        <View style={[flex_row, mt_15]}>
                                            <Text style={[Style.fontSize(15), fw_600, mr_10]}>Date:</Text>
                                            <Text>{withdrawDate?.toUTCString()}</Text>
                                        </View>
                                        <View style={flex_row}>
                                            <Text style={[Style.fontSize(15), fw_600, mr_10]}>Amount:</Text>
                                            <Text>{widthdraw?.amount} credits</Text>
                                        </View>
                                        <View style={flex_row}>
                                            <Text style={[Style.fontSize(15), fw_600, mr_10]}>Status:</Text>
                                            <Text style={[Style.fontSize(15), fw_600, Style.textColor('#ee6055')]}>PENDING</Text>
                                        </View>
                                    </View>
                                </View>
                                :
                                <View style={flex_row}>
                                    <View style={[Style.backgroundColor('#ee6055'), px_15, py_5, border_radius_pill]}>
                                        <Text style={[Style.fontSize(15), fw_600, text_white]}>NO PENDING REQUEST</Text>
                                    </View>
                                </View>
                        }
                    </View>
                </Shadow>

                <View style={Style.dimen(100, '100%')} />

            </ScrollView>

            {
                (modalVisible) ?
                    <BankInfoModal
                        visible={modalVisible}
                        wallet={wallet}
                        onCancel={() => {
                            if (bankInfoNotSet) {
                                navigation.goBack()
                            }
                            setModalVisible(false)
                        }}
                        onUpdated={(wallet) => {
                            setWallet(wallet)
                            setBankInfoNotSet(false)
                            setModalVisible(false)
                        }}
                    />
                    : null
            }
            {
                (otpModalVisible) ?
                    <OTPModal
                        visible={otpModalVisible}
                        onRequestClose={() => setOtpModalVisible(false)}
                        onOtpVerified={createWithdrawRequest}
                    />
                    : null
            }
        </>
    )
}

// ------------------------------------

function OTPModal(props: {
    visible: boolean,
    onRequestClose: () => void,
    onOtpVerified: () => void
}) {
    const [phone, setPhone] = useState<string>()
    const [error, setError] = useState<string>('*Required')
    const [otpError, setOtpError] = useState<string>('*Required')

    const [otpConfirmation, setOtpConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult>()
    const [confirmedOtp, setConfirmedOtp] = useState<boolean>()

    function onInputTyped(text: string) {
        if (text.trim() === '') {
            setError('*Required')
            return
        }

        Validator.validatePhoneToCountryCode(
            text,
            (_phone) => {
                setPhone(_phone)
                setError('')
            },
            () => {
                setPhone(undefined)
                setError('Invalid phone number')
            }
        )
    }

    function sendOtp() {
        setConfirmedOtp(false)

        if (phone) {
            auth().signInWithPhoneNumber(phone)
                .then(res => {
                    setOtpConfirmation(res)
                    ToastAndroid.show('SMS has been sent!', ToastAndroid.LONG)
                })
                .catch(error => {
                    console.log('>>> error sms: ', error)
                    ToastAndroid.show('Failed to send sms!', ToastAndroid.LONG)
                })
        }
    }

    function onOtpTyped(text: string) {
        text = text.trim()

        if (text === '') {
            setOtpError('*Required')
            return
        }

        if (otpConfirmation && text.length === 6) {
            otpConfirmation.confirm(text)
                .then(_ => {
                    setOtpError('')
                    setConfirmedOtp(true)
                })
                .catch(error => {
                    console.log('>>>>>> error: ', error)
                    setOtpError('Incorrect OTP!')
                    ToastAndroid.show(`Let's verify your phone again!`, ToastAndroid.LONG)
                    setTimeout(props.onRequestClose, 2100)
                })
        }

    }

    return (
        <Modal
            visible={props.visible}
            transparent
            animationType='slide'
        >
            <View style={[flex_1, Style.backgroundColor('#ffddd233'), align_items_center, justify_center]}>
                <Shadow
                >
                    <View style={[Style.backgroundColor('#fff'), Style.borderRadius(10), p_20, Style.width(350)]}>
                        <Text style={[{ textAlign: 'center' }, fw_600, Style.fontSize(17)]}>Let's verify your phone first!</Text>

                        {
                            (!otpConfirmation) ?
                                <>
                                    <View style={mt_20}>
                                        <TextInput
                                            keyboardType='phone-pad'
                                            placeholder='Your registered phone'
                                            style={[Style.backgroundColor('#a9d6e56a'), Style.borderRadius(100), pl_15, pr_25]}
                                            onChangeText={onInputTyped}
                                        />
                                        {
                                            (phone !== undefined) ?
                                                <Button
                                                    title={"Verify"}
                                                    buttonStyle={[Style.borderRadius(100), Style.height(46)]}
                                                    containerStyle={[position_absolute, right_0]}
                                                    onPress={sendOtp}
                                                />
                                                : null
                                        }
                                    </View>
                                    <Text style={[Style.textColor('#bc4749'), ml_20, mt_5]}>{error}</Text>
                                </>
                                :
                                <>
                                    <TextInput
                                        keyboardType='number-pad'
                                        placeholder='Enter OTP'
                                        style={[Style.backgroundColor('#a9d6e56a'), Style.borderRadius(100), pl_15, pr_25, mt_20]}
                                        onChangeText={onOtpTyped}
                                    />
                                    {
                                        (otpError === '') ?
                                            <Text style={[Style.textColor('#274c77'), ml_20, mt_5]}>Verified</Text>
                                            :
                                            <Text style={[Style.textColor('#bc4749'), ml_20, mt_5]}>{otpError}</Text>
                                    }
                                </>
                        }

                        <View style={[flex_row, mt_15]}>
                            <Button
                                containerStyle={[flex_1]}
                                title={'Close'}
                                buttonStyle={[{ paddingVertical: 12 }, Style.borderRadius(100)]}
                                color={'#2087d933'}
                                titleStyle={Style.textColor('#2087d9')}
                                onPress={props.onRequestClose}
                            />
                            <Button
                                containerStyle={[flex_1, ml_10]}
                                title={'Create Request'}
                                buttonStyle={[{ paddingVertical: 12 }, Style.borderRadius(100)]}
                                color={'#f7258533'}
                                titleStyle={Style.textColor('#f72585')}
                                onPress={props.onOtpVerified}
                                disabled={otpError !== ''}
                            />
                        </View>
                    </View>
                </Shadow>
            </View>
        </Modal>
    )
}

// -------------------------------------

function BankInfoModal(props: {
    visible: boolean
    wallet?: GraphQLService.Type.Wallet,
    onUpdated?: (wallet: GraphQLService.Type.Wallet) => void
    onCancel?: () => void
}) {
    const wallet = props.wallet

    const [filteredBankList, setFilteredBankList] = useState<Bank[]>([])

    const _accountNumberValue = useRef<string>('')
    const _accountOwnerValue = useRef<string>('')
    const _branchValue = useRef<string>('')

    function onBranchTyped(text: string) {
        const list = filterFromBankList(bankList, text)
        if (list.length > 0) {
            setFilteredBankList(list)
        } else {
            setFilteredBankList([])
        }
    }

    function onBankItemPressed(bank: Bank) {
        _branchValue.current = bank.shortName
        setFilteredBankList([])
    }

    function validate() {
        return (_accountNumberValue.current !== '' && /^\d{10,}$/.test(_accountNumberValue.current))
            && _accountOwnerValue.current.trim() !== ''
            && _branchValue.current.trim() !== ''
    }

    function updateInfo() {
        if (!wallet || !validate()) {
            ToastAndroid.show('Check your information again', ToastAndroid.LONG)
            return
        }

        WalletService.Shipper.updateBankInfo(
            wallet.id,
            _accountNumberValue.current,
            _accountOwnerValue.current,
            _branchValue.current,
            (savedWallet) => props.onUpdated?.(savedWallet),
            (error) => ToastAndroid.show('Cannot update bank info: server timeout', ToastAndroid.LONG)
        )
    }

    return (
        <Modal
            animationType="slide"
            visible={props.visible}
            transparent={true}
        >
            <View style={[Style.backgroundColor('#333533a1'), flex_1, align_items_center, justify_center, flex_row, p_25]}>

                <ScrollView style={[bg_white, Style.borderRadius(10), { maxHeight: 600 }, p_15]}>
                    {/* ------- account number -------- */}
                    <Text style={[Style.fontSize(15), mt_15]}>Account number:</Text>
                    <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), mt_5]}>
                        <TextInput
                            style={[px_15, py_10, Style.fontSize(15.5)]}
                            placeholder='[Not set]'
                            defaultValue={(wallet?.accountNumber) ? wallet.accountNumber : undefined}
                            onChangeText={text => _accountNumberValue.current = text}
                        />
                    </View>
                    {/* ------- account owner -------- */}
                    <Text style={[Style.fontSize(15), mt_15]}>Account owner:</Text>
                    <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), mt_5]}>
                        <TextInput
                            style={[px_15, py_10, Style.fontSize(15.5)]}
                            placeholder='[Not set]'
                            defaultValue={(wallet?.accountOwner) ? wallet.accountOwner : undefined}
                            onChangeText={text => _accountOwnerValue.current = text}
                        />
                    </View>
                    {/* ------- branc -------- */}
                    <Text style={[Style.fontSize(15), mt_15]}>Bank branch:</Text>
                    <View style={[Style.backgroundColor('#d3d3d3'), Style.borderRadius(100), mt_5]}>
                        <TextInput
                            style={[px_15, py_10, Style.fontSize(15.5)]}
                            placeholder='[Not set]'
                            defaultValue={(_branchValue.current === '') ? ((wallet?.branch) ? wallet.branch : undefined) : _branchValue.current}
                            onChangeText={onBranchTyped}
                        />
                    </View>
                    <BankSuggestion
                        list={filteredBankList}
                        onPress={onBankItemPressed}
                    />

                    <Button
                        title={'Update Info'}
                        containerStyle={mt_20}
                        buttonStyle={[Style.borderRadius(100), py_10]}
                        onPress={updateInfo}
                        color={'#0fa3b133'}
                        titleStyle={Style.textColor('#0fa3b1')}
                    />
                    <Button
                        title={'Cancel'}
                        containerStyle={mt_15}
                        buttonStyle={[Style.borderRadius(100), py_10]}
                        onPress={props.onCancel}
                        color={'#2087d933'}
                        titleStyle={Style.textColor('#2087d9')}
                    />
                </ScrollView>
            </View>
        </Modal>
    )
}


// -----------------------------------

function BankSuggestion(props: {
    list: Bank[],
    onPress?: (bank: Bank) => void
}) {
    return (
        <>
            {
                props.list.map((bank, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.5}
                            onPress={() => props.onPress?.(bank)}
                        >
                            <ListItem>
                                <Icon
                                    containerStyle={[Style.backgroundColor('#ee9b00'), Style.borderRadius(100), p_5]}
                                    name='bank-outline'
                                    type='material-community'
                                    color='#fff'

                                />
                                <ListItem.Content>
                                    <ListItem.Title>{bank.shortName}</ListItem.Title>
                                    <ListItem.Subtitle>{bank.vn_name}</ListItem.Subtitle>
                                </ListItem.Content>
                            </ListItem>
                        </TouchableOpacity>
                    )
                })
            }
        </>
    )
}

// -------------------------------------

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: StatusBar.currentHeight
    }
});