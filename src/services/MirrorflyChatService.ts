import MirrorflySDK from "../../MirrorflySDK/SDK";
import { Global } from "../Global";

type LooseObject = {
    [key: string]: any
}

export namespace MirrorflyService {
    let STARTER_INSTANCE: Starter | undefined = undefined
    const callbackListenersObj: LooseObject = {}

    const initializeObj = {
        //apiBaseUrl: `https://api-preprod-sandbox.mirrorfly.com/api/v1`,
        licenseKey: `TnnRoMQ0YuBDKTSJfyzMXiNNp6Hk7f`,
        callbackListeners: callbackListenersObj,
    };

    class Starter {
        private _initialized: boolean = false

        get intitialized() { return this._initialized }

        private async initializeSDK(onInitialized: () => void, onFailure: (res: MirrorflyServiceTypes.IniResponse) => void, onError?: (error?: any) => void) {
            try {
                if (!this._initialized) {
                    const response: MirrorflyServiceTypes.IniResponse = await MirrorflySDK.initializeSDK(initializeObj);
                    if (response.statusCode === 200) {
                        this._initialized = true
                        console.log('>>>>>>>>>> res ini: ', response)
                        onInitialized()
                    } else
                        onFailure(response)
                } else {
                    onInitialized()
                }
            } catch (error) {
                onError?.(error)
            }
        }

        private async registerUser(userId: string) {
            const response = await MirrorflySDK.register(userId);
            console.log('>>>>>>>>>> response reg user: ', response)
        }

        private preStartChores() {
            this.initializeSDK(
                () => {
                    console.log('>>>>>>>>> initialized')
                    MirrorflySDK.register('10')
                        .then(res => console.log('>>>>>> res reg: ', res))
                        .catch(error => console.log('>>>>>> res reg error: ', error))
                },
                () => console.log('>>>>>>>>>>>>> failure '),
                (error) => console.log('>>>>>>>>>>>>> error: ', error)
            )
        }

        constructor() {
            this.preStartChores()
        }
    }

    /**
     * Listeners are only added once, new values will be ignore
     * @param listeners 
     * @returns a Starter instance
     */
    export function getStarter(...listeners: { name: MirrorflyServiceTypes.ListenerName, callback: MirrorflyServiceTypes.ListenerCallback }[]) {
        if (!STARTER_INSTANCE) {
            for (let listener of listeners)
                callbackListenersObj[listener.name] = listener.callback
            STARTER_INSTANCE = new Starter()
        }
        return STARTER_INSTANCE
    }

}

export namespace MirrorflyServiceTypes {
    export type BaseResponse = {
        statusCode: number,
        message: string
    }

    export type IniResponse = BaseResponse

    export type UserRegistrationResponse = BaseResponse & {
        data?: {
            username: string,
            password: string
        }
    }

    export type ListenerCallback = (res: Response) => void

    export type ListenerName =
        'connectionListener'
        | 'presenceListener'
        | 'friendsListListener'
        | 'userProfileListener'
        | 'messageListener'
        | 'replyMessageListener'
        | 'favouriteMessageListener'
        | 'groupProfileListener'
        | 'groupMsgInfoListener'
        | 'mediaUploadListener'
        | 'blockUserListener'
        | 'singleMessageDataListener'
        | 'muteChatListener'
        | 'archiveChatListener'
        | 'userDeletedListener'
        | 'adminBlockListener'
}