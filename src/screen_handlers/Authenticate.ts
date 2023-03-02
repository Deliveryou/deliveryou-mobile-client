import Validator from "../utils/Validator"
import { ToastAndroid } from 'react-native';
import { delay } from "../utils/ultilities";
import { AuthenticationService } from "../services/AuthenticationService";

type void_func = () => void

export interface LoginConfig {
    phone: string
    password: string
    onLoginSuccess?: (response: AuthenticationService.LogInResponse) => void,
    onLoginFail?: (reason: any) => void,
    onLoginStart?: () => Promise<void>,
    onLoginEnd?: void_func
    onValidatePass?: void_func
    onValidateFail?: void_func
    onValidatePhonePass?: void_func
    onValidatePasswordPass?: void_func
    onValidatePhoneFail?: void_func
    onValidatePasswordFail?: void_func
}

export class Authenticate {
    private static async validateLogin(config: LoginConfig): Promise<boolean> {
        const { phone, password, onValidatePass, onValidateFail,
            onValidatePhonePass, onValidatePasswordPass, onValidatePhoneFail, onValidatePasswordFail, } = config

        let bothValid = true

        console.log(config.phone + ' - ' + config.password)

        Validator.validate(Validator.TYPE.PHONE.VN, phone, () => {
            onValidatePhonePass?.()
        }, () => {
            bothValid = false
            onValidatePhoneFail?.()
        })

        Validator.validate(Validator.TYPE.PASSWORD, password, () => {
            onValidatePasswordPass?.()
        }, () => {
            bothValid = false
            onValidatePasswordFail?.()
        });

        if (bothValid) {
            onValidatePass?.()
            return true
        }

        onValidateFail?.()
        return false
    }

    private static async callAPI() {
        await delay(1000)
        return true
    }

    static async login(config: LoginConfig) {
        const { phone, password, onLoginSuccess, onLoginFail, onLoginStart } = config

        Authenticate.validateLogin(config).then(async (success) => {
            if (!success) {
                //onLoginFail?.()
                return
            }

            await onLoginStart?.()
            AuthenticationService.login(phone, password, onLoginSuccess, onLoginFail)

        }).catch(reason => onLoginFail?.(reason))
    }

    static signup() {

    }

    static resetPassword() {

    }
}
