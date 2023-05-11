import { View, Text, StyleSheet, StatusBar, TouchableNativeFeedback, FlatList, ToastAndroid } from 'react-native'
import React, { useRef, useEffect, useState, useMemo, useLayoutEffect } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { align_items_center, bg_danger, bg_primary, bg_white, flex_1, flex_row, fs_semi_large, fs_semi_small, fw_bold, justify_center, mb_20, ml_10, mt_10, mt_15, mt_25, mx_15, px_10, px_5, py_10, py_5, Style } from '../../../../stylesheets/primary-styles'
import { Avatar, Button, Icon, ListItem } from '@rneui/themed'
import { Global } from '../../../../Global'
import { APIService } from '../../../../services/APIService'
import SockJs from 'react-stomp';
import { GraphQLService } from '../../../../services/GraphQLService'
import { WebSocketService } from '../../../../services/WebsocketService'
import { ChatService } from '../../../../services/ChatService'
import { useConnection, createGroupChannelListFragment } from '@sendbird/uikit-react-native'
import { SendbirdUser } from '@sendbird/uikit-utils'


interface ChatTabProps {
    navigation: any,
    route: any
}

type WSChatResponse = WebSocketService.WSChatResponse
type WSChatUser = WebSocketService.WSChatUser
type ChatSession = GraphQLService.Type.ChatSession

const EmptyHeader = () => <View />

const GroupChannelListFragment = createGroupChannelListFragment({
    Header: EmptyHeader
})

export default function ChatTab(props: ChatTabProps) {
    const { connect, disconnect } = useConnection()
    const [chatUser, setChatUser] = useState<SendbirdUser>()
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)

    useMemo(() => {
        connect(`${Global.User.CurrentUser.id}`)
            .then(user => {
                console.log('>>>>>>>>>> Chat connection user: ', user)
                setChatUser(user)
            })
            .catch(error => console.log('>>>>>>>>>> Chat connection error: ', error))
    }, [])

    useEffect(() => {
        return () => { disconnect() }
    }, [])

    return (
        <View style={styles.rootContainer}>
            <Text style={styles.title}>Support Chats</Text>
            <View style={styles.mainSection}>
                <View style={[align_items_center, mt_10, mb_20]}>
                    <View style={[Style.dimen(2, '20%'), Style.backgroundColor('#d9d9d9')]} />
                </View>
                {
                    (!chatUser) ?
                        <View style={[flex_1, align_items_center, justify_center]}>
                            <Icon name='smile-circle' type='antdesign' color='#fca311' size={30} />
                            <Text style={[mt_15, fw_bold, fs_semi_large]}>You has not started any chat yet!</Text>
                        </View>
                        :
                        <GroupChannelListFragment
                            onPressChannel={channel => {
                                props.navigation.navigate('GroupChannel', { channelUrl: channel.url })
                            }}
                            onPressCreateChannel={(channelType) => { }}
                        />
                }
            </View>
        </View>
    )
}

// export default function ChatTab(props: ChatTabProps) {
//     const chatList = useRef<ChatSession[]>([])
//     const [_refresh, setRefresh] = useState(0)

//     const refresh = () => setRefresh(value => value + 1)

//     useEffect(() => {
//         GraphQLService.getAllChatSessions(
//             (chatSessionList) => {
//                 chatList.current.push(...chatSessionList)
//                 refresh()
//             },
//             (error) => {
//                 ToastAndroid.show('Failed to load previous chats', ToastAndroid.LONG)
//                 console.log('Error: ', error)
//             }
//         )
//     }, [])


//     function renderItem({ item }) {
//         function wsItem() {
//             return item as ChatSession
//         }
//         return (
//             <ChatItem
//                 key={wsItem().id}
//                 navigation={props.navigation}
//                 route={props.route}
//                 chatSession={item}
//             />
//         )
//     }

//     function emptyListComponent() {
//         return (
//             <View style={[flex_1, align_items_center, justify_center, mt_25]}>
//                 <Icon name='smile-circle' type='antdesign' color='#fca311' size={30} />
//                 <Text style={[mt_15, fw_bold, fs_semi_large]}>You has not started any chat yet!</Text>
//             </View>
//         )
//     }

//     function onSockMessage(response: ChatSession) {
//         try {
//             chatList.current.push(response)
//             refresh()


//         } catch (error) {
//             console.log('----- Chattab WS on msg error: ', error)
//         }
//     }

//     return (
//         <View style={styles.rootContainer}>
//             <SockJs
//                 url={APIService.buildDefaultEndpoint('/websocket')}
//                 topics={[`/user/${Global.User.CurrentUser.id}/notification/chat`]}
//                 onConnect={() => console.log('--- ws chattab: connected')}
//                 onDisconnect={() => console.log('--- ws chattab: disconnected')}
//                 onMessage={onSockMessage}
//                 onConnectFailure={(error: any) => console.log('error: ', error)}
//             />
//             <Text style={styles.title}>Support Chats</Text>
//             <View style={styles.mainSection}>
//                 <View style={[align_items_center, mt_10, mb_20]}>
//                     <View style={[Style.dimen(2, '20%'), Style.backgroundColor('#d9d9d9')]} />
//                 </View>
//                 {/* <ScrollView style={[flex_1]}>
//                     <ChatItem
//                         navigation={props.navigation}
//                         route={props.route}
//                     />
//                 </ScrollView> */}
//                 <FlatList
//                     style={flex_1}
//                     data={chatList.current}
//                     renderItem={renderItem}
//                     ListEmptyComponent={emptyListComponent}
//                 />
//             </View>
//         </View>
//     )
// }

// --------------------------------
// interface ChatItemProps {
//     navigation: any,
//     route: any,
//     chatSession: ChatSession
// }

// function ChatItem(props: ChatItemProps) {

//     const partner: GraphQLService.Type.User = (Global.User.CurrentUser.isRegularUser()) ? props.chatSession.deliveryPackage.user : props.chatSession.deliveryPackage.shipper
//     const date = useRef<Date>()

//     useEffect(() => {
//         try {
//             date.current = new Date(Date.parse(props.chatSession.createdDate))
//         } catch (error) {

//         }

//     }, [])


//     function openChatScreen() {
//         props.navigation.navigate('ChatScreen', {
//             sessionId: props.chatSession.id,
//             partner
//         })
//     }

//     return (
//         <TouchableNativeFeedback onPress={openChatScreen}>
//             <View style={styles.chatItemContainer}>
//                 <Avatar
//                     source={{ uri: partner?.profilePictureUrl }}
//                     size={50}
//                     avatarStyle={Style.borderRadius(10)}
//                 />
//                 <ListItem.Content style={[{ flexGrow: 1 }, ml_10]}>
//                     <ListItem.Title style={fw_bold}>{partner.firstName + ' ' + partner.lastName}</ListItem.Title>
//                     <ListItem.Subtitle>{date.current?.toUTCString()}</ListItem.Subtitle>
//                 </ListItem.Content>
//                 <View style={[align_items_center, justify_center]}>
//                     <View style={styles.chatItemBadge}>
//                         <Text style={styles.chatItemBadgeText}>1</Text>
//                     </View>
//                 </View>
//             </View>
//         </TouchableNativeFeedback>
//     )
// }

// --------------------------------

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#00afb9',
        paddingTop: StatusBar.currentHeight
    },

    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 25,
        marginLeft: 25
    },

    mainSection: {
        backgroundColor: '#fff',
        flex: 1,
        marginTop: 20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },

    chatItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8
    },

    chatItemBadge: {
        borderRadius: 8,
        backgroundColor: '#ff373a',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },

    chatItemBadgeText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    }
})