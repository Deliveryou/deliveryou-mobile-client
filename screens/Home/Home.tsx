import { ScrollView, StatusBar, StyleSheet, View, Pressable, StatusBarStyle, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react'
import { bg_black, bg_danger, bg_dark, bg_primary, bg_transparent, bg_warning, bg_white, border_radius_pill, bottom_0, clr_dark, flex_1, flex_column, flex_column_reverse, float_bottom, fs_normal, justify_center, position_absolute, position_relative, px_10, size_fill, Style, text_black, text_dark, text_primary, w_100 } from '../../stylesheets/primary-styles';
import { Tab, Text, TabView, Input } from '@rneui/themed';
import { BlurView } from '@react-native-community/blur';
import { Global } from '../../stylesheets/Global';
import Home_TabViews from './Home_TabContents';

const tabItemThemeClr = Global.Color.PRIMARY_THEME
const tabItemBlurClr = '#463f3a'

function getStatusBarStyle(index: number): StatusBarStyle {
    switch (index) {
        case 0: return 'dark-content'
        case 1: return 'dark-content'
        case 2: return 'light-content'
        case 3: return 'dark-content'
    }
    return 'dark-content'
}


export default function Home({ navigation }) {
    console.log('render: home')
    const [index, setIndex] = useState(0);
    const [focusedTab, setFocusedTab] = useState(0)

    useEffect(() => {
        StatusBar.setBackgroundColor("transparent")
        StatusBar.setBarStyle("dark-content")
        StatusBar.setTranslucent(true)
    }, [])

    useEffect(() => {
        StatusBar.setBarStyle(getStatusBarStyle(focusedTab))
    }, [focusedTab])


    const getIconClr = (index: number) => (focusedTab === index) ? tabItemThemeClr : tabItemBlurClr
    const getTitleStyle = (index: number) => (focusedTab === index) ?
        { ...styles.navBarTitle, color: tabItemThemeClr } : { ...styles.navBarTitle, color: tabItemBlurClr }
    const tabSwiped = (index: number) => {
        setIndex(index)
        setFocusedTab(index)
    }

    return (
        <View style={[flex_1]}>
            <View style={[flex_1, flex_column,]}>
                <BlurView
                    overlayColor=''
                    blurRadius={10}
                    blurType={'light'}
                    style={styles.navBarWrapper}
                >
                    <Tab
                        style={[styles.navBar]}
                        value={index}
                        onChange={(e) => setIndex(e)}
                        disableIndicator={true}
                        variant="default"
                        buttonStyle={{ paddingHorizontal: 0 }}
                    >
                        <Tab.Item
                            title="Home"
                            titleStyle={getTitleStyle(0)}
                            icon={{ name: 'home', type: 'entypo', color: getIconClr(0) }}
                            onPressIn={() => setFocusedTab(0)} />
                        <Tab.Item
                            title="History"
                            titleStyle={getTitleStyle(1)}
                            icon={{ name: 'history', type: 'fontawesome', color: getIconClr(1) }}
                            onPressIn={() => setFocusedTab(1)} />
                        <Tab.Item
                            title="Chat"
                            titleStyle={getTitleStyle(2)}
                            icon={{ name: 'message', type: 'materialcommunityicons', color: getIconClr(2) }}
                            onPressIn={() => setFocusedTab(2)} />
                        <Tab.Item
                            title="Profile"
                            titleStyle={getTitleStyle(3)}
                            icon={{ name: 'person', type: 'fontisto', color: getIconClr(3) }}
                            onPressIn={() => setFocusedTab(3)} />
                    </Tab>
                </BlurView>

                <Home_TabViews
                    value={index}
                    onChange={tabSwiped}
                    navigation={navigation} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    navBarWrapper: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        width: Dimensions.get('screen').width - 20,
        zIndex: 12,
        marginHorizontal: 10,
    },
    navBar: {
        ...position_relative,
        height: Global.Screen.Home.Variable.NAV_BAR_HEIGHT.get(),
        backgroundColor: "#ffffffB3",
        borderColor: tabItemThemeClr + '99',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 10,
        overflow: 'hidden',
    },
    navBarTitle: {
        ...fs_normal,
    },
})
