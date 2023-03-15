import Axios from "axios"
import { Global } from "../Global"

export namespace APIService {
    export function getAccessToken() {
        return Global.DEFAULT_ENDPOINT.ACCESS_TOKEN()
    }

    const default_origin: string = Global.DEFAULT_ENDPOINT.ORIGIN

    export enum Protocol {
        'HTTP' = 'http',
        'HTTPS' = 'https',
        'WS' = 'ws'
    }

    const protocols = new Map<Protocol, number>([
        [Protocol.HTTP, 8080],
        [Protocol.HTTPS, 8443],
        [Protocol.WS, 0]
    ])

    function buildOrigin(protocol: Protocol = Protocol.HTTP, port?: number, origin: string = default_origin) {
        let _port: number

        if (port)
            _port = (port > 0) ? port : (protocols.get(Protocol.HTTP) as number)
        else {
            _port = protocols.get(protocol) as number
            _port = (_port > 0) ? _port : (protocols.get(Protocol.HTTP) as number)
        }

        return `${protocol as string}://${origin}:${_port}`
    }

    function formatSubdirectory(subdirectory: string) {
        subdirectory = subdirectory.trim()
        subdirectory = (subdirectory.charAt(0) === '/') ? subdirectory : '/' + subdirectory
        return subdirectory;
    }

    export function buildDefaultEndpoint(subdirectory: string) {
        const endpoint = buildOrigin() + formatSubdirectory(subdirectory)
        console.log('endpoint: ', endpoint)
        return endpoint
    }

    export function buildDefaultWSEndpoint(subdirectory: string) {
        const endpoint = buildOrigin(Protocol.WS, protocols.get(Protocol.HTTP)) + formatSubdirectory(subdirectory)
        console.log('ws endpoint: ', endpoint)
        return endpoint
    }

    type LooseObject = {
        [key: string]: any
    }


    export function axios(subdirectory: string, method: 'get' | 'post' = 'get', body?: object, headers?: LooseObject) {
        headers = (headers) ? headers : ({} as LooseObject)
        if (headers.Authorization === undefined)
            headers.Authorization = `Bearer ${getAccessToken()}`

        const _config = {
            method: method,
            maxBodyLength: Infinity,
            url: buildDefaultEndpoint(subdirectory),
            headers: headers,
        } as LooseObject;

        if (body)
            _config.data = body

        return Axios(_config)
    }

    function useDefaultPropsIfNotExist(props: Object, defaultProps: object) {
        if (props.constructor.name !== defaultProps.constructor.name)
            throw '[props] and [defaultProps] must instances of the same class'

        for (let key in defaultProps) {
            if (props[key] === undefined)
                props[key] = defaultProps[key]
        }
    }

}
