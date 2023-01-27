import NetInfo from "@react-native-community/netinfo"
import FilterChain, { Filter } from "./services/FilterChain"

export namespace Global {
    export namespace Color {
        export const DANGER_LIGHT = '#c9184a'
        export const DANGER_MEDIUM = '#a4133c'
        export const DANGER_DARK = '#800f2f'
        export const PRIMARY_THEME: string = '#25a18e'
        export const WHITE = '#f8f9fa'
        export const TEXT_DARK_1 = '#4a4e69'
    }

    export namespace DefaultValue {
        export const Address = {
            Country: 'Vietnam',
            CountryCode: 'VN'
        }
    }

    export namespace Screen {
        export namespace Home {
            export namespace Variable {
                export namespace TOP_IMAGE_BG_HEIGHT {
                    let value: number = 0
                    export const get = () => value
                    export const set = (newValue: number) => {
                        value = (value !== newValue) ? newValue : value
                    }
                }
                export namespace NAV_BAR_HEIGHT {
                    let value: number = 65
                    export const get = () => value
                    export const set = (newValue: number) => {
                        value = (value !== newValue) ? newValue : value
                    }
                }
            }
        }
    }

    export namespace User {
        export enum Type {
            REGULAR_USER = 'regular-user',
            SHIPPER = 'shipper',
            ANONYMOUS = 'anonymous'
        }

        class User {
            // type: Type = Type.ANONYMOUS
            type: Type = Type.REGULAR_USER

            isRegularUser() {
                return this.type === Type.REGULAR_USER
            }
            isShipper() {
                return this.type === Type.SHIPPER
            }
            isAnonymous() {
                return this.type === Type.ANONYMOUS
            }
        }

        export const CurrentUser = new User()
    }

    export namespace API {
        export namespace LocationIQ {
            const ACCESS_TOKEN = 'pk.064b929ae3a07985e0bfe488d648b455'

            export function buildEndPoint(latitude: number, longitude: number) {
                return `https://us1.locationiq.com/v1/reverse?key=${ACCESS_TOKEN}&lat=${latitude}&lon=${longitude}&format=json`
            }
        }
    }

    export namespace DefaultFilterChain {
        export namespace Internet {
            const CHAIN = new FilterChain()

            export const doFilter = CHAIN.comsumeAllFilter

            CHAIN.appendFilter(new Filter(
                "Internet Chain",
                () => {
                    return true
                }
            ))
        }
    }
}

//Global.DefaultFilterChain.Internet.doFilter()