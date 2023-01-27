import { PermissionsAndroid } from "react-native";

export default class LocationService {
    private constructor() { }

    public static async requestGeolocation(onRequestSuccessfully?: () => void, onRequestFailed?: () => void) {
        const request = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

        if (request === 'granted')
            onRequestSuccessfully?.()
        else
            onRequestFailed?.()
    }

    public static async canUseGeolocation(): Promise<boolean> {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

            if (granted === 'granted') {
                console.log('You can use Geolocation');
                return true;
            } else {
                console.log('You cannot use Geolocation');
                return false;
            }
        } catch (error) {
            console.log('Location permission error: ', error);
            return false;
        }
    }

    /**
     * Excecute a callback in a geolocation-safe enviroment
     * @param callback only be executed when access to geolocation is permitted
     * @param onErrorCallback executed when any error is thrown
     */
    public static async executeWithCheck(callback: () => void, onErrorCallback?: (error: any) => void) {
        const canUseGeolocation = await this.canUseGeolocation()

        try {
            if (canUseGeolocation)
                callback()
            else
                throw new Error('Not allowed to access geolocation')
        } catch (error) {
            onErrorCallback?.(error)
        }

    }
}

