'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import ResultsList from '@/components/ResultsList'
import { BeachWindow, Location } from '@/types'

function SharePageContent() {
  const searchParams = useSearchParams()
  const [windows, setWindows] = useState<BeachWindow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const mode = searchParams.get('mode') || 'lounge'
    const prefTemp = searchParams.get('prefTemp') || '75'
    const maxWind = searchParams.get('maxWind') || '15'
    const uvGood = searchParams.get('uvGood') || '6'
    const windowHours = searchParams.get('windowHours') || '3'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (lat && lon) {
      setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) })
      fetchSharedRecommendations({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        mode,
        prefTemp: parseInt(prefTemp),
        maxWind: parseInt(maxWind),
        uvGood: parseInt(uvGood),
        windowHours: parseInt(windowHours),
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }, [searchParams])

  const fetchSharedRecommendations = async (params: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: params.lat,
          lon: params.lon,
          startDate: params.startDate,
          endDate: params.endDate,
          mode: params.mode,
          prefs: {
            prefTempF: params.prefTemp,
            maxWindMph: params.maxWind,
            uvGood: params.uvGood,
          },
          windowHours: params.windowHours,
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
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-8">Shared Beach Windows</h1>
          
          {location && (
            <div className="mb-6 p-4 bg-card border border-line rounded-2xl">
              <p className="text-subtext">
                Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
            </div>
          )}

          <ResultsList 
            windows={windows}
            loading={loading}
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </main>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SharePageContent />
    </Suspense>
  )
}

