import { GeoLocation } from "./GeoLocation"

export type HourlyRadiation = {
    time: string[] // ISO 8601 timestamps
    shortwave_radiation: number[] // W/m²
}

export type RadiationData = {
    latitude: number
    longitude: number
    generationtime_ms: number
    hourly: HourlyRadiation
}