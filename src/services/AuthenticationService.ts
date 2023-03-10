import axios, { AxiosError } from "axios";
import { APIService } from "./APIService";
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { DeviceEventEmitter } from "react-native";

export namespace AuthenticationService {
    export function login(phone: string, password: string, onLogInSuccessfully?: (response: LogInResponse) => void, onLogInFailure?: (error?: AxiosError | string) => void) {
        const data = JSON.stringify({
            "phone": phone,
            "password": password
        });

        console.log(`------ phone: ${phone}`)
        console.log(`------ pass: ${password}`)

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: APIService.buildDefaultEndpoint('/api/auth/login'),
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                if (response.status === 200)
                    onLogInSuccessfully?.(response.data as LogInResponse)
                else
                    onLogInFailure?.(`Expected code 200 but recieved ${response.status} instead`)
            })
            .catch(function (error) {
                console.log(error);
                onLogInFailure?.(error)
            });
    }

    export type LogInResponse = {
        accessToken: string,
        tokenType: string,
        userType: string,
        id: number
    }

    export function verifyToken(accessToken: string,
        onVerifySuccess?: () => void,
        onVerifyFailure?: (error?: any) => void) {

        var data = JSON.stringify({
            "accessToken": accessToken
        });

        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: APIService.buildDefaultEndpoint('api/auth/verifyAccessToken'),
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                if (response.data?.isValid === true)
                    onVerifySuccess?.()
                else
                    onVerifyFailure?.()
            })
            .catch(function (error) {
                onVerifyFailure?.(error)
                console.log(error);
            });
    }

    async function createRetrivableCredential(loginResponse: LogInResponse) {
        return (testCredential(loginResponse)) ? JSON.stringify(loginResponse) : undefined
    }

    function testCredential(loginResponse: LogInResponse) {
        if (loginResponse.accessToken.length === 0)
            return false
        if (loginResponse.userType.length === 0)
            return false
        if (loginResponse.tokenType.length === 0)
            return false
        return true
    }

    export function securelySaveCredential(loginResponse: LogInResponse, onSaved?: () => void, onSaveFailure?: (error: any) => void) {
        createRetrivableCredential(loginResponse)
            .then(credential => {
                if (credential) {
                    RNSecureKeyStore.set('credential', credential, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
                        .then((res) => {
                            onSaved?.()
                        }, (err) => {
                            onSaveFailure?.(err)
                        })
                } else {
                    onSaveFailure?.("Invalid [loginResponse]")
                }
            })
    }

    function retriveSavedCredential() {
        return RNSecureKeyStore.get('credential')
            .then((credential: string) => {
                try {
                    const loginResponse: LogInResponse = JSON.parse(credential)
                    return loginResponse
                } catch (error) {
                    throw 'invalid saved credential'
                }
            })
    }

    export function loginWithSavedCredential(onLogInSuccess?: (loginInfo: LogInResponse) => void, onLogInFailure?: (error?: any) => void) {
        retriveSavedCredential()
            .then((loginResponse) => {
                verifyToken(loginResponse.accessToken,
                    () => onLogInSuccess?.(loginResponse),
                    () => onLogInFailure?.())
            })
            .catch(error => {
                onLogInFailure?.(error)
            })
    }

    export function logout(onLogOutSuccess?: () => void, onLogOutFailure?: (error?: any) => void) {
        RNSecureKeyStore.remove('credential')
            .then(() => onLogOutSuccess?.())
            .catch((error) => onLogOutFailure?.(error))
        DeviceEventEmitter.emit('event.app.authenticationState', false)
    }
}