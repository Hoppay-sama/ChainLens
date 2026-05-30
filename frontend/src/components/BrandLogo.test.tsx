import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import BrandLogo from './BrandLogo'

describe('BrandLogo', () => {
  it('renders the generated Veritras crystal logo asset', () => {
    render(<BrandLogo className="h-10 w-10" />)

    const logo = screen.getByRole('img', { name: 'Veritras crystal logo' })

    expect(logo).toHaveAttribute('src', expect.stringContaining('veritras-crystal-logo-512.png'))
    expect(logo).toHaveClass('h-full')
    expect(logo).toHaveClass('w-full')
  })
})
