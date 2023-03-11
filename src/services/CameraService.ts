import { Linking } from 'react-native'
import { Camera, CameraPermissionRequestResult } from 'react-native-vision-camera'

export namespace CameraService {
    let cameraPermission: CameraPermissionRequestResult

    export async function requestPermission(onRequestGranted?: () => Promise<void>, onRequestDenied?: () => Promise<void>) {
        cameraPermission = await Camera.requestCameraPermission()

        if (cameraPermission === 'authorized') {
            onRequestGranted?.()
        } else {
            onRequestDenied?.()
        }
    }
}