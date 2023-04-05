export namespace WebSocketService {
    export interface WSChatUser {
        id: number,
        firstName: string,
        lastName: string,
        profilePictureUrl?: string
    }

    export interface WSChatResponse {
        sessionId: string,
        user: WSChatUser
        shipper: WSChatUser
        createdDate: string | Date
    }
}