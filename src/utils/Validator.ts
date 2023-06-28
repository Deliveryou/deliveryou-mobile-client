export default class Validator {
    static TYPE = {
        PHONE: {
            VN: /^(\+84|0)(3[2-9]|7[06789]|8[1-9]|5[689]|9[0-9])\d{7}$/, // vietnamese formats
            COUNTRY_CODE_VN: /^(\+84)(3[2-9]|7[06789]|8[1-9]|5[689]|9[0-9])\d{7}$/ // vietnamese formats,
        },
        PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        // Minimum eight characters, at least one letter and one number:
    }

    static validate(validateType: RegExp, testAgainst: string,
        onValidCallback?: () => void, onInvalidCallback?: () => void) {

        const result: boolean = validateType.test(testAgainst);
        (result) ? onValidCallback?.() : onInvalidCallback?.()
    }

    /**
     * +84/0 -> 0
     */
    static validatePhoneToCountryCode(phone: string, onValid: (phone: string) => void, onInvalid?: () => void) {
        this.validate(
            this.TYPE.PHONE.VN,
            phone,
            () => {
                if (phone.charAt(0) === '0') {
                    phone = '+84' + phone.substring(1)
                }
                onValid(phone)
            },
            onInvalid
        )
    }
}
