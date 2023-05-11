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
  Alert, DeviceEventEmitter, ToastAndroid
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
import SockJs from 'react-stomp';
import { APIService } from './src/services/APIService';
import { UserService } from './src/services/UserService';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import CameraScreen from './src/screens/MainScreen/Common/CameraScreen';
import OfferScreen from './src/screens/MainScreen/RegularUser/HomeTab/OfferScreen';
import ProfileEditor from './src/screens/MainScreen/Common/Profile/ProfileEditor';
import TestScreen from './src/screens/MainScreen/Common/Profile/TestScreen';
import ChatScreen from './src/screens/MainScreen/Common/Chat/ChatScreen';
import PhotoPreviewer from './src/screens/MainScreen/Shipper/HomeTab/PhotoPreviewer';
import SendbirdChat, { GroupChannelCreateScreen, GroupChannelScreen, GroupChannelListScreen } from './src/screens/MainScreen/Common/Chat/SendbirdChatScreen';
import { GroupChannel } from '@sendbird/chat/groupChannel';

import { SendbirdUIKitContainer, useConnection } from '@sendbird/uikit-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardService, FileService, NotificationService, MediaService } from './SendbirdSDK/Services'
import ActiveActivity from './src/screens/MainScreen/Common/Acitivity/ActiveActivity';
import Reports from './src/screens/MainScreen/Common/Acitivity/Reports';
import WalletScreen from './src/screens/MainScreen/Shipper/ProfileTab/WalletScreen';
import WalletSend from './src/screens/MainScreen/Shipper/ProfileTab/WalletSend';
import Widthdraw from './src/screens/MainScreen/Shipper/ProfileTab/Widthdraw';

// ----------------------------------------------


// ----------------------------------------------

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
            <Stack.Screen
              name='OfferScreen'
              component={OfferScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='ActiveActivity'
              component={ActiveActivity}
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
            <Stack.Screen
              name='PhotoPreviewer'
              component={PhotoPreviewer}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='WalletScreen'
              component={WalletScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='WalletSend'
              component={WalletSend}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name='Widthdraw'
              component={Widthdraw}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </> : null
      }

      <Stack.Screen
        name='Reports'
        component={Reports}
        options={{
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen
        name='ProfileEditor'
        component={ProfileEditor}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name='CameraScreen'
        component={CameraScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      {/* ------------------ Test ------------------ */}
      <Stack.Screen
        name='SendbirdChat'
        component={SendbirdChat}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='GroupChannelList'
        component={GroupChannelListScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='GroupChannelCreate'
        component={GroupChannelCreateScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='GroupChannel'
        component={GroupChannelScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      {/* ------------------ Test ------------------ */}
      <Stack.Screen
        name='TestScreen'
        component={TestScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
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
function onWebSocketConnected() {
  console.log("connected!")
  // UserService.registerAsActive(
  //   (response) => {
  //     //console.log('-------- online: true')
  //   },
  //   (error) => {
  //     console.log('-------- online: error')
  //   }
  // )
}

function onWebSocketDisconnected() {
  console.log("Disconnected!")
  UserService.registerAsInactive()
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setAuthenticated] = useState(false)


  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.isInternetReachable === false)
        showAlert()
    })
    // -----------------
    DeviceEventEmitter.addListener('event.app.authenticationState', setAuthenticated)
    // -----------------
    AuthenticationService.loginWithSavedCredential(
      (loginInfo) => {
        Global.User.CurrentUser.setType(loginInfo.userType)
        Global.User.CurrentUser.id = loginInfo.id
        Global.DEFAULT_ENDPOINT.SET_ACCESS_TOKEN(loginInfo.accessToken)
        DeviceEventEmitter.emit('event.app.authenticationState', true)

        const client = new ApolloClient({
          uri: APIService.buildDefaultEndpoint('graphql'),
          cache: new InMemoryCache()
        });
        Global.GraphQL.setClient(client)
      },
      () => ToastAndroid.show("Your login session has expired!", ToastAndroid.SHORT)
    )
    // -----------------

    // -----------------

  }, [])


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // <StatusBar
  //   barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  //   backgroundColor={backgroundStyle.backgroundColor}
  // />

  return (
    <>
      <SockJs
        url={APIService.buildDefaultEndpoint('/websocket')}
        topics={['/topic/greetings']}
        onConnect={onWebSocketConnected}
        onDisconnect={onWebSocketDisconnected}
        onMessage={(msg: any) => console.log('msg: ', msg)}
        onConnectFailure={(error: any) => console.log('error: ', error)}
        debug={false}
        headers={{ names: '12332' }}
        subscribeHeaders={{ names: '12332' }}
      />
      <SendbirdUIKitContainer
        appId={'7A08D36B-7936-4201-9600-FD47D45BECE1'}
        chatOptions={{ localCacheStorage: AsyncStorage }}
        platformServices={{
          file: FileService,
          notification: NotificationService,
          clipboard: ClipboardService,
          media: MediaService,
        }}
        userProfile={{
          onCreateChannel(channel) {

          },
        }}
      >
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
      </SendbirdUIKitContainer>
    </>
  );
};

const styles = StyleSheet.create({
  mainSection: {
    ...flex_1,

  }
})

export default App;
