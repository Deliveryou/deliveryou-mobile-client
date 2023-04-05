import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import Queue from '../data_structures/Queue'
import uuid from 'react-native-uuid'
import { debounce, throttle, throttleFunc } from "../utils/ultilities";

export namespace ChatService {
    type DocumentData = FirebaseFirestoreTypes.DocumentData
    type SnapshotCallBack = (snapshot: FirebaseFirestoreTypes.QuerySnapshot<DocumentData>) => void

    let observableRootDoc = firestore().collection('Chats').doc('UTtCaIZ4I1jMbm1JxP9G')
    let observableCollectionId: string = ''
    let usableInstance: UsableChatService | undefined = undefined
    let _enabledLogs = false

    const waitLine = new Queue<(service: UsableChatService) => void>()

    export class Listener {
        readonly id: string
        private readonly _snapshotCallback: SnapshotCallBack
        private readonly _errorCallback?: (error: any) => void
        private _enabled: boolean = true

        constructor(snapshotCallback: SnapshotCallBack, errorCallback?: (error: any) => void, enabled: boolean = true) {
            this._snapshotCallback = snapshotCallback
            this._errorCallback = errorCallback
            this._enabled = enabled
            this.id = uuid.v4().toString()
        }

        disable() {
            this._enabled = false
        }

        enable() {
            this._enabled = true
        }

        get snapshotCallback() {
            return (this._enabled) ? this._snapshotCallback : undefined
        }

        get errorCallback() {
            return (this._enabled) ? this._errorCallback : undefined
        }
    }

    export type UsableChatServiceType = UsableChatService

    class UsableChatService {

        private observaleCollection(requestFrom?: string) {
            try {
                log(() => requestFrom != undefined, `[UsableChatService:observaleCollection] accessed by [${requestFrom}]`)
                return observableRootDoc.collection(observableCollectionId)
            } catch (error) {
                log(null, `[UsableChatService:observaleCollection] error: `, error)
                throw '[observaleCollection error]'
            }
        }

        /**
         * Add a new DocumentData object to the firestore collection
         * @param data a DocumentData object to add
         * @param onSuccess 
         * @param onFailure 
         */
        add(data: DocumentData, onSuccess?: (data: FirebaseFirestoreTypes.DocumentReference<DocumentData>) => void, onFailure?: (error: any) => void) {
            this.observaleCollection('UsableChatService:add').add(data)
                .then(reponseDoc => {
                    log(null, '[UsableChatService:add] before adding a new document')
                    onSuccess?.(reponseDoc)
                    log(null, '[UsableChatService:add] added a new document')
                })
                .catch(error => {
                    log(null, '[UsableChatService:add] failed to add a new document: ', error)
                    onFailure?.(error)
                })
        }

        private unsubscribeSnapshot?: () => void = undefined
        private readonly snapshotListeners: Listener[] = []

        // /**
        //  * Attaches a listener for QuerySnapshot events.
        //  * @returns an unsubscribe function to stop listening to events.
        //  */
        // konSnapshot(onNext: (snapshot: FirebaseFirestoreTypes.QuerySnapshot<DocumentData>) => void, onError?: (error: Error) => void) {
        //     return this.observaleCollection.onSnapshot(onNext, onError)
        // }

        /**
         * Document id will be added to the set after a callback is called.
         * The purpose is to ensure the callback ony called once
         * This is a temporal fix -> (O)n = n
         */
        readonly snapshotMetaList: FirebaseFirestoreTypes.SnapshotMetadata[] = []

        enableOnSnapshot() {

            if (!this.unsubscribeSnapshot) {
                console.log('---- snap called')
                this.unsubscribeSnapshot = this.observaleCollection('UsableChatService:enableOnSnapshot').onSnapshot(
                    (snapshot) => {
                        const lastSnap = this.snapshotMetaList[this.snapshotMetaList.length - 1]
                        if (lastSnap && snapshot.metadata.isEqual(lastSnap)) {
                            return
                        }

                        log(null, `[UsableChatService:enableOnSnapshot] snapshot callbacks invoked [${Date.now().toString()}]`)

                        for (let i = 0; i < this.snapshotListeners.length; i++) {
                            this.snapshotListeners?.[i]?.snapshotCallback?.(snapshot)
                            console.log('>>>> called')
                        }
                        // this.snapshotListeners?.[0]?.snapshotCallback?.(snapshot)
                        // console.log('>>>> called')
                        this.snapshotMetaList.push(snapshot.metadata)

                    },
                    (error) => {
                        log(null, '[UsableChatService:enableOnSnapshot] error, calling error listeners: ', error)
                        for (let listener of this.snapshotListeners)
                            listener?.errorCallback?.(error)
                    }
                )
                console.log('>>>>>>>>>>>>>>>>>> unsub: ', this.unsubscribeSnapshot)
                return true
            }
            return false
        }

        disableOnSnapshot() {
            if (this.unsubscribeSnapshot !== undefined) {
                this.unsubscribeSnapshot()
                this.unsubscribeSnapshot = undefined
                log(null, '[UsableChatService:disableOnSnapshot] disabled onSnapshot')
                return true
            }
            log(null, '[UsableChatService:disableOnSnapshot] cannot disable onSnapshot')
            return false
        }

        addSnapshotListener(listener: Listener) {
            this.snapshotListeners.push(listener)
            log(null, '[UsableChatService:addSnapshotListener] added a new snapshot listener')
        }

        removeSnapshotListener(listenerId: string) {
            for (let i = 0; i < this.snapshotListeners.length; i++)
                if (this.snapshotListeners[i].id === listenerId) {
                    delete this.snapshotListeners[i]
                    log(null, `[UsableChatService:removeSnapshotListener] snapshot with id=${listenerId} is removed`)
                    return
                }
            //log(null, `[UsableChatService:removeSnapshotListener] failed to remove snapshot with id=${listenerId}`)
        }

        collectionExists(onExist: () => void, onNotExist?: () => void, onError?: (error: any) => void) {
            this.observaleCollection('UsableChatService:collectionExists').get()
                .then(snapshot => {
                    // collection empty/not exist
                    if (snapshot.size === 0) {
                        log(null, '[UsableChatService:collectionExists] collection is empty/non-exist')
                        onNotExist?.()
                    } else {
                        log(null, '[UsableChatService:collectionExists] collection exists')
                        onExist()
                    }
                })
                .catch(error => {
                    log(null, '[UsableChatService:collectionExists] error: ', error)
                    onError?.(error)
                })
        }

        allDocs(onGetAll: (documentSnapshots: FirebaseFirestoreTypes.QueryDocumentSnapshot<DocumentData>[]) => void, onError?: (error: any) => void) {
            this.observaleCollection('UsableChatService:allDocs').get()
                .then(snapshot => {
                    const list = snapshot.docs.splice(1)
                    onGetAll(list)
                    log(null, '[UsableChatService:collectionExists:allDocs] get all docs')
                })
                .catch(error => {
                    log(null, '[UsableChatService:collectionExists:allDocs] error: ', error)
                    onError?.(error)
                })
        }

    }

    export function setObservableCollectionId(id: string) {
        if ((observableCollectionId === '' || usableInstance === undefined)) {
            observableCollectionId = id
            usableInstance = new UsableChatService()
            console.log(`[ChatService:setObservableCollectionId] collection is set id=${id}`)

            while (waitLine.size > 0) {
                const fun = waitLine.dequeue()
                if (fun) {
                    fun(usableInstance)
                    this.log(null, '[ChatService:setObservableCollectionId] listener waitline is called')
                }
            }
        }

        return usableInstance
    }

    /**
     * @returns a Promise contains the UsableChatService instance
     * @throws a promise error if [ObservableCollectionId] is not set
     */
    async function getUsableServie() {
        if (usableInstance === undefined) {
            throw '[Observable Collection Id] has not been set'
            console.log('---- threw exp')
        }
        return usableInstance
    }

    /**
     * If the [UsableChatService] is unavailable, the onUsable callback will be saved in a waitline.
     * 
     * When the serivce is back ready, each callback will be triggered again
     */
    export function usableService(onUsable: (service: UsableChatService) => void, onUnusable?: (error: any) => void) {
        getUsableServie()
            .then(service => {
                onUsable(service)
            })
            .catch(error => {
                waitLine.enqueue(onUsable)
                onUnusable?.(error)
            })
    }

    function log(condition: (() => boolean) | null | undefined, ...text: any[]) {
        const _condition = (condition) ? condition : true
        if (_enabledLogs && text.length > 0 && _condition) {
            console.log(...text)
        }
    }

    export function enableLogs(enabled: boolean = true) {
        _enabledLogs = enabled
    }
}

export namespace ChatServiceTypes {
    export interface IniChatDocument {
        ini: boolean
    }

    export interface ChatDocument {
        _id?: string
        createdAt: number,
        text: string,
        user: {
            _id: number
        }
        userId: number
    }
}

