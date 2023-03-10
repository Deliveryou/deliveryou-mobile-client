import axios, { AxiosError, AxiosResponse } from "axios";
import { Global } from "../Global";
import { APIService } from "./APIService";

export namespace UserService {
    let registerOnlineStatus: boolean = false
    let interval: NodeJS.Timer | undefined = undefined

    export function registerAsActive(onSuccess?: (res: AxiosResponse) => void, onFailure?: (error: AxiosError) => void) {
        if (registerOnlineStatus === false) {
            registerOnlineStatus = true

            if (interval)
                clearInterval(interval)

            iAm('online', onSuccess, onFailure)
            interval = setInterval(() => iAm('online', onSuccess, onFailure), 9500)
        }
    }

    export function registerAsInactive(onSuccess?: (res: AxiosResponse) => void, onFailure?: (error: AxiosError) => void) {
        registerOnlineStatus = false
        if (interval)
            clearInterval(interval)
    }

    export function iAm(mode: 'online' | 'offline' = 'online', onResponse?: (response: AxiosResponse) => void, onError?: (error: any) => void) {
        const subdr = (mode === "online") ? `/api/user/i-am-online/` : `/api/user/i-am-offline/`
        APIService.axios(subdr + Global.User.CurrentUser.id)
            .then(reponse => onResponse?.(reponse))
            .catch(error => onError?.(error))
    }

    export class RegularUser {
        private constructor() { }
    }

    export class Shipper {
        private constructor() { }

    }
}