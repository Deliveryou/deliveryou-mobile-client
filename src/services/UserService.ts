import axios, { AxiosError, AxiosResponse } from "axios";
import { Global } from "../Global";
import { APIService } from "./APIService";
import { GraphQLService } from "../services/GraphQLService";

export namespace UserService {
    let registerOnlineStatus: boolean = false
    let interval: NodeJS.Timer | undefined = undefined

    export function registerAsActive(onSuccess?: (res: AxiosResponse) => void, onFailure?: (error?: AxiosError) => void) {
        if (registerOnlineStatus === false) {
            registerOnlineStatus = true

            if (interval)
                clearInterval(interval);

            function ifFailed() {
                registerOnlineStatus = false
                if (interval)
                    clearInterval(interval)
            }

            iAm('online', onSuccess, () => {
                ifFailed()
                onFailure?.()
            })

            interval = setInterval(() =>
                iAm('online', onSuccess, () => {
                    ifFailed()
                    onFailure?.()
                }),
                9500
            )
        }
    }

    export function registerAsInactive(onSuccess?: () => void, onFailure?: (error?: AxiosError) => void) {
        iAm("offline",
            () => {
                registerOnlineStatus = false
                if (interval)
                    clearInterval(interval)
                onSuccess?.()
            },
            () => onFailure?.()
        )
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

    export type LooseObject = {
        [key: string]: any
    }

    export function phoneExists(phoneNumber: string, onResponse?: (exists: boolean) => void, onFailure?: (error: any) => void) {
        APIService.axios(`/api/user/can-use-phone/${phoneNumber}`)
            .then(response => response.data as { exists: boolean })
            .then(data => onResponse?.(data.exists))
            .catch(error => onFailure?.(error))
    }

    export function verifyPassword(userId: number, password: string, onResponse?: (matched: boolean) => void, onFailure?: (error: any) => void) {
        const body = {
            userId,
            password
        }
        const headers = {
            'Content-Type': 'application/json'
        }
        APIService.axios('/api/user/verify-password', 'post', body, headers)
            .then(response => response.data as { matched: boolean })
            .then(data => onResponse?.(data.matched))
            .catch(error => onFailure?.(error))
    }

    export function updateProfilePhoto(profilePhotoUrl: string, onResponse?: (updated: boolean) => void, onFailure?: (error: any) => void) {
        updateUser(
            {
                id: Global.User.CurrentUser.id,
                profilePictureUrl: profilePhotoUrl
            },
            onResponse,
            onFailure
        )
    }

    export function updateUser(updatedUser: GraphQLService.Type.User | LooseObject, onResponse?: (updated: boolean) => void, onFailure?: (error: any) => void) {
        const body = updatedUser
        const headers = {
            'Content-Type': 'application/json'
        }
        APIService.axios('/api/user/update-user', 'post', body, headers)
            .then(response => response.data as { updated: boolean })
            .then(data => onResponse?.(data.updated))
            .catch(error => onFailure?.(error))
    }
}