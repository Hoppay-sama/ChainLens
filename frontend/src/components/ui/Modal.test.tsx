import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/ui/Modal'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders children when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders the title prop', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Title">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the overlay backdrop is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders a dialog role element when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders a container div element', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('applies a custom className', () => {
    const { container } = render(<Card className="my-card">Content</Card>)
    expect(container.firstChild).toHaveClass('my-card')
  })
})

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders with size="sm"', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner.className).toContain('h-4')
  })

  it('has an accessible aria-label of "Loading"', () => {
    render(<LoadingSpinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })
})
