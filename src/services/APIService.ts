import { Global } from "../Global"

export namespace APIService {
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

}
