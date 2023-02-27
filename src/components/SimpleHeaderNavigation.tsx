import { StatusBar, StyleSheet, View, ColorValue, StatusBarStyle, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { Icon, Text } from '@rneui/themed'
import { fs_large, fw_bold, text_white, w_100 } from '../stylesheets/primary-styles'

interface StatusBarValues {
  backgroundColor: ColorValue,
  barStyle: StatusBarStyle
}

interface SimpleHeaderNavigationProps {
  title: string,
  navigation: object,
  parentStatusBarValues?: StatusBarValues,
  newStatusBarValues?: StatusBarValues
}

export default function SimpleHeaderNavigation(props: SimpleHeaderNavigationProps) {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', goBack)

    const defaultValues: StatusBarValues = {
      backgroundColor: '#2c6e49',
      barStyle: 'light-content'
    }

    if (props.newStatusBarValues) {
      defaultValues.backgroundColor = props.newStatusBarValues.backgroundColor
      defaultValues.barStyle = props.newStatusBarValues.barStyle
    }

    StatusBar.setBarStyle(defaultValues.barStyle)
    setTimeout(() => StatusBar.setBackgroundColor(defaultValues.backgroundColor), 200)

  }, [])

  function goBack() {
    props.navigation?.goBack()
    if (props.parentStatusBarValues) {
      setTimeout(() => {
        StatusBar.setBackgroundColor(props.parentStatusBarValues.backgroundColor)
        StatusBar.setBarStyle(props.parentStatusBarValues.barStyle)
      }, 100)
    }
    console.log(1324)
    return true
  }

  return (
    <View style={styles.rootHeader}>
      <Icon onPress={goBack} containerStyle={styles.rootHeaderIcon} name='chevron-back' type='ionicon' color={'white'} />
      <View style={styles.rootHeaderText}>
        <Text style={[fs_large, fw_bold, text_white]}>{props.title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
})