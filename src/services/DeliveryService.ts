import axios from "axios";
import { APIService } from "./APIService";
import { LocationService } from "./LocationService";

type Coordinates = LocationService.Coordinates

export namespace DeliveryService {
    export namespace User {
        export interface AdvisorResponse {
            price: number,
            distance: number
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
    }
}