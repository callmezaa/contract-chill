import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskScoreMeter } from './RiskScoreMeter'

describe('RiskScoreMeter', () => {
  it('displays the score in sr-only text', () => {
    render(<RiskScoreMeter score={45} />)
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('displays "Safe" label for score < 30', () => {
    render(<RiskScoreMeter score={15} />)
    expect(screen.getByText('Safe')).toBeInTheDocument()
  })

  it('displays "Moderate" label for score between 30 and 59', () => {
    render(<RiskScoreMeter score={45} />)
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  it('displays "High Risk" label for score >= 60', () => {
    render(<RiskScoreMeter score={85} />)
    expect(screen.getByText('High Risk')).toBeInTheDocument()
  })

  it('displays 0 for score of 0', () => {
    const { container } = render(<RiskScoreMeter score={0} />)
    const srOnly = container.querySelector('.sr-only')
    expect(srOnly).toHaveTextContent('0')
  })

  it('displays 100 for score of 100', () => {
    render(<RiskScoreMeter score={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders "Overall risk score" subtitle', () => {
    render(<RiskScoreMeter score={50} />)
    expect(screen.getByText('Overall risk score')).toBeInTheDocument()
  })
})