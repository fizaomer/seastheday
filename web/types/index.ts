export interface Location {
  lat: number
  lon: number
  name?: string
}

export interface UserPreferences {
  mode: 'lounge' | 'swim' | 'surf'
  prefTempF: number
  maxWindMph: number
  uvGood: number
  windowHours: number
  startDate: string
  endDate: string
  waterTempF?: number
  waveHeightFt?: number
}

export interface WeatherSummary {
  tempF: number
  uv: number
  windMph: number
  cloudPct: number
  waterTempF?: number
  waveHeightFt?: number
}

export interface BeachWindow {
  score: number
  start: string
  end: string
  summary: WeatherSummary
  reasons: string[]
}

export interface RecommendationsResponse {
  windows: BeachWindow[]
  notes: string[]
}

export interface WeatherData {
  time: string
  temperature_2m: number
  cloud_cover: number
  precipitation_probability: number
  wind_speed_10m: number
  uv_index: number
  relative_humidity_2m: number
}

export interface BeachLocation {
  name: string
  lat: number
  lon: number
  description?: string
}

