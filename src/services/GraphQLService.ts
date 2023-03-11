import { Global } from "../Global";
import { ApolloClient, gql, QueryOptions, OperationVariables } from '@apollo/client'
import User from "../entities/User";

export namespace GraphQLService {
    export namespace Schema {
        export enum Query {
            userById = 'userById'
        }

        export enum User {
            id = 'id',
            firstName = 'firstName',
            lastName = 'lastName',
            phone = 'phone',
            role = 'role'
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

    function buildQueryFieldsToFetch(fieldsToFetch: Schema.User[]) {
        return fieldsToFetch.map(value => '' + value).join(' ')
    }

    function buildQuery(queryOption: QueryOption, fieldsToFetch: Schema.User[]): QueryOptions<OperationVariables, any> {
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

    // ------ PUBLIC MEMBERS
    export function getCurrentUserInfo(id: number, onGetSuccess?: (data: User) => void, onGetFailure?: (error: any) => void) {
        const u = Schema.User
        userById(id, [u.id, u.firstName, u.lastName, u.phone])
            .then(result => onGetSuccess?.(result.data[Schema.Query.userById]))
            .catch(error => onGetFailure?.(error))
    }

}