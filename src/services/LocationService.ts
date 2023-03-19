import axios from "axios";
import { PermissionsAndroid } from "react-native";
import PropTypes from 'prop-types';
import { Directions } from "react-native-gesture-handler";
import Geolocation from 'react-native-geolocation-service';

export namespace LocationService {

    export async function requestGeolocation(onRequestSuccessfully?: () => void, onRequestFailed?: () => void) {
        const request = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

        if (request === 'granted')
            onRequestSuccessfully?.()
        else
            onRequestFailed?.()
    }

    export async function canUseGeolocation(): Promise<boolean> {
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
    export async function executeWithCheck(callback: () => void, onErrorCallback?: (error: any) => void) {
        const canUseLocation = await canUseGeolocation()

        try {
            if (canUseLocation)
                callback()
            else
                throw new Error('Not allowed to access geolocation')
        } catch (error) {
            onErrorCallback?.(error)
        }

    }

    export interface Coordinates {
        latitude: number
        longitude: number
    }

    export function compareCoordinates(origin: Coordinates, target?: { latitude: any, longitutde: any }) {
        if (!target)
            return false

        return (origin.latitude == target.latitude && origin.longitude == target.longitutde)
    }

    export function getGPSLocation(onSuccess?: (coordinates: Coordinates) => void, onFailure?: (error?: any) => void) {
        Geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude
                const long = position.coords.longitude
                console.log(`-------- gps loc: ${lat} - ${long}`)
                onSuccess?.(({ latitude: lat, longitude: long }))
            },
            error => onFailure?.(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
        )
    }

    export namespace LocationIQ {

        export namespace Response {
            export interface Address {
                name: string,
                house_number: string,
                road: string,
                neighbourhood: string,
                suburb: string,
                island: string,
                city: string,
                county: string,
                state: string,
                state_code: string,
                postcode: string,
                country: string,
                country_code: string,
            }

            export interface Data {
                place_id: string,
                licence: string,
                osm_type: string,
                osm_id: string,
                boundingbox: string[],
                lat: string,
                lon: string,
                display_name: string,
                importance: string,
                icon: string,
                address: Address,
                extratags: string,
                namedetails: string,
                geojson: string,
                geokml: string,
                svg: string,
                geotext: string
            }

            class INITIATIVE_DATA implements Data {
                private static _instance: INITIATIVE_DATA
                private constructor() { }

                static get instance() {
                    if (!this._instance)
                        this._instance = new INITIATIVE_DATA()
                    return this._instance
                }

                place_id: string = ''
                licence: string = ''
                osm_type: string = ''
                osm_id: string = ''
                boundingbox: string[] = []
                lat: string = ''
                lon: string = ''
                display_name: string = ''
                importance: string = ''
                icon: string = ''
                address: Address = {
                    name: '',
                    house_number: '',
                    road: '',
                    neighbourhood: '',
                    suburb: '',
                    island: '',
                    city: '',
                    county: '',
                    state: '',
                    state_code: '',
                    postcode: '',
                    country: '',
                    country_code: ''
                }
                extratags: string = ''
                namedetails: string = ''
                geojson: string = ''
                geokml: string = ''
                svg: string = ''
                geotext: string = ''
            }

            export const EMPTY_DATA = INITIATIVE_DATA.instance

            export interface Route {
                geometry: string,
                weight_name: string,
                weight: number,
                duration: number,
                distance: number,
                legs: any[]
            }

            export interface Direction {
                code: string,
                routes: Route[],
                waypoints: any[]
            }
        }

        const ACCESS_TOKEN = 'pk.064b929ae3a07985e0bfe488d648b455'

        export function reverseGeocoding(coordinates: Coordinates, onRequestSuccessfully: (responseData: Response.Data) => void, onRequestFailed?: (error: any) => void) {
            const endpoint = `https://us1.locationiq.com/v1/reverse?key=${ACCESS_TOKEN}&lat=${coordinates.latitude}&lon=${coordinates.longitude}&format=json&normalizeaddress=1`
            console.log('------- reverse coding: ', endpoint)
            fetch(endpoint)
                .then(response => {
                    if (response.status !== 200)
                        throw `Unexpected status: ${response.status}`
                    return response.json()
                })
                .then((data: Response.Data) => onRequestSuccessfully(data))
                .catch(error => onRequestFailed?.(error))
        }

        export function autoComplete(searchInfo: { query: string, limit: number }, onRequestSuccessfully: (responseDataList: Response.Data[]) => void, onRequestFailed?: (error: any) => void) {
            searchInfo.query = searchInfo.query.replace(/\s+/g, '%20')
            searchInfo.limit = (searchInfo.limit < 1) ? 1 : searchInfo.limit

            const endpoint = `https://api.locationiq.com/v1/autocomplete?key=${ACCESS_TOKEN}&q=${searchInfo.query}&limit=${searchInfo.limit}&dedupe=1&normalizeaddress=1&countrycodes=vn`
            console.log('endpoint iq: ', endpoint)
            axios.get(endpoint)
                .then(response => {
                    console.log('iq response: ', response.data)
                    return response.data as Response.Data[]
                })
                .then(listOfData => onRequestSuccessfully(listOfData))
                .catch(error => onRequestFailed?.(error))
        }

        export function direction(pointA: LocationService.Coordinates, pointB: LocationService.Coordinates, onRequestSuccessfully: (responseData: Response.Direction) => void, onRequestFailed?: (error: any) => void) {
            const endpoint = `https://us1.locationiq.com/v1/directions/driving/${pointA.longitude},${pointA.latitude};${pointB.longitude},${pointB.latitude}?key=${ACCESS_TOKEN}&steps=true&alternatives=true&geometries=polyline&overview=full`

            axios.get(endpoint)
                .then(response => response.data as Response.Direction)
                .then(direction => onRequestSuccessfully(direction))
                .catch(error => onRequestFailed?.(error))
        }

    }

}
