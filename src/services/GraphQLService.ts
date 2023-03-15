import { Global } from "../Global";
import { ApolloClient, gql, QueryOptions, OperationVariables } from '@apollo/client'
import User from "../entities/User";

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
    }

    export namespace Schema {
        export enum Query {
            userById = 'userById',
            applicablePromotion = 'applicablePromotion'
        }

        export enum User {
            id = 'id',
            firstName = 'firstName',
            lastName = 'lastName',
            phone = 'phone',
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
        return {
            query: gql`
                query {
                    ${queryOption.queryName}(${buildQueryName(queryOption)}) {
                        ${buildQueryFieldsToFetch(fieldsToFetch)}
                    }
                }
            `
        }
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

    // ------ PUBLIC MEMBERS
    export function getCurrentUserInfo(id: number, onGetSuccess?: (data: User) => void, onGetFailure?: (error: any) => void) {
        const u = Schema.User
        userById(id, [u.id, u.firstName, u.lastName, u.phone])
            .then(result => onGetSuccess?.(result.data[Schema.Query.userById]))
            .catch(error => onGetFailure?.(error))
    }

    export function getApplicablePromotion(onGetSuccess?: (promotion: Type.Promotion[]) => void, onGetFailure?: (error: any) => void) {
        const p = Schema.Promotion
        applicablePromotion(Global.User.CurrentUser.id, [p.id, p.promoCode, p.applicablePrice, p.discountPercentage, p.maximumDiscountAmount, p.expireDate, p.description])
            .then(result => onGetSuccess?.(result.data[Schema.Query.applicablePromotion] as Type.Promotion[]))
            .catch(error => onGetFailure?.(error))
    }

}