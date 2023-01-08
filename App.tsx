import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Authentication from './src/screens/Authentication/Authentication';
import { bg_dark, flex_1 } from './src/stylesheets/primary-styles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home/Home';
import { Test } from './src/screens/Test/Test';
import { Test2 } from './src/screens/Test/Test2';
import LocationPicker from './src/screens/Home/HomeTab/LocationPicker';

const Stack = createNativeStackNavigator()

const HomeScreen = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}
    >
      <Stack.Screen
        name='home'
        component={Home} />
      <Stack.Screen
        name='locationPicker'
        component={LocationPicker}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  )
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setisAuthenticated] = useState(false)

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
          (isAuthenticated) ?
            <Stack.Screen
              name='homeScreen'
              component={HomeScreen}
            /> :
            <Stack.Screen
              name='authenticationScreen'
              component={Authentication} />
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
