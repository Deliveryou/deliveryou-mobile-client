import { NavigationContainer } from '@react-navigation/native';
import React, { type PropsWithChildren } from 'react';
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
import Authentication from './screens/Authentication/Authentication';
import { bg_dark, flex_1 } from './stylesheets/primary-styles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home/Home';
import { Test } from './screens/Test/Test';
import { Test2 } from './screens/Test/Test2';
import LocationPicker from './screens/Home/HomeTab/LocationPicker';

const Stack = createNativeStackNavigator()

const springAnimationConfig = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // <StatusBar
  //   barStyle={isDarkMode ? 'light-content' : 'dark-content'}
  //   backgroundColor={backgroundStyle.backgroundColor}
  // />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen
          name='test'
          component={Test} />
        <Stack.Screen
          name='test2'
          component={Test2}
           /> */}
        <Stack.Screen
          name='home'
          component={Home} />
        <Stack.Screen
          name='locationPicker'
          component={LocationPicker}
          options={{

          }}
        />
        {/* <Stack.Screen
          name='Auth'
          component={Authentication}
          options={{ title: 'welcome' }} /> */}
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
