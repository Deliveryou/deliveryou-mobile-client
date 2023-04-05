import { View, Text, StyleSheet, StatusBar, ToastAndroid, Alert } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, Button, Icon, ListItem } from '@rneui/themed'
import { align_items_center, bg_black, bg_danger, bg_transparent, border_radius_pill, flex_1, fs_large, fw_bold, ml_10, px_10, px_5, py_10, py_5, Style, w_100 } from '../../../../stylesheets/primary-styles'
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import { GiftedChat, IMessage, InputToolbar, InputToolbarProps } from 'react-native-gifted-chat'
import uuid from 'react-native-uuid'
import { Global } from '../../../../Global'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { GraphQLService } from '../../../../services/GraphQLService'
import { ChatService, ChatServiceTypes } from '../../../../services/ChatService'
import { throttleFunc } from '../../../../utils/ultilities'
import { WebSocketService } from '../../../../services/WebsocketService'
import { instanceOf } from 'prop-types'

type DocumentData = FirebaseFirestoreTypes.DocumentData

export default function ChatScreen({ route, navigation }) {
    const [_refresh, setRefresh] = useState(0)

    const refresh = () => setRefresh(value => value + 1)
    const partner: WebSocketService.WSChatUser = route.params.partner

    useEffect(() => {
        console.log('---- partner: ', route.params?.partner)
        console.log('---- session: ', route.params?.sessionId)
        if (!route.params?.sessionId) {
            ToastAndroid.show('Cannot open this chat', ToastAndroid.LONG)
            navigation.goBack()
            return
        }

        ChatService.enableLogs()
        ChatService.setObservableCollectionId(`${route.params.sessionId}`)

    }, [])

    return (
        <View style={styles.rootContianer}>
            <ListItem containerStyle={bg_transparent}>
                <Avatar
                    rounded
                    source={{ uri: partner.profilePictureUrl }}
                    size={35}
                />
                <ListItem.Content style={[{ flexGrow: 1 }]}>
                    <ListItem.Title style={[fw_bold, fs_large]}>{partner.firstName + ' ' + partner.lastName}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            <View style={styles.mainSection}>
                <View style={styles.mainChatArea}>
                    <ChatArea
                        navigation={navigation}
                        route={route}
                    />
                </View>
            </View>
        </View>
    )
}

// -----------------------------------------------
interface ChatAreaProps {
    navigation: any,
    route: any,
    onLoadingPreviousChat?: () => void,
    onLoadedPreviousChat?: () => void
}

export function ChatArea(props: ChatAreaProps) {
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {

        // setMessages([
        //     {
        //         _id: 1,
        //         text: 'Hello developer',
        //         createdAt: new Date(),
        //         user: {
        //             _id: 2,
        //             name: 'React Native',
        //             avatar: 'https://placeimg.com/140/140/any',
        //         },
        //     },
        // ])

        let unsub: (() => void) | undefined = undefined

        function onCollectionExists(service: ChatService.UsableChatServiceType) {
            props.onLoadingPreviousChat?.()
            // service.allDocs(
            //     (snapshots) => {
            //         const list = snapshots.map(snap => {
            //             const doc = snap.data() as ChatServiceTypes.ChatDocument
            //             return {
            //                 _id: uuid.v4(),
            //                 createdAt: new Date(doc.createdAt),
            //                 text: doc.text,
            //                 user: {
            //                     _id: (doc.userId !== Global.User.CurrentUser.id) ? 2 : 1
            //                 }
            //             } as IMessage
            //         })
            //         setMessages(list)
            //         props.onLoadedPreviousChat?.()
            //     },
            //     (error) => {
            //         Alert.alert(
            //             "Server communication issues",
            //             "Cannot load previous chats",
            //             [{ text: 'OK', onPress: () => props.navigation.goBack() }]
            //         )
            //     }
            // )

            function generateMessageId() {
                return parseInt(`${Math.floor(Math.random() * (10 ** 3))}${Date.now()}`)
            }

            service.enableOnSnapshot()
            unsub = service.disableOnSnapshot
            service.addSnapshotListener(new ChatService.Listener(
                (snapshot) => {
                    console.log('------ docs: ', snapshot.docChanges().map(doc => doc.doc.data()))
                    const list = snapshot.docChanges()
                        .filter(doc => {
                            const chatDoc = doc.doc.data() as ChatServiceTypes.ChatDocument
                            if (chatDoc.userId === Global.User.CurrentUser.id)
                                return false
                            return true
                        })
                        .map(doc => {
                            const chatDoc = doc.doc.data() as ChatServiceTypes.ChatDocument
                            //console.log('>>>>>>>>>>>>> id: ', chatDoc._id)
                            return {
                                _id: Date.now(),
                                createdAt: new Date(chatDoc.createdAt),
                                text: chatDoc.text,
                                user: {
                                    _id: (chatDoc.userId !== Global.User.CurrentUser.id) ? 2 : 1
                                }
                            } as IMessage
                        })
                    setMessages(currentList => [...currentList, ...list])
                },
                (error) => console.log('------ docs error: ', error)
            ))
        }

        ChatService.usableService(
            (service) => {
                service.collectionExists(
                    // exists
                    () => onCollectionExists(service),
                    () => {
                        // not exist
                        service.add(
                            {
                                text: 'Send a message to start chat',
                                createdAt: Date.now(),
                                user: {
                                    _id: 2
                                },
                                userId: Number.MAX_VALUE
                            } as ChatServiceTypes.ChatDocument,
                            (data) => onCollectionExists(service),
                            (error) => {
                                ToastAndroid.show('Cannot connect to chat service', ToastAndroid.LONG)
                                props.navigation.goBack()
                            }
                        )
                    },
                    (error) => console.log('---- Col exists error: ', error)
                )
            },
            (error) => {
                ToastAndroid.show('Chat service has not been initialized', ToastAndroid.LONG)
                console.log('------ snap error: ', error)
            }
        );


        return () => {
            if (unsub)
                unsub()
        }
    }, [])

    const onSend = useCallback((messages: IMessage[] = []) => {
        const timeout = setTimeout(() => ToastAndroid.show('Taking too long to send your message', ToastAndroid.LONG), 3000)
        ChatService.usableService(
            (service) => {
                const message = messages[0]
                service.add(
                    {
                        _id: uuid.v4(),
                        text: message.text,
                        createdAt: (typeof message.createdAt === 'number') ? message.createdAt : message.createdAt.getTime(),
                        user: {
                            _id: message?.user?._id
                        },
                        //createAt: new Date().toUTCString(),
                        userId: Global.User.CurrentUser.id
                    },
                    (data) => {
                        console.log('------ data added')
                        clearTimeout(timeout)
                        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
                    },
                    (error) => {
                        console.log('------ error: ', error)
                        ToastAndroid.show('Message has not been sent', ToastAndroid.LONG)
                    }
                )
            },
            (error) => ToastAndroid.show('Chat service has not been initialized', ToastAndroid.LONG)
        );
    }, [])

    return (
        <>
            <GiftedChat
                renderInputToolbar={CustomInputToolbar}
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
        </>
    )
}

function CustomInputToolbar(props: InputToolbarProps<IMessage>) {
    return (
        <InputToolbar
            {...props}
            accessoryStyle={bg_black}
            containerStyle={{
                paddingHorizontal: 10,
                paddingBottom: 5,
            }}

            renderSend={props => {
                return (
                    (props.text && props.text.trim().length > 0) ?
                        <Button
                            color='#00afb9'
                            containerStyle={border_radius_pill}
                            buttonStyle={Style.dimen(40, 40)}
                            onPress={() => props.onSend?.({
                                _id: uuid.v4() as string,
                                createdAt: new Date(),
                                text: props.text,
                                user: {
                                    _id: Global.User.CurrentUser.id,
                                }
                            }, true)}
                        >
                            <Icon name='send' type='fontawesome' color={'#fff'} />
                        </Button>
                        : null
                )
            }
            }
        />
    )
}

// -----------------------------------------------

const styles = StyleSheet.create({
    rootContianer: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#00afb9',
        flex: 1
    },

    mainSection: {
        backgroundColor: '#fff',
        flex: 1,
        marginTop: 5,
        borderRadius: 20,
        marginHorizontal: 10,
        marginBottom: 10,
        overflow: 'hidden'
    },

    mainChatArea: {
        flexGrow: 1,
    },

    chatBottomArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10
    },

    chatInput: {
        backgroundColor: '#dee2e6',
        flex: 1,
        marginRight: 10,
        borderRadius: 45 / 2,
        paddingHorizontal: 10,
    }

})