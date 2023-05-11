import { SendbirdUIKitContainer, useConnection } from '@sendbird/uikit-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardService, FileService, NotificationService, MediaService } from '../../../../../SendbirdSDK/Services'

export default function SendbirdChatScreen({ route, navigation }) {
  return (
    <View>
      <OnButton />
      <Button
        containerStyle={{ marginTop: 200 }}
        title={'Press'}
        onPress={() => navigation.navigate('GroupChannelList')}
      />
    </View>
  );
};

function OnButton() {
  const { connect, disconnect } = useConnection()

  useEffect(() => {

    return () => {
      disconnect()
    }
  }, [])


  return (
    <Button
      containerStyle={{ marginTop: 200 }}
      title={'Connect'}
      onPress={() => {
        connect('2')
          .then(user => console.log('>>>>>>>>> user: ', user))
          .catch(error => console.log('>>>>>>>>>>>> error: ', error))
      }}
    />
  )
}

// -------------------------------------------------------------------

import { useNavigation, useRoute } from '@react-navigation/native';
import {
  useSendbirdChat,
  createGroupChannelListFragment,
  createGroupChannelCreateFragment,
  createGroupChannelFragment,
  GroupChannelListContexts
} from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { Button } from '@rneui/themed';
import { useEffect, useContext, useState } from 'react';
import { View } from 'react-native';

function Head() {
  return (
    <View>
    </View>
  )
}

const GroupChannelListFragment = createGroupChannelListFragment({
  Header: Head
});
const GroupChannelCreateFragment = createGroupChannelCreateFragment();
const GroupChannelFragment = createGroupChannelFragment();

export const GroupChannelListScreen = ({ route, navigation }) => {
  const { hide } = useContext(GroupChannelListContexts.TypeSelector)

  const [_refresh, setRefresh] = useState(0)
  const refresh = () => setRefresh(value => value + 1)

  return (
    <GroupChannelListFragment

      onPressCreateChannel={(channelType) => {
        // Navigate to GroupChannelCreate function.
        //navigation.navigate('GroupChannelCreate', { channelType });
        hide()
        refresh()
      }}
      onPressChannel={(channel) => {
        // Navigate to GroupChannel function.
        navigation.navigate('GroupChannel', { channelUrl: channel.url });
      }}
    />
  );
};

export const GroupChannelCreateScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <GroupChannelCreateFragment
      onCreateChannel={async (channel) => {
        // Navigate to GroupChannel function.
        navigation.replace('GroupChannel', { channelUrl: channel.url });
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
    />
  );
};

export const GroupChannelScreen = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();

  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      onChannelDeleted={() => {
        // Navigate to GroupChannelList function.
        navigation.navigate('GroupChannelList');
      }}
      onPressHeaderLeft={() => {
        // Go back to the previous screen.
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        // Navigate to GroupChannelSettings function.
        navigation.navigate('GroupChannelSettings', { channelUrl: params.channelUrl });
      }}
    />
  );
};


// -------------------------------------------------------------------


// import { View, Text, StyleSheet, StatusBar } from 'react-native'
// import React from 'react'
// import SendbirdChat from '@sendbird/chat'
// import { OpenChannel, OpenChannelCreateParams, OpenChannelModule, SendbirdOpenChat } from '@sendbird/chat/openChannel';
// import { Button } from '@rneui/themed';
// import { UserMessage, UserMessageCreateParams } from '@sendbird/chat/message';
// import { SendableMessage } from '@sendbird/chat/lib/__definition';

// const sb = SendbirdChat.init({
//   appId: '7A08D36B-7936-4201-9600-FD47D45BECE1',
//   modules: [
//     new OpenChannelModule(),
//   ],
// }) as SendbirdOpenChat;

// export default function SendbirdChatScreen() {

//   async function connect() {
//     // The USER_ID below should be unique to your Sendbird application.
//     try {
//       const user = await sb.connect('2');
//       // The user is connected to the Sendbird server.
//       console.log('+++++++ connected: ', user)
//     } catch (err) {
//       // Handle error.
//       console.log('+++++++ error: ', err)
//     }
//   }

//   async function sendMessage(channel: OpenChannel) {
//     const params: UserMessageCreateParams = { // UserMessageCreateParams can be imported from @sendbird/chat/message.
//       message: 'HI there ',
//     };

//     channel.sendUserMessage(params)
//       .onPending((message: SendableMessage) => {
//         // The pending message for the message being sent has been created.
//         // The pending message has the same reqId value as the corresponding failed/succeeded message.
//         console.log('>>>>>>>>>>> msg pending')
//       })
//       .onFailed((err: Error, message: SendableMessage) => {
//         // Handle error.
//         console.log('>>>>>>>>>>> msg error: ', err)
//       })
//       .onSucceeded((message: SendableMessage) => {
//         console.log('>>>>>>>>>>> msg sent')
//         // The message is successfully sent to the channel.
//         // The current user can receive messages from other users through the onMessageReceived() method of an event handler.
//       });
//   }

//   async function createChannel() {
//     try {
//       const params: OpenChannelCreateParams = { // OpenChannelCreateParams can be imported from @sendbird/chat/openChannel.
//         // ...
//         name: 'sk4JK'
//       };
//       const channel = await sb.openChannel.createChannel(params);
//       console.log('>>>>>>>>>>> channel created')

//       await channel.enter()
//       console.log('>>>>>>>>>>> channel entered')

//       sendMessage(channel)
//       // An open channel is successfully created.
//       // Through the openChannel parameter of the callback function,
//       // you can get the open channel's data from the result object that the Sendbird server has passed to the callback function.
//       // ...
//     } catch (err) {
//       // Handle error.
//       console.log('>>>>>>>>>>> channel error: ', err)
//     }
//   }

//   return (
//     <View style={styles.rootContainer}>
//       <Button
//         title={'Connect'}
//         onPress={connect}
//       />
//       <Button
//         title={'Create channel'}
//         onPress={createChannel}
//       />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   rootContainer: {
//     paddingTop: StatusBar.currentHeight
//   }
// })