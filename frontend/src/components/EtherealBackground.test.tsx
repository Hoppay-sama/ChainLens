import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { render } from '@testing-library/react'
import EtherealBackground from './EtherealBackground'

describe('EtherealBackground', () => {
  let rafSpy: MockInstance<[FrameRequestCallback], number>
  let rafCallbacks: Array<(time: number) => void> = []
  let ricSpy: ReturnType<typeof vi.fn>
  let cicSpy: ReturnType<typeof vi.fn>
  let mockCtx: any

  beforeEach(() => {
    vi.useFakeTimers()
    rafCallbacks = []

    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb as unknown as (time: number) => void)
      return rafCallbacks.length
    })

    // Mock requestIdleCallback / cancelIdleCallback for jsdom
    ricSpy = vi.fn((cb: () => void) => {
      return window.setTimeout(cb, 0)
    })
    cicSpy = vi.fn((id: number) => {
      window.clearTimeout(id)
    })

    Object.defineProperty(window, 'requestIdleCallback', {
      value: ricSpy,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'cancelIdleCallback', {
      value: cicSpy,
      writable: true,
      configurable: true,
    })

    // Minimal Canvas 2D context mock
    const mockGradient = {
      addColorStop: vi.fn(),
    }

    mockCtx = {
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

    // Consistent viewport size for deterministic particle counts
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not call requestAnimationFrame synchronously on mount (regression: LCP 10.84s)', () => {
    render(<EtherealBackground />)
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('defers canvas initialization via requestIdleCallback with a meaningful timeout', () => {
    render(<EtherealBackground />)

    expect(ricSpy).toHaveBeenCalledTimes(1)
    expect(ricSpy).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 })

    // Flush the requestIdleCallback deferral
    vi.advanceTimersByTime(0)

    expect(rafSpy).toHaveBeenCalledTimes(1)
    expect(rafCallbacks.length).toBe(1)
  })

  it('falls back to setTimeout(..., 1500) when requestIdleCallback is unavailable', () => {
    delete (window as any).requestIdleCallback
    delete (window as any).cancelIdleCallback

    render(<EtherealBackground />)

    // Should NOT have fired immediately (old bug used setTimeout(..., 0))
    expect(rafSpy).not.toHaveBeenCalled()

    // Just before 1500ms — still not started
    vi.advanceTimersByTime(1499)
    expect(rafSpy).not.toHaveBeenCalled()

    // At 1500ms the deferral fires and schedules the first animation frame
    vi.advanceTimersByTime(1)
    expect(rafSpy).toHaveBeenCalledTimes(1)
  })

  it('limits particle count using reduced divisor of 12000 (regression: main thread blocking)', () => {
    // Use a large viewport where the difference between /8000 and /12000 is significant
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true, configurable: true })

    render(<EtherealBackground />)
    vi.advanceTimersByTime(0)

    expect(rafCallbacks.length).toBe(1)
    rafCallbacks[0](0)

    const expectedParticles = Math.floor((1920 * 1080) / 12000) // 172
    expect(mockCtx.arc).toHaveBeenCalledTimes(expectedParticles)
  })

  it('does not draw per-particle radial gradients', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true, configurable: true })

    render(<EtherealBackground />)
    vi.advanceTimersByTime(0)

    expect(rafCallbacks.length).toBe(1)
    rafCallbacks[0](0)

    // Only the 3 ambient orbs should create radial gradients, not each particle
    expect(mockCtx.createRadialGradient).toHaveBeenCalledTimes(3)
  })

  it('recalculates particle count on resize using the reduced divisor', () => {
    // Initial size: 1024×768 => 65 particles
    render(<EtherealBackground />)
    vi.advanceTimersByTime(0)

    expect(rafCallbacks.length).toBe(1)
    rafCallbacks[0](0)

    const initialCount = Math.floor((1024 * 768) / 12000) // 65
    expect(mockCtx.arc).toHaveBeenCalledTimes(initialCount)

    // Resize to 800×600 => 40 particles
    mockCtx.arc.mockClear()
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true, configurable: true })

    window.dispatchEvent(new Event('resize'))

    // The next animation frame should use the recalculated count
    expect(rafCallbacks.length).toBe(2)
    rafCallbacks[1](16)

    const resizedCount = Math.floor((800 * 600) / 12000) // 40
    expect(mockCtx.arc).toHaveBeenCalledTimes(resizedCount)
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

  it('cleans up the deferred callback if unmounted before it fires', () => {
    const { unmount } = render(<EtherealBackground />)

    expect(rafSpy).not.toHaveBeenCalled()

    unmount()

    expect(cicSpy).toHaveBeenCalled()
    expect(rafSpy).not.toHaveBeenCalled()

    cicSpy.mockRestore()
  })

  it('does not leak timers or animation frames when rapidly mounted and unmounted', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const { unmount } = render(<EtherealBackground />)
    unmount()

    // If the deferral was not cancelled, running all pending timers would
    // start the animation loop and register event listeners — a leak that
    // the old buggy code exhibited.
    vi.runAllTimers()

    expect(rafSpy).not.toHaveBeenCalled()
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('resize', expect.any(Function))

    addEventListenerSpy.mockRestore()
  })
})
