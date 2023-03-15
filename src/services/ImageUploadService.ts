import axios, { AxiosError } from 'axios';
import RNFS from 'react-native-fs'

export namespace ImageUploadService {
    interface CloudinaryResponse {
        access_mode?: string,
        asset_id?: string,
        bytes?: number,
        created_at: string,
        etag?: string,
        folder: string,
        format: string,
        height: number,
        width: number,
        placeholder?: string,
        public_id?: string,
        resource_type: string,
        secure_url: string,
        url: string
    }

    interface UploadEvent {
        onUploaded?: (url: string) => void
        onUploadBegan?: () => void,
        onUploadFailure?: (error?: any) => void
    }

    export function upload(uri: string, events?: UploadEvent) {
        RNFS.readFile(uri, "base64")
            .then(base64 => {
                //console.log('----- base64: ', base64.substring(0, 100))

                const formData = new FormData()
                formData.append('file', 'data:image/jpeg;base64,' + base64)
                formData.append('upload_preset', 'elamumjo');

                const requestOptions = {
                    method: 'POST',
                    body: formData,
                    redirect: 'manual'
                } as RequestInit;

                events?.onUploadBegan?.()

                fetch("https://api.cloudinary.com/v1_1/de26tcplz/image/upload", requestOptions)
                    .then(response => response.json())
                    .then((data: CloudinaryResponse) => events?.onUploaded?.(data.secure_url))
                    .catch((error) => events?.onUploadFailure?.(error))
            })
            .catch((error) => {
                console.log('------- fs error (failed to read file) ', error)
                events?.onUploadFailure?.(error)
            })

    }
}
