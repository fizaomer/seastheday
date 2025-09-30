'use client'

import { useEffect, useState } from 'react'
import { Location } from '@/types'
import { MapPin } from 'lucide-react'

interface MapPanelProps {
  location: Location | null
  onLocationChange: (location: Location) => void
  userLocation?: Location | null
}

// Beach locations organized by region
const BEACH_REGIONS = {
  // Bay Area
  'bay-area': [
    { name: 'Ocean Beach', lat: 37.7594, lon: -122.5101, description: 'SF\'s main beach' },
    { name: 'Baker Beach', lat: 37.7936, lon: -122.4836, description: 'Golden Gate views' },
    { name: 'Stinson Beach', lat: 38.1994, lon: -122.6447, description: 'Marin County gem' },
    { name: 'Half Moon Bay', lat: 37.4636, lon: -122.4286, description: 'Coastal beauty' },
    { name: 'Pacifica State Beach', lat: 37.6208, lon: -122.4908, description: 'Surfing spot' },
    { name: 'Muir Beach', lat: 37.8619, lon: -122.5764, description: 'Redwood backdrop' },
    { name: 'Rodeo Beach', lat: 37.8322, lon: -122.5381, description: 'Marin Headlands' },
    { name: 'Cowell Beach', lat: 36.9511, lon: -122.0264, description: 'Santa Cruz classic' },
    { name: 'Natural Bridges', lat: 36.9506, lon: -122.0603, description: 'Famous arches' },
    { name: 'Capitola Beach', lat: 36.9714, lon: -121.9514, description: 'Colorful village' },
  ],
  // Southern California
  'socal': [
    { name: 'Santa Monica Beach', lat: 34.0195, lon: -118.4912, description: 'Classic SoCal beach' },
    { name: 'Venice Beach', lat: 33.9850, lon: -118.4695, description: 'Famous boardwalk' },
    { name: 'Malibu Beach', lat: 34.0259, lon: -118.7798, description: 'Surfing paradise' },
    { name: 'Huntington Beach', lat: 33.6595, lon: -117.9988, description: 'Surf City USA' },
    { name: 'Laguna Beach', lat: 33.5427, lon: -117.7854, description: 'Artistic coastal town' },
  ],
  // Central Coast
  'central-coast': [
    { name: 'Pismo Beach', lat: 35.1428, lon: -120.6413, description: 'Dunes and surfing' },
    { name: 'Morro Bay', lat: 35.3658, lon: -120.8499, description: 'Rock and beach' },
    { name: 'Cayucos State Beach', lat: 35.4428, lon: -120.9056, description: 'Family friendly' },
    { name: 'Avila Beach', lat: 35.1803, lon: -120.7311, description: 'Protected cove' },
    { name: 'Carpinteria State Beach', lat: 34.3908, lon: -119.5181, description: 'World\'s safest beach' },
  ]
}

// Function to determine region based on coordinates
const getRegionFromCoords = (lat: number, lon: number) => {
  // Bay Area (expanded range to include all Bay Area beaches)
  if (lat >= 37.0 && lat <= 38.5 && lon >= -123.0 && lon <= -121.5) {
    return 'bay-area'
  }
  // Central Coast
  if (lat >= 34.0 && lat <= 37.0 && lon >= -121.5 && lon <= -120.0) {
    return 'central-coast'
  }
  // Southern California (default)
  return 'socal'
}

// Function to calculate distance between two coordinates (in miles)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function MapPanel({ location, onLocationChange, userLocation }: MapPanelProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Dynamic import for Leaflet to avoid SSR issues
    const loadMap = async () => {
      if (typeof window === 'undefined') return
      
      const L = await import('leaflet')
      
      if (location && !mapLoaded) {
        const map = L.map('map').setView([location.lat, location.lon], 12)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)
        
        // Add user location marker
        L.marker([location.lat, location.lon], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>',
            iconSize: [16, 16],
          })
        }).addTo(map).bindPopup('Your Location')
        
        // Get beaches for current region
        const region = getRegionFromCoords(location.lat, location.lon)
        const nearbyBeaches = BEACH_REGIONS[region] || BEACH_REGIONS['socal']
        
        // Add beach markers
        nearbyBeaches.forEach(beach => {
          L.marker([beach.lat, beach.lon], {
            icon: L.divIcon({
              className: 'beach-marker',
              html: '<div class="w-3 h-3 bg-accent rounded-full border border-white"></div>',
              iconSize: [12, 12],
            })
          }).addTo(map).bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${beach.name}</h3>
              <p class="text-sm text-gray-600">${beach.description}</p>
              <button 
                onclick="window.selectBeach(${beach.lat}, ${beach.lon}, '${beach.name}')"
                class="mt-2 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-hover"
              >
                Use This Beach
              </button>
            </div>
          `)
        })
        
        setMapLoaded(true)
      }
    }
    
    loadMap()
  }, [location, mapLoaded])

  // Global function for beach selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).selectBeach = (lat: number, lon: number, name: string) => {
        onLocationChange({ lat, lon, name })
      }
    }
  }, [onLocationChange])

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-text mb-4">Nearby Beaches</h2>
      
      {location ? (
        <div className="space-y-4">
          <div id="map" className="h-64 rounded-lg border border-line"></div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-text">Nearby Beaches</h3>
            {(() => {
              if (!location) return null
              
              const region = getRegionFromCoords(location.lat, location.lon)
              const nearbyBeaches = BEACH_REGIONS[region] || BEACH_REGIONS['socal']
              
              // Calculate distances from user's original location, not the selected beach
              const referenceLocation = userLocation || location
              const beachesWithDistance = nearbyBeaches.map(beach => ({
                ...beach,
                distance: calculateDistance(referenceLocation.lat, referenceLocation.lon, beach.lat, beach.lon)
              })).sort((a, b) => a.distance - b.distance)
              
              return beachesWithDistance.map((beach, index) => {
                // Check if this beach is currently selected
                const isSelected = location && (
                  location.name === beach.name || 
                  (Math.abs(location.lat - beach.lat) < 0.001 && Math.abs(location.lon - beach.lon) < 0.001)
                )
                
                return (
                  <button
                    key={index}
                    onClick={() => onLocationChange(beach)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-coastal' 
                        : 'border-line hover:bg-line'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-accent'}`} />
                        <div>
                          <div className={`font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                            {beach.name}
                          </div>
                          <div className="text-sm text-subtext">{beach.description}</div>
                        </div>
                      </div>
                      <div className="text-sm text-subtext font-medium">
                        {beach.distance.toFixed(1)} mi
                      </div>
                    </div>
                  </button>
                )
              })
            })()}
          </div>
        </div>
      ) : (
        <div className="text-center text-subtext py-8">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Select a location to see nearby beaches</p>
        </div>
      )}
    </div>
  )
}
