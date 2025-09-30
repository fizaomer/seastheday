'use client'

import { useEffect, useState, useRef } from 'react'
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
    { name: 'ocean beach', lat: 37.7594, lon: -122.5101, description: 'sf\'s main beach' },
    { name: 'baker beach', lat: 37.7936, lon: -122.4836, description: 'golden gate views' },
    { name: 'stinson beach', lat: 38.1994, lon: -122.6447, description: 'marin county gem' },
    { name: 'half moon bay', lat: 37.4636, lon: -122.4286, description: 'coastal beauty' },
    { name: 'pacifica state beach', lat: 37.6208, lon: -122.4908, description: 'surfing spot' },
    { name: 'muir beach', lat: 37.8619, lon: -122.5764, description: 'redwood backdrop' },
    { name: 'rodeo beach', lat: 37.8322, lon: -122.5381, description: 'marin headlands' },
    { name: 'cowell beach', lat: 36.9511, lon: -122.0264, description: 'santa cruz classic' },
    { name: 'natural bridges', lat: 36.9506, lon: -122.0603, description: 'famous arches' },
    { name: 'capitola beach', lat: 36.9714, lon: -121.9514, description: 'colorful village' },
  ],
  // Southern California
  'socal': [
    { name: 'santa monica beach', lat: 34.0195, lon: -118.4912, description: 'classic socal beach' },
    { name: 'venice beach', lat: 33.9850, lon: -118.4695, description: 'famous boardwalk' },
    { name: 'malibu beach', lat: 34.0259, lon: -118.7798, description: 'surfing paradise' },
    { name: 'huntington beach', lat: 33.6595, lon: -117.9988, description: 'surf city usa' },
    { name: 'laguna beach', lat: 33.5427, lon: -117.7854, description: 'artistic coastal town' },
  ],
  // Central Coast
  'central-coast': [
    { name: 'pismo beach', lat: 35.1428, lon: -120.6413, description: 'dunes and surfing' },
    { name: 'morro bay', lat: 35.3658, lon: -120.8499, description: 'rock and beach' },
    { name: 'cayucos state beach', lat: 35.4428, lon: -120.9056, description: 'family friendly' },
    { name: 'avila beach', lat: 35.1803, lon: -120.7311, description: 'protected cove' },
    { name: 'carpinteria state beach', lat: 34.3908, lon: -119.5181, description: 'world\'s safest beach' },
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const mapInstanceRef = useRef<any>(null)

  const searchBeaches = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' beach')}&limit=5`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const results = data.map((result: any) => ({
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          name: result.display_name,
          description: 'searched beach'
        }))
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching for beaches:', error)
      setSearchResults([])
    }
  }

  useEffect(() => {
    if (!location) return

    const initializeMap = async () => {
      if (typeof window === 'undefined') return
      
      const L = await import('leaflet')
      
      // Check if map already exists
      const mapContainer = document.getElementById('map')
      if (!mapContainer) return
      
      // If container already has a map, remove it first
      if ((mapContainer as any)._leaflet_id) {
        try {
          (mapContainer as any)._leaflet_id = null
        } catch (e) {
          console.warn('Error clearing map container:', e)
        }
      }
      
      // Clean up existing map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.warn('Error removing map instance:', e)
        }
        mapInstanceRef.current = null
      }
      
      console.log('Creating new map for location:', location)
      
      // Create new map
      const map = L.map('map', {
        center: [location.lat, location.lon],
        zoom: 12
      })
      
      mapInstanceRef.current = map
      
      // Add tile layer
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
    
    initializeMap()
  }, [location])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current && typeof mapInstanceRef.current.remove === 'function') {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.warn('Error removing map instance:', error)
        }
      }
    }
  }, [])

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
      <h2 className="text-xl font-semibold text-text mb-3">nearby beaches</h2>
      
      {/* Search beaches input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="search for beaches..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchBeaches(e.target.value)
            }}
            className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => {
              setSearchQuery('')
              setSearchResults([])
            }}
            className="px-3 py-2 bg-line text-text rounded-lg text-sm hover:bg-line-hover transition-colors"
          >
            clear
          </button>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1">
            {searchResults.map((beach, index) => (
              <button
                key={index}
                onClick={() => onLocationChange(beach)}
                className="w-full text-left p-2 rounded border border-line hover:bg-line transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-subtext" />
                  <div>
                    <div className="font-medium text-text">{beach.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {location ? (
        <div className="space-y-3">
          <div id="map" className="h-64 rounded-lg border border-line"></div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-text">nearby beaches</h3>
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
