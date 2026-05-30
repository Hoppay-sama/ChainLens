import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PremiumHero from './PremiumHero'

vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, React.FC<any>>, {
    get(_, tag: string) {
      return function MotionComponent({ children, ...props }: any) {
        const motionProps = new Set(['initial', 'animate', 'variants', 'custom', 'transition'])
        const cleanedProps = Object.fromEntries(
          Object.entries(props).filter(([key]) => !motionProps.has(key))
        )
        const Tag = tag as keyof JSX.IntrinsicElements
        return <Tag {...cleanedProps}>{children}</Tag>
      }
    },
  }),
}))

function renderHero() {
  return render(
    <MemoryRouter>
      <PremiumHero />
    </MemoryRouter>
  )
}

describe('PremiumHero animated banner', () => {
  it('renders the generated hero bitmap as a decorative animated layer', () => {
    renderHero()

    const banner = screen.getByTestId('hero-banner-image')

    expect(banner).toHaveAttribute('alt', '')
    expect(banner).toHaveAttribute('aria-hidden', 'true')
    expect(banner).toHaveAttribute('src', expect.stringContaining('hero-banner.png'))
  })

  it('centers the animated banner stage across the hero instead of offsetting it right', () => {
    renderHero()

    const stage = screen.getByRole('img', { name: 'Supply-chain provenance model' })

    expect(stage).toHaveClass('inset-0')
    expect(stage.className).not.toContain('right-[-')
    expect(screen.getByTestId('hero-banner-image')).toHaveClass('object-center')
  })
})
