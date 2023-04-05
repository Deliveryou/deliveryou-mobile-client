import axios from "axios";
import { Global } from "../Global";
import { APIService } from "./APIService";
import { GraphQLService } from "./GraphQLService";
import { LocationService } from "./LocationService";

type Coordinates = LocationService.Coordinates

export namespace DeliveryService {
    export namespace User {
        export interface AdvisorResponse {
            price: number,
            distance: number
        }

        export interface DeliveryPackage {
            user: { id: number },
            photoUrl: string,
            promotion: { id: number },
            price: number,
            senderAddress: { longitude: number, latitude: number },
            recipientAddress: { longitude: number, latitude: number },
            recipientName: string,
            recipientPhone: string,
            note: string,
            packageType: { name: string }
        }


        export function advisorPrice(startingPoint: Coordinates, destination: Coordinates,
            onSuccess?: (data: AdvisorResponse) => void, onFailure?: (error?: any) => void) {
            const cdate = new Date()
            const time = `${cdate.getHours()}:${cdate.getMinutes()}:${cdate.getSeconds()}`

            APIService.axios("/api/user/package/advisor-price", 'post',
                {
                    starting_point_lat: startingPoint.latitude,
                    starting_point_lon: startingPoint.longitude,
                    destination_lat: destination.latitude,
                    destination_lon: destination.longitude,
                    creation_time: time
                }
            )
                .then(response => response.data as AdvisorResponse)
                .then(data => onSuccess?.(data))
                .catch(error => onFailure?.(error))

        }

        export function uploadDeliveryPackage(deliveryPackage: DeliveryPackage, onSuccess?: () => void, onFailure?: (error?: any) => void) {
            APIService.axios("/api/user/package/upload", "post", deliveryPackage)
                .then(response => onSuccess?.())
                .catch(error => onFailure?.(error))
        }
    }

    export namespace Shipper {
        export function registerPackage(details: { shipperId: number, packageId: number }, onSuccess?: () => void, onFailure?: (error?: any) => void) {
            APIService.axios("/api/shipper/package/accept-request", "post", details)
                .then(reponse => onSuccess?.())
                .catch(error => onFailure?.(error))
        }

        export function getActivePackage(onSuccess: (deliveryPackage: GraphQLService.Type.DeliveryPackage) => void, onFailure?: (error?: any) => void) {
            APIService.axios(`/api/shared/package/get-active-package/${Global.User.CurrentUser.id}`)
                .then(reponse => reponse.data as GraphQLService.Type.DeliveryPackage)
                .then(dpackage => onSuccess(dpackage))
                .catch(error => onFailure?.(error))
        }
    }
}