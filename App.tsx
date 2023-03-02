import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert, DeviceEventEmitter
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Authentication from './src/screens/AuthenticationScreen/Authentication';
import { bg_dark, flex_1 } from './src/stylesheets/primary-styles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from './src/screens/MainScreen/Main';
import { Test } from './src/screens/Test/Test';
import { Test2 } from './src/screens/Test/Test2';
import LocationPicker from './src/screens/MainScreen/RegularUser/HomeTab/LocationPicker';
import { Global } from './src/Global';
import NetInfo, { useNetInfo, NetInfoState } from '@react-native-community/netinfo';
import AddDeliveryDetails from './src/screens/MainScreen/RegularUser/HomeTab/AddDeliveryDetails';
import MatchingOptions from './src/screens/MainScreen/Shipper/HomeTab/MatchingOptions';
import OngoingDelivery from './src/screens/MainScreen/Shipper/HomeTab/OngoingDelivery';
import { AuthenticationService } from './src/services/AuthenticationService';

const Stack = createNativeStackNavigator()

const MainScreen = () => {
  return (
    <Stack.Navigator initialRouteName='Main' screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='Main'
        component={Main}
        initialParams={{ userType: Global.User.CurrentUser.type }} />
      {
        (Global.User.CurrentUser.isRegularUser()) ?
          <>
            <Stack.Screen
              name='LocationPicker'
              component={LocationPicker}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='AddDeliveryDetails'
              component={AddDeliveryDetails}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
          : null
      }
      {
        (Global.User.CurrentUser.isShipper()) ?
          <>
            <Stack.Screen
              name='MatchingOptions'
              component={MatchingOptions}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='OngoingDelivery'
              component={OngoingDelivery}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </> : null
      }
    </Stack.Navigator>
  )
}

// -------------------------------
NetInfo.addEventListener(state => {
  if (state.isInternetReachable === false)
    showAlert()
})

function showAlert() {
  Alert.alert(
    'Oh no! 😭',
    'Internet connection is lost!',
    [
      {
        text: "Try again",
        onPress: () => {
          NetInfo.fetch().then(state => {
            console.log('connected: ', state.isInternetReachable)
            if (state.isInternetReachable === false) {
              showAlert()
            }
          })
        }
      }
    ],
    {
      cancelable: false,
    }
  )
}
// -------------------------------

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.isInternetReachable === false)
        showAlert()
    })

    DeviceEventEmitter.addListener('event.app.authenticationState', setAuthenticated)

    AuthenticationService.loginWithSavedCredential(
      (loginInfo) => {
        Global.User.CurrentUser.setType(loginInfo.userType)
        DeviceEventEmitter.emit('event.app.authenticationState', true)
      },
      () => {

      }
    )

  }, [])


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // <StatusBar
  //   barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  //   backgroundColor={backgroundStyle.backgroundColor}
  // />

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {
          (!isAuthenticated) ?
            <Stack.Screen
              name='authenticationScreen'
              component={Authentication}
            />
            :
            <Stack.Screen
              name='mainScreen'
              component={MainScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  mainSection: {
    ...flex_1,

  }
})

export default App;
