'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ControlsPanel from '@/components/ControlsPanel'
import ResultsList from '@/components/ResultsList'
import MapPanel from '@/components/MapPanel'
import Footer from '@/components/Footer'
import { BeachWindow, UserPreferences, Location } from '@/types'

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    mode: 'lounge',
    prefTempF: 75,
    maxWindMph: 15,
    uvGood: 6,
    windowHours: 3,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    waterTempF: 65,
    waveHeightFt: 2,
  })
  const [windows, setWindows] = useState<BeachWindow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    if (!location) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          startDate: preferences.startDate,
          endDate: preferences.endDate,
          mode: preferences.mode,
          prefs: {
            prefTempF: preferences.prefTempF,
            maxWindMph: preferences.maxWindMph,
            uvGood: preferences.uvGood,
          },
          windowHours: preferences.windowHours,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      
      const data = await response.json()
      setWindows(data.windows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [location, preferences])

  useEffect(() => {
    if (location) {
      fetchRecommendations()
    }
  }, [location, preferences, fetchRecommendations])

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      const contentSection = document.getElementById('content-section')
      if (contentSection) {
        const rect = contentSection.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight * 0.9
        
        if (isVisible) {
          contentSection.style.opacity = '1'
          contentSection.style.transform = 'translateY(0)'
        }
      }
    }

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.style.opacity = '1'
            target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 }
    )

    const contentSection = document.getElementById('content-section')
    if (contentSection) {
      observer.observe(contentSection)
    }

    return () => {
      if (contentSection) {
        observer.unobserve(contentSection)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero 
          location={location}
          onLocationChange={(loc) => {
            setLocation(loc)
            if (!userLocation) {
              setUserLocation(loc)
            }
          }}
          onFindWindows={fetchRecommendations}
          loading={loading}
        />
        <div 
          className="container mx-auto px-4 py-8 transition-all duration-1000 ease-out" 
          id="content-section"
          style={{ opacity: 0, transform: 'translateY(32px)' }}
        >
          {location && (
            <div className="mb-6 p-4 bg-card border border-line rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-text">
                    {location.name || 'Current Location'}
                  </h3>
                  <p className="text-sm text-subtext">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ControlsPanel 
                preferences={preferences}
                onPreferencesChange={setPreferences}
              />
              <ResultsList 
                windows={windows}
                loading={loading}
                error={error}
                onRetry={fetchRecommendations}
                location={location}
              />
            </div>
            <div className="lg:col-span-1">
              <MapPanel 
                location={location}
                onLocationChange={setLocation}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
