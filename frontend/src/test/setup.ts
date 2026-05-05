import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => {
  const motionPropsToFilter = new Set([
    'initial',
    'animate',
    'whileInView',
    'viewport',
    'transition',
    'variants',
    'custom',
    'whileHover',
    'whileTap',
    'exit',
    'layout',
    'layoutId',
  ])
  const MotionProxy = new Proxy({} as Record<string, any>, {
    get(_, tag: string) {
      return function MotionComponent({ children, ...props }: any) {
        const cleaned = Object.fromEntries(
          Object.entries(props).filter(([key]) => !motionPropsToFilter.has(key))
        )
        return React.createElement(tag === 'div' ? 'div' : tag || 'div', cleaned, children)
      }
    },
  })
  return {
    motion: MotionProxy,
    AnimatePresence: ({ children }: { children: any }) =>
      React.createElement(React.Fragment, null, children),
  }
})

vi.mock('recharts', () => {
  const ResponsiveContainer = ({ children }: { children: any }) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children)

  return {
    AreaChart: () => null,
    Area: () => null,
    BarChart: () => null,
    Bar: () => null,
    PieChart: () => null,
    Pie: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer,
  }
})

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return new Proxy(actual, {
    get(target, prop) {
      if (typeof prop !== 'string') return (target as any)[prop]
      if (!/^[A-Z]/.test(prop)) return (target as any)[prop]
      return function Icon({ className, ...props }: any) {
        return React.createElement('svg', { 'data-testid': `icon-${prop}`, className, ...props })
      }
    },
  })
})
