'use client'

import { MapPin, Search } from 'lucide-react'
import { Location } from '@/types'
import { useState } from 'react'

interface HeroProps {
  location: Location | null
  onLocationChange: (location: Location | null) => void
  onFindWindows: () => void
  loading: boolean
  onScrollToData?: () => void
}

export default function Hero({ location, onLocationChange, onFindWindows, loading, onScrollToData }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const searchBeach = async (query: string) => {
    if (!query.trim()) return

    try {
      // For now, we'll use a simple geocoding approach
      // Later we can add a proper beach search API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' beach')}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        onLocationChange({
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          name: result.display_name
        })
        setSearchQuery('')
        setShowSearch(false)
      } else {
        alert('Beach not found. Try a different search term.')
      }
    } catch (error) {
      console.error('Error searching for beach:', error)
      alert('Error searching for beach. Please try again.')
    }
  }

  const handleFindWindows = () => {
    onFindWindows()
    if (onScrollToData) {
      // Small delay to ensure the data section is rendered
      setTimeout(() => {
        onScrollToData()
      }, 100)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enter it manually.')
      }
    )
  }

  return (
    <section className="relative overflow-hidden h-screen flex items-center snap-start">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          onError={(e) => {
            console.error('Video error:', e);
            console.error('Video error details:', (e.target as HTMLVideoElement)?.error);
          }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
          onLoadedData={() => console.log('Video data loaded')}
          onSuspend={() => console.log('Video loading suspended')}
        >
          <source src="https://res.cloudinary.com/dyipahmz9/video/upload/v1759257424/ocean-video_jsrrnp.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Fallback background - only shows if video fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-teal-500" style={{ zIndex: 0 }}></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl title-font text-white mb-4 drop-shadow-lg">
          seas the day
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
          find your perfect beach window
        </p>
        
        {/* Search input - show when no location and search is active */}
        {!location && !loading && showSearch && (
          <div className="max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="search for a beach"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBeach(searchQuery)}
                className="flex-1 px-4 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => searchBeach(searchQuery)}
                disabled={!searchQuery.trim()}
                className="bg-white/90 text-primary px-4 py-3 rounded-full font-medium hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSearch(false)}
                className="bg-white/20 text-white border border-white/30 px-4 py-3 rounded-full font-medium hover:bg-white/30 transition-colors duration-200"
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {/* Action buttons - only show when needed */}
        {(location || loading) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            {!location ? (
              <>
                <button
                  onClick={getCurrentLocation}
                  className="bg-white/90 text-primary px-6 py-3 rounded-full font-medium hover:bg-white transition-colors duration-200 hover:-translate-y-[1px] shadow-lg flex items-center gap-2"
                  disabled={loading}
                >
                  <MapPin className="h-5 w-5" />
                  use my location
                </button>
                <button
                  onClick={() => onLocationChange({ lat: 34.0195, lon: -118.4912, name: 'Santa Monica' })}
                  className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-colors duration-200 hover:-translate-y-[1px] backdrop-blur-sm flex items-center gap-2"
                  disabled={loading}
                >
                  <MapPin className="h-5 w-5" />
                  test with santa monica
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-5 w-5" />
                <span>location detected</span>
              </div>
            )}
            
            <button
              onClick={handleFindWindows}
              disabled={!location || loading}
              className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-hover transition-colors duration-200 hover:-translate-y-[1px] shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-5 w-5" />
              {loading ? 'finding windows...' : 'find best windows'}
            </button>
          </div>
        )}
        
        {/* Initial call-to-action when no location and no search */}
        {!location && !loading && !showSearch && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={getCurrentLocation}
              className="bg-white/90 text-primary px-8 py-4 rounded-full font-medium hover:bg-white transition-colors duration-200 hover:-translate-y-[1px] shadow-lg flex items-center gap-3"
            >
              <MapPin className="h-6 w-6" />
              use my location
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-medium hover:bg-white/30 transition-colors duration-200 hover:-translate-y-[1px] backdrop-blur-sm flex items-center gap-3"
            >
              <Search className="h-6 w-6" />
              search for beach
            </button>
          </div>
        )}
        
      </div>
    </section>
  )
}
