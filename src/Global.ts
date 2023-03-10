import NetInfo from "@react-native-community/netinfo"
import FilterChain, { Filter } from "./services/FilterChain"
import { ApolloClient } from '@apollo/client'

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
            REGULAR_USER,
            SHIPPER
        }

        class User {
            // type: Type = Type.ANONYMOUS
            private _type: Type = Type.SHIPPER
            id: number

            setType(type: string) {
                type = type.trim().toLowerCase()

                if (['shipper', 'driver', 'role_shipper', 'role_driver'].includes(type))
                    this._type = Type.SHIPPER
                else if (['user', 'regular_user', 'role_user'].includes(type))
                    this._type = Type.REGULAR_USER
            }

            get type() {
                return this._type
            }

            isRegularUser() {
                return this._type === Type.REGULAR_USER
            }
            isShipper() {
                return this._type === Type.SHIPPER
            }
        }

        export const CurrentUser = new User()
    }

    export namespace DEFAULT_ENDPOINT {
        export const ORIGIN = '10.0.2.2'
        export const PORT = '8080'
        export const PROTOCOL = 'http'
        let accessToken: string = ''
        export function ACCESS_TOKEN() {
            return accessToken;
        }
        export function SET_ACCESS_TOKEN(value: string) {
            value = value.trim()
            if (value === '')
                throw "Invalid access token"

            accessToken = value
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

    export namespace GraphQL {
        let _client: ApolloClient<any> | undefined = undefined

        export function getClient() {
            return _client
        }

        export function setClient(client: ApolloClient<any>) {
            if (!client)
                throw 'Null ApolloClient is not allowed'

            _client = client
        }
    }
}

//Global.DefaultFilterChain.Internet.doFilter()