export default class Validator {
    static TYPE = {
        PHONE: {
            VN: /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/ // vietnamese formats
        },
        PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        // Minimum eight characters, at least one letter and one number:
    }

    static validate(validateType: RegExp, testAgainst: string,
        onValidCallback?: () => void, onInvalidCallback?: () => void) {

        const result: boolean = validateType.test(testAgainst);
        (result) ? onValidCallback?.() : onInvalidCallback?.()
    }
}
