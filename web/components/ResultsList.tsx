'use client'

import { BeachWindow } from '@/types'
import { Sun, Wind, Cloud, Thermometer, RefreshCw } from 'lucide-react'

interface ResultsListProps {
  windows: BeachWindow[]
  loading: boolean
  error: string | null
  onRetry: () => void
  location?: { name?: string; lat: number; lon: number } | null
}

export default function ResultsList({ windows, loading, error, onRetry, location }: ResultsListProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-accent'
    if (score >= 6) return 'text-warn'
    return 'text-subtext'
  }

  const getWeatherIcon = (cloudPct: number, tempF: number) => {
    if (cloudPct < 20) return '☀️'
    if (cloudPct < 60) return '⛅'
    return '☁️'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-line rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-line rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center">
        <div className="text-bad mb-4">
          <Cloud className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">We couldn&apos;t fetch the forecast</h3>
          <p className="text-subtext">Check your connection or try again.</p>
        </div>
        <button onClick={onRetry} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  if (windows.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-subtext mb-4">
          <Sun className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">No stellar windows in that range</h3>
          <p>Here&apos;s the closest match and why.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text">Best Beach Windows</h2>
        {location && (
          <div className="text-sm text-subtext">
            for {location.name || 'Current Location'}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {windows.map((window, index) => (
          <div key={index} className="border border-line rounded-2xl p-6 hover:shadow-coastal transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getWeatherIcon(window.summary.cloudPct, window.summary.tempF)}</span>
              <div>
                <div className="font-semibold text-text">
                  {formatDate(window.start)} • {formatTime(window.start)}–{formatTime(window.end)}
                </div>
                <div className="text-sm text-subtext">
                  {window.reasons.slice(0, 2).join(' • ')}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-subtext" />
                <span className="font-medium">{window.summary.tempF}°F</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-subtext" />
                <span className="font-medium">UV {window.summary.uv}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-subtext" />
                <span className="font-medium">{window.summary.windMph} mph</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-subtext" />
                <span className="font-medium">{window.summary.cloudPct}%</span>
              </div>
            </div>
            
            {window.reasons.length > 2 && (
              <div className="mt-3 text-xs text-subtext">
                {window.reasons.slice(2).join(' • ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
