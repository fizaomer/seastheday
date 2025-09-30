import { render, screen } from '@testing-library/react'
import ResultsList from '../ResultsList'
import { BeachWindow } from '@/types'

const mockWindows: BeachWindow[] = [
  {
    score: 8.5,
    start: '2024-01-01T12:00:00Z',
    end: '2024-01-01T15:00:00Z',
    summary: {
      tempF: 75,
      uv: 6,
      windMph: 8,
      cloudPct: 20
    },
    reasons: ['clear skies', 'perfect temperature', 'calm winds']
  }
]

describe('ResultsList', () => {
  it('renders windows when provided', () => {
    render(
      <ResultsList 
        windows={mockWindows}
        loading={false}
        error={null}
        onRetry={() => {}}
      />
    )
    
    expect(screen.getByText('Best Beach Windows')).toBeInTheDocument()
    expect(screen.getByText('8.5/10')).toBeInTheDocument()
    expect(screen.getByText('75°F')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <ResultsList 
        windows={[]}
        loading={true}
        error={null}
        onRetry={() => {}}
      />
    )
    
    expect(screen.getByText('Best Beach Windows')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <ResultsList 
        windows={[]}
        loading={false}
        error="API Error"
        onRetry={() => {}}
      />
    )
    
    expect(screen.getByText("We couldn't fetch the forecast")).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(
      <ResultsList 
        windows={[]}
        loading={false}
        error={null}
        onRetry={() => {}}
      />
    )
    
    expect(screen.getByText('No stellar windows in that range')).toBeInTheDocument()
  })
})

