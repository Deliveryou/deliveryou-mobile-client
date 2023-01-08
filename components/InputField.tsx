import { View, TextInput, Text, Modal, StyleSheet, Pressable, Keyboard, ReturnKeyTypeOptions, NativeSyntheticEvent, TextInputSubmitEditingEventData, StyleProp, ViewStyle } from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { align_items_center, align_items_start, bg_black, bg_danger, bg_dark, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_pill, flex_1, flex_column, fs_large, fs_normal, fs_small, h_100, justify_center, ml_10, mr_10, mt_10, mx_10, overflow_hidden, pl_10, position_absolute, position_center, position_relative, px_10, px_20, px_25, px_5, size_fill, Style, text_black, text_dark, text_primary, w_100 } from '../stylesheets/primary-styles';
import { mergeStyles } from '../utils/style-helpers';
import { BlurView } from '@react-native-community/blur';
import { Tooltip, TooltipProps } from '@rneui/themed'

const CLR_FOCUS_BORDER = 'rgb(100, 100, 100)'

interface PROPS {
    containerStyle?: StyleProp<ViewStyle>,
    placeholder?: string,
    caretHidden?: boolean,
    onFocusPlaceholderStyle?: object,
    onBlurPlaceholderStyle?: object,
    returnKeyType?: ReturnKeyTypeOptions,
    onSubmitEditing?: ((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void),
    blurOnSubmit?: boolean,
    onChangeText?: ((text: string) => void),
    inputStyle?: StyleProp<ViewStyle>,
    textContentType?:
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode',
    secureTextEntry?: boolean,
}

export class InputFieldRef {
    value: string
    focus: () => void
    setInvalid: (value: boolean) => void

    constructor(value: string = '', focus: () => void = () => { },
        setInvalid: (value: boolean) => void = (value = false) => { }) {
        this.value = value
        this.focus = focus
        this.setInvalid = setInvalid
    }

}

const ControlledTooltip: React.FC<TooltipProps> = (props) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Tooltip
            visible={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            {...props}
        />
    );
};

export const InputField = React.forwardRef<InputFieldRef>((props: PROPS, ref) => {
    let { containerStyle, placeholder, caretHidden, onFocusPlaceholderStyle,
        onBlurPlaceholderStyle, returnKeyType, onSubmitEditing, blurOnSubmit,
        onChangeText, inputStyle, textContentType, secureTextEntry } = props
    const [focus, setFocus] = useState(false)
    const [isInvalid, setInvalid] = useState(false)
    const inputValue = useRef('')

    containerStyle = useMemo(() => mergeStyles(containerStyle), [props.containerStyle])

    useEffect(() => {
        const keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHideCallback);

        return () => {
            keyboardDidHideSubscription?.remove();
        };
    }, []);

    const keyboardDidHideCallback = () => {
        input.current.blur?.();
        setFocus(false)
    }

    const input: { current: any } = useRef()
    const focusInput = () => {
        setFocus(true)
        setInvalid(false)
        input.current.focus?.()
    }


    const titleFocusStyle: object = (focus || inputValue.current?.trim() !== '') ?
        (onFocusPlaceholderStyle) ? onFocusPlaceholderStyle : { ...fs_small }
        : (onBlurPlaceholderStyle) ? onBlurPlaceholderStyle : {}

    const titleContainerFocusStyle: object = (focus || inputValue.current?.trim() !== '') ? { justifyContent: 'flex-start' } : {}

    const inputContainerSyncStyle = (inputStyle && inputStyle.borderRadius) ?
        { borderRadius: inputStyle.borderRadius } : { ...border_radius_pill }

    const invalidStyle = (isInvalid) ? styles.invalid : {}

    const doInvalid = (value: boolean) => {
        setInvalid(value)
        return input.current
    }

    const DEFAULT_INPUT_FIELD_REF = new InputFieldRef()

    return (
        <View style={[styles.container, containerStyle]}>
            <Pressable
                style={[styles.titleContainer, titleContainerFocusStyle]}
                onPress={focusInput}
                ref={i => {
                    if (ref && 'current' in ref) {
                        if (!ref.current)
                            ref.current = DEFAULT_INPUT_FIELD_REF
                        ref.current.focus = focusInput
                        ref.current.setInvalid = doInvalid
                    }
                }}
            >
                <Text style={[styles.title, titleFocusStyle]}>{placeholder ? placeholder : ''}</Text>
            </Pressable>
            <View style={[flex_1, overflow_hidden, inputContainerSyncStyle, invalidStyle]}>
                <BlurView
                    style={[styles.inputContainer]}
                    blurAmount={15}
                    blurType="light"
                    overlayColor=''>
                    <TextInput
                        style={[styles.input, inputStyle]}
                        returnKeyType={returnKeyType}
                        onChangeText={(text) => {
                            inputValue.current = text
                            onChangeText?.(text)
                        }}
                        onSubmitEditing={onSubmitEditing}
                        blurOnSubmit={blurOnSubmit}
                        caretHidden={caretHidden}
                        ref={(i) => {
                            input.current = i
                        }}
                        textContentType={textContentType}
                        secureTextEntry={secureTextEntry} />
                </BlurView>
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: 50,
    },
    titleContainer: {
        ...position_absolute,
        zIndex: 1,
        ...size_fill,
        ...align_items_start,
        ...justify_center,
        ...px_25
    },
    title: {
    },

    inputContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        flex: 1,
        paddingTop: 15,
        ...px_25,
        ...border_radius_pill
    },
    invalid: {
        borderColor: 'rgba(188, 71, 73)',
        borderWidth: 2.4,
        borderStyle: 'dotted',
    }
})
