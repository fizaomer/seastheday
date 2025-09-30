'use client'

import { UserPreferences } from '@/types'

interface ControlsPanelProps {
  preferences: UserPreferences
  onPreferencesChange: (prefs: UserPreferences) => void
}

export default function ControlsPanel({ preferences, onPreferencesChange }: ControlsPanelProps) {
  const updatePreference = (key: keyof UserPreferences, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    })
  }

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-text mb-6">Preferences</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">Activity Mode</label>
          <div className="flex gap-2">
            {[
              { value: 'lounge', label: 'Lounge', desc: 'Relaxing on the beach' },
              { value: 'swim', label: 'Swim', desc: 'Swimming and water activities' },
              { value: 'surf', label: 'Surf', desc: 'Catching waves' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => updatePreference('mode', mode.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  preferences.mode === mode.value
                    ? 'bg-primary text-white'
                    : 'bg-line text-subtext hover:bg-line/80'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-subtext mb-1">Start</label>
              <input
                type="date"
                value={preferences.startDate}
                onChange={(e) => updatePreference('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-subtext mb-1">End</label>
              <input
                type="date"
                value={preferences.endDate}
                onChange={(e) => updatePreference('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            Preferred Temperature: {preferences.prefTempF}°F
          </label>
          <input
            type="range"
            min="60"
            max="85"
            value={preferences.prefTempF}
            onChange={(e) => updatePreference('prefTempF', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-subtext mt-1">
            <span>60°F</span>
            <span>85°F</span>
          </div>
        </div>

        {/* Wind */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            Max Wind Speed: {preferences.maxWindMph} mph
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={preferences.maxWindMph}
            onChange={(e) => updatePreference('maxWindMph', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-subtext mt-1">
            <span>5 mph</span>
            <span>20 mph</span>
          </div>
        </div>

        {/* UV Index */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            UV Index Cap: {preferences.uvGood}
          </label>
          <input
            type="range"
            min="3"
            max="10"
            value={preferences.uvGood}
            onChange={(e) => updatePreference('uvGood', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-subtext mt-1">
            <span>3</span>
            <span>10</span>
          </div>
        </div>

        {/* Window Hours */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            Window Duration: {preferences.windowHours} hours
          </label>
          <input
            type="range"
            min="2"
            max="4"
            step="0.5"
            value={preferences.windowHours}
            onChange={(e) => updatePreference('windowHours', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-subtext mt-1">
            <span>2h</span>
            <span>4h</span>
          </div>
        </div>

        {/* Water Temperature - only for swim and surf modes */}
        {(preferences.mode === 'swim' || preferences.mode === 'surf') && (
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Min Water Temperature: {preferences.waterTempF || 65}°F
            </label>
            <input
              type="range"
              min="55"
              max="80"
              value={preferences.waterTempF || 65}
              onChange={(e) => updatePreference('waterTempF', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-subtext mt-1">
              <span>55°F</span>
              <span>80°F</span>
            </div>
          </div>
        )}

        {/* Wave Height - only for surf mode */}
        {preferences.mode === 'surf' && (
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Min Wave Height: {preferences.waveHeightFt || 2} ft
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={preferences.waveHeightFt || 2}
              onChange={(e) => updatePreference('waveHeightFt', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-subtext mt-1">
              <span>1 ft</span>
              <span>8 ft</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
