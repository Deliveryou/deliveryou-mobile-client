export default class User {
    id: number = 0
    firstname: string = ''
    lastname: string = ''
    dob?: Date = new Date()
    citizenId?: string = ''
    phone: string = ''
    type?: 'ADMIN' | 'USER' | 'SHIPPER' = 'USER'
    verified?: boolean = true
    profileImage?: string
}