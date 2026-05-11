import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies the disabled attribute when disabled={true}', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies bg-accent class for the default primary variant', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button').className).toContain('bg-accent')
  })

  it('renders secondary variant without error', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
  })

  it('renders ghost variant without error', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders as a <span> element', () => {
    const { container } = render(<Badge>Active</Badge>)
    expect(container.firstChild?.nodeName).toBe('SPAN')
  })

  it('renders default variant without error', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it.each([
    'default',
    'accent',
    'blue',
    'orange',
    'purple',
    'success',
    'warning',
    'error',
  ] as const)('renders variant "%s" without error', (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>)
    expect(screen.getByText(variant)).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    const { container } = render(<Badge className="custom-class">Label</Badge>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
