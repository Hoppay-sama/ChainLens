import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { render } from '@testing-library/react'
import EtherealBackground from './EtherealBackground'

describe('EtherealBackground', () => {
  let rafSpy: MockInstance<[FrameRequestCallback], number>
  let rafCallbacks: Array<(time: number) => void> = []

  beforeEach(() => {
    vi.useFakeTimers()
    rafCallbacks = []

    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb as unknown as (time: number) => void)
      return rafCallbacks.length
    })

    // Minimal Canvas 2D context mock
    const mockGradient = {
      addColorStop: vi.fn(),
    }

    const mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      createRadialGradient: vi.fn(() => mockGradient),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockCtx as any
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not call requestAnimationFrame synchronously on mount (regression: FCP 11.46s)', () => {
    render(<EtherealBackground />)
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('defers canvas initialization via setTimeout(..., 0)', () => {
    render(<EtherealBackground />)
    expect(rafSpy).not.toHaveBeenCalled()

    // Flush the setTimeout(..., 0) deferral
    vi.advanceTimersByTime(0)

    expect(rafSpy).toHaveBeenCalledTimes(1)
    expect(rafCallbacks.length).toBe(1)
  })

  it('registers the resize listener only after the deferral', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const { unmount } = render(<EtherealBackground />)

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )

    vi.advanceTimersByTime(0)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )

    unmount()
    addEventListenerSpy.mockRestore()
  })

  it('cleans up the deferred timeout if unmounted before it fires', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<EtherealBackground />)

    expect(rafSpy).not.toHaveBeenCalled()

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(rafSpy).not.toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })
})
