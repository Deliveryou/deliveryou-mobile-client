export const ENDPOINT = 'http://10.0.2.2:8080'
export function buildUri(value: string) {
    return `${ENDPOINT}/${value}`
}