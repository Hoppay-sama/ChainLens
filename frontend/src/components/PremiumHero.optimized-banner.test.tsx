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

describe('PremiumHero optimized banner', () => {
  it('uses a compact first-viewport bitmap for the animated hero banner', () => {
    renderHero()

    const banner = screen.getByTestId('hero-banner-image')

    expect(banner).toHaveAttribute('src', expect.stringContaining('hero-banner.webp'))
    expect(banner).toHaveAttribute('fetchpriority', 'high')
    expect(banner).toHaveAttribute('decoding', 'async')
  })
})
