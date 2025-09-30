'use client'

import { MapPin, Search } from 'lucide-react'
import { Location } from '@/types'

interface HeroProps {
  location: Location | null
  onLocationChange: (location: Location | null) => void
  onFindWindows: () => void
  loading: boolean
}

export default function Hero({ location, onLocationChange, onFindWindows, loading }: HeroProps) {
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
    <section className="relative overflow-hidden h-screen flex items-center">
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
          Seas the Day
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
          Find your perfect beach window
        </p>
        
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
                  Use My Location
                </button>
                <button
                  onClick={() => onLocationChange({ lat: 34.0195, lon: -118.4912, name: 'Santa Monica' })}
                  className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-colors duration-200 hover:-translate-y-[1px] backdrop-blur-sm flex items-center gap-2"
                  disabled={loading}
                >
                  <MapPin className="h-5 w-5" />
                  Test with Santa Monica
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-5 w-5" />
                <span>Location detected</span>
              </div>
            )}
            
            <button
              onClick={onFindWindows}
              disabled={!location || loading}
              className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-hover transition-colors duration-200 hover:-translate-y-[1px] shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Finding windows...' : 'Find best windows'}
            </button>
          </div>
        )}
        
        {/* Initial call-to-action when no location */}
        {!location && !loading && (
          <div className="mt-8">
            <button
              onClick={getCurrentLocation}
              className="bg-white/90 text-primary px-8 py-4 rounded-full font-medium hover:bg-white transition-colors duration-200 hover:-translate-y-[1px] shadow-lg flex items-center gap-3 mx-auto"
            >
              <MapPin className="h-6 w-6" />
              Get Started
            </button>
          </div>
        )}
        
        {location && (
          <p className="text-sm text-white/70 mt-4">
            Lat: {location.lat.toFixed(4)}, Lon: {location.lon.toFixed(4)}
          </p>
        )}
      </div>
    </section>
  )
}
