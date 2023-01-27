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
  Alert
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

const Stack = createNativeStackNavigator()

const MainScreen = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='Main'
        component={Main}
        initialParams={{ userType: Global.User.CurrentUser.type }} />
      {
        (Global.User.CurrentUser.isRegularUser()) ?
          <Stack.Screen
            name='locationPicker'
            component={LocationPicker}
            options={{
              animation: 'slide_from_right',
            }}
          /> : null
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
  const [isAuthenticated, setAuthenticated] = useState(true)
  const netInfo = useNetInfo({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async (response) => response.status === 204,
    reachabilityLongTimeout: 60 * 1000, // 60s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
    reachabilityShouldRun: () => true,
    useNativeReachability: false
  })

  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.isInternetReachable === false)
        showAlert()
    })
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
              component={Authentication} />
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
