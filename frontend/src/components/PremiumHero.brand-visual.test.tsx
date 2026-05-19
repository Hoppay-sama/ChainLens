import { type ReactNode } from 'react'
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

describe('PremiumHero brand visual', () => {
  it('renders a Veritras provenance mark and code-native supply-chain model', () => {
    renderHero()

    expect(
      screen.getByRole('img', { name: 'Veritras provenance mark' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Supply-chain provenance model' })
    ).toBeInTheDocument()
  })
})
