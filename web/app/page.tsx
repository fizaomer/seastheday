'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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

  const scrollToDataSection = () => {
    const contentSection = document.getElementById('content-section')
    if (contentSection) {
      contentSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const fetchRecommendations = useCallback(async () => {
    if (!location) return
    
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://seastheday-production.up.railway.app'
      const response = await fetch(`${apiUrl}/recommendations`, {
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


  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <main className="h-screen snap-start">
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
          onScrollToData={scrollToDataSection}
        />
        {location && (
          <motion.div 
            className="min-h-screen snap-start flex flex-col"
            id="content-section"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
          <div className="w-full min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-4 flex-1">
              {location && (
                <div className="mb-4 p-3 bg-card border border-line rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <div>
                      <h3 className="font-semibold text-text">
                        {location.name || 'current location'}
                      </h3>
                      <p className="text-sm text-subtext">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div 
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
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
                </motion.div>
                <motion.div 
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <MapPanel 
                    location={location}
                    onLocationChange={setLocation}
                    userLocation={userLocation}
                  />
                </motion.div>
              </div>
            </div>
            <Footer />
          </div>
        </motion.div>
        )}
      </main>
    </div>
  )
}
