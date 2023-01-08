import Validator from "../utils/Validator"
import { ToastAndroid } from 'react-native';
import { delay } from "../utils/ultilities";

type void_func = () => void

export interface LoginConfig {
    phone: string
    password: string
    onLoginSuccess?: void_func
    onLoginFail?: void_func
    onLoginStart?: void_func
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
        await delay(2000)
        return true
    }

    static login(config: LoginConfig) {
        const { onLoginSuccess, onLoginFail, onLoginStart, onLoginEnd } = config

        Authenticate.validateLogin(config).then(success => {
            if (!success) {
                onLoginFail?.()
                return
            }

            onLoginStart?.()

            Authenticate.callAPI().then(success => {
                onLoginEnd?.();
                (success) ? onLoginSuccess?.() : onLoginFail?.()
            })
        }).catch(reason => onLoginFail?.())

        ToastAndroid.show('Login successfully', 1000)
    }

    static signup() {

    }

    static resetPassword() {

    }
}
