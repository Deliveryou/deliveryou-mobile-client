import { Global } from "../Global"

export default class Address {
    street: string = ''
    ward: string = ''
    district: string = ''
    province: string = ''
    country?: string = Global.DefaultValue.Address.Country
    countryCode?: string = Global.DefaultValue.Address.CountryCode
    longitude: string = '0.0'
    latitude: string = '0.0'
}