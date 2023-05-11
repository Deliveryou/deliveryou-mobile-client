import { Global } from "../Global";
import { ApolloClient, gql, QueryOptions, OperationVariables } from '@apollo/client'
import User from "../entities/User";
import { ToastAndroid } from "react-native";

export namespace GraphQLService {
    export namespace Type {
        export type Promotion = {
            id: number
            promoCode: string
            description?: string
            discountPercentage: number
            maximumDiscountAmount: number
            applicablePrice: number
            expireDate?: string
        }

        export type User = {
            id: number,
            firstName: string,
            lastName: string,
            phone: string,
            citizenId?: string,
            profilePictureUrl?: string,
            dateOfBirth?: string
        }

        export type ChatSession = {
            user: User
            shipper: User
            channelUrl: string
            firstCreated: string
        }

        export type PackageType = {
            id: number,
            name: string
        }

        export type Address = {
            id: number
            latitude: number
            longitude: number
            displayName?: string
            country?: string
            countryCode?: string
        }

        export type DeliveryPackage = {
            id: number
            user: User
            shipper: User
            photoUrl: string
            promotion?: Promotion
            price: number
            senderAddress: Address
            recipientAddress: Address
            recipientName: string
            recipientPhone: string
            note?: string
            packageType: PackageType
            creationDate: string,
            status: PackageDeliveryStatus
        }

        export type PackageDeliveryStatus = {
            id: number,
            name: string
        }

        export type Wallet = {
            id: number
            shipper: User
            credit: number
            accountNumber?: string
            accountOwner?: string
            branch?: string
        }
    }

    export namespace Schema {
        export enum Query {
            userById = 'userById',
            applicablePromotion = 'applicablePromotion',
            chatSession = 'chatSession'
        }

        export enum User {
            id = 'id',
            firstName = 'firstName',
            lastName = 'lastName',
            phone = 'phone',
            citizenId = 'citizenId',
            profilePictureUrl = 'profilePictureUrl',
            dateOfBirth = 'dateOfBirth'
        }

        export enum Promotion {
            id = 'id',
            promoCode = 'promoCode',
            description = 'description',
            discountPercentage = 'discountPercentage',
            maximumDiscountAmount = 'maximumDiscountAmount',
            applicablePrice = 'applicablePrice',
            expireDate = 'expireDate'
        }

        export enum ChatSession {
            user = 'user',
            shipper = 'shipper',
            channelUrl = 'channelUrl',
            firstCreated = 'firstCreated'
        }

        export enum PackageType {
            id = 'id',
            name = 'name'
        }

        export enum Address {
            id = 'id',
            latitude = 'latitude',
            longitude = 'longitude',
            displayName = 'displayName',
            country = 'country',
            countryCode = 'countryCode'
        }

        export enum DeliveryPackage {
            id = 'id',
            user = 'user',
            shipper = 'shipper',
            photoUrl = 'photoUrl',
            promotion = 'promotion',
            price = 'price',
            senderAddress = 'senderAddress',
            recipientAddress = 'recipientAddress',
            recipientName = 'recipientName',
            recipientPhone = 'recipientPhone',
            note = 'note',
            packageType = 'packageType',
            creationDate = 'creationDate'
        }
    }

    function getGlobalClient() {
        const client = Global.GraphQL.getClient()
        if (!client)
            throw 'Apollo Client has not been set'

        return client
    }

    interface QueryParamter {
        paramName: string,
        paramValue: any
    }

    interface QueryOption {
        queryName: string,
        params: QueryParamter[]
    }

    function buildQueryName(queryOption: QueryOption) {
        return queryOption.params.map(value => `${value.paramName}: ${value.paramValue}`).join(', ')
    }

    function buildQueryFieldsToFetch(fieldsToFetch: any[]) {
        return fieldsToFetch.map(value => '' + value).join(' ')
    }

    function buildQuery(queryOption: QueryOption, fieldsToFetch: any[]): QueryOptions<OperationVariables, any> {
        const query = {
            query: gql`
                query {
                    ${queryOption.queryName}(${buildQueryName(queryOption)}) {
                        ${buildQueryFieldsToFetch(fieldsToFetch)}
                    }
                }
            `
        }
        return query
    }

    // ---------- each function represents a field of a query

    function userById(id: number, fieldsToFetch: Schema.User[]) {
        return getGlobalClient().query(buildQuery(
            {
                queryName: Schema.Query.userById,
                params: [{ paramName: 'id', paramValue: id }]
            },
            fieldsToFetch
        ))

    }

    function applicablePromotion(id: number, fieldsToFetch: Schema.Promotion[]) {
        return getGlobalClient().query(buildQuery(
            {
                queryName: Schema.Query.applicablePromotion,
                params: [{ paramName: 'userId', paramValue: id }]
            },
            fieldsToFetch
        ))
    }

    function chatSession(userId: number, shipperId: number, fieldsToFetch: Schema.ChatSession[]) {
        const query = buildQuery(
            {
                queryName: Schema.Query.chatSession,
                params: [{ paramName: 'userId', paramValue: userId }, { paramName: 'shipperId', paramValue: shipperId }]
            },
            fieldsToFetch
        )
        return getGlobalClient().query(query)
    }


    // Global private var
    class CachedUser {
        private _user: Type.User | undefined = undefined

        /**
         * 
         * @param selectors 
         * @param onGettable is called when a cache can be accessed
         * @param onFailure is called when [selectors] is insuccficie
         */
        getCache(selectors: Schema.User[], onGettable: (user: Type.User) => void, onFailure: () => void) {
            if (this._user === undefined || selectors.length === 0) {
                onFailure()
                return
            }

            const selSet = new Set(selectors)
            for (let field of selSet) {
                if (this._user[field] == undefined) {
                    onFailure()
                    return
                }
            }
            //onGettable(this._user)
        }

        getInvalidatedCache() {
            return this._user
        }

        cache(user: Type.User) {
            this._user = user
        }

    }

    let CACHED_USER: Type.User | undefined = undefined

    // ------ PUBLIC MEMBERS

    /**
     * Compare 2 User instances
     * @param user1 
     * @param user2 
     * @returns true if 2 users are the same
     */
    export function compareUsers(user1: Type.User, user2: Type.User) {
        return (
            user1.id === user2.id ||
            user1.firstName === user2.firstName ||
            user1.lastName === user2.lastName ||
            user1.citizenId === user2.citizenId ||
            user1.dateOfBirth === user2.dateOfBirth ||
            user1.phone === user2.phone ||
            user1.profilePictureUrl === user2.profilePictureUrl
        )
    }

    export function getCurrentUser(id: number, selectors: Schema.User[], onGetSuccess?: (data: Type.User) => void, onGetFailure?: (error: any) => void, useCache: boolean = false) {
        const u = Schema.User
        try {
            // CACHED_USER.getCache(
            //     selectors,
            //     (user) => {
            //         console.log('-------- USE CACHED USER')
            //         onGetSuccess?.(user)
            //     },
            //     () => {
            if (CACHED_USER)
                onGetSuccess?.(CACHED_USER)

            userById(id, selectors)
                .then(result => {
                    const user = result.data[Schema.Query.userById]
                    onGetSuccess?.(user)
                    CACHED_USER = user
                })
                .catch(error => onGetFailure?.(error))
            //     }
            // )
        } catch (error) {
            ToastAndroid.show('Apollo client has not been set', ToastAndroid.LONG)
        }
    }

    export function getCurrentUserInfo(id: number, onGetSuccess?: (data: User) => void, onGetFailure?: (error: any) => void) {
        const u = Schema.User
        const selectors = [u.id, u.firstName, u.lastName, u.phone]
        try {
            // CACHED_USER.getCache(
            //     selectors,
            //     (user) => {
            //         console.log('-------- USE CACHED USER')
            //         onGetSuccess?.(user)
            //     },
            //     () => {
            userById(id, selectors)
                .then(result => {
                    const user = result.data[Schema.Query.userById]
                    //CACHED_USER.cache(user)
                    onGetSuccess?.(user)
                })
                .catch(error => onGetFailure?.(error))
            //     }
            // )
        } catch (error) {
            //ToastAndroid.show('Apollo client has not been set', ToastAndroid.LONG)
        }
    }

    export function getApplicablePromotion(onGetSuccess?: (promotion: Type.Promotion[]) => void, onGetFailure?: (error: any) => void) {
        const p = Schema.Promotion
        applicablePromotion(Global.User.CurrentUser.id, [p.id, p.promoCode, p.applicablePrice, p.discountPercentage, p.maximumDiscountAmount, p.expireDate, p.description])
            .then(result => onGetSuccess?.(result.data[Schema.Query.applicablePromotion] as Type.Promotion[]))
            .catch(error => onGetFailure?.(error))
    }


    export function getChatSession(userId: number, shipperId: number, onGetSuccess?: (promotion: Type.ChatSession) => void, onGetFailure?: (error: any) => void) {
        const c = Schema.ChatSession
        const u = Schema.User
        chatSession(
            userId,
            shipperId,
            [
                `${c.user} {
                    ${u.id}
                }` as Schema.ChatSession,
                `${c.shipper} {
                    ${u.id}
                }` as Schema.ChatSession,
                c.channelUrl
            ]
        ).then(result => onGetSuccess?.(result.data[Schema.Query.chatSession] as Type.ChatSession))
            .catch(error => onGetFailure?.(error))
    }

}