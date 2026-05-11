import { describe, it, expect } from 'vitest'
import {
  formatAddress,
  formatTimestamp,
  formatDuration,
  formatNumber,
  formatDate,
} from '@/utils/formatters'

describe('formatAddress', () => {
  it('returns address as-is when shorter than 10 chars', () => {
    expect(formatAddress('0x123')).toBe('0x123')
  })

  it('returns empty string as-is', () => {
    expect(formatAddress('')).toBe('')
  })

  it('truncates a valid 42-char ethereum address', () => {
    const address = '0x1234567890123456789012345678901234abcd'
    expect(formatAddress(address)).toBe('0x1234...abcd')
  })

  it('shows first 6 and last 4 chars separated by ellipsis', () => {
    const address = '0xABCDEF0000000000000000000000000000001234'
    const result = formatAddress(address)
    expect(result).toBe('0xABCD...1234')
  })
})

describe('formatTimestamp', () => {
  it('formats a Date object to a human-readable string containing month, day, and year', () => {
    const result = formatTimestamp(new Date('2024-01-15T10:00:00Z'))
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })

  it('formats an ISO string', () => {
    const result = formatTimestamp('2024-06-20T00:00:00Z')
    expect(result).toContain('2024')
  })

  it('formats a numeric timestamp (ms)', () => {
    // 2024-01-01 00:00:00 UTC
    const result = formatTimestamp(1704067200000)
    expect(result).toContain('2024')
  })
})

describe('formatDuration', () => {
  it('returns minutes only for values under 60 seconds', () => {
    expect(formatDuration(45)).toBe('0m')
  })

  it('returns minutes for exactly 60 seconds', () => {
    expect(formatDuration(60)).toBe('1m')
  })

  it('returns hours and minutes for values under one day', () => {
    expect(formatDuration(3600)).toBe('1h 0m')
  })

  it('returns days and hours for exactly one day', () => {
    expect(formatDuration(86400)).toBe('1d 0h')
  })

  it('returns days and hours for mixed day+hour+minute value', () => {
    // 1d 1h 1m 1s
    expect(formatDuration(90061)).toBe('1d 1h')
  })
})

describe('formatNumber', () => {
  it('returns the number as a string when under 1000', () => {
    expect(formatNumber(999)).toBe('999')
  })

  it('formats 1000 as 1.0K', () => {
    expect(formatNumber(1000)).toBe('1.0K')
  })

  it('formats 1_500_000 as 1.5M', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M')
  })

  it('formats exactly 1_000_000 as 1.0M', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M')
  })
})

describe('formatDate', () => {
  it('returns "N/A" for an empty string', () => {
    expect(formatDate('')).toBe('N/A')
  })

  it('formats a valid ISO string to contain month abbreviation and year', () => {
    const result = formatDate('2024-01-15T10:00:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })
})
