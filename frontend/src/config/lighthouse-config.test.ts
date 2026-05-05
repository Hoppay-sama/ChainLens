import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

describe('Lighthouse CI config', () => {
  const configPath = resolve(import.meta.dirname, '../../lighthouserc.cjs')

  it('exists as a .cjs file (regression: ReferenceError in ES module scope)', () => {
    const content = readFileSync(configPath, 'utf-8')
    expect(content).toContain('module.exports')
  })

  it('can be required without throwing (regression: ReferenceError in ES module scope)', () => {
    const require = createRequire(import.meta.url)
    let config: unknown
    expect(() => {
      config = require(configPath)
    }).not.toThrow()
    expect(config).toBeDefined()
    expect(config).toHaveProperty('ci')
    expect((config as any).ci).toHaveProperty('collect')
    expect((config as any).ci).toHaveProperty('assert')
    expect((config as any).ci).toHaveProperty('upload')
  })

  it('has server ready pattern and timeout to prevent waiting indefinitely (regression: CI timeout)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const collect = config.ci.collect

    expect(collect.startServerReadyPattern).toBeDefined()
    expect(collect.startServerReadyPattern).toBe('Local:')
    expect(collect.startServerReadyTimeout).toBe(60000)
  })

  it('has chromeFlags as string with --no-sandbox to prevent Chrome crash on Ubuntu 24.04 (regression: NO_FCP)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const flags = config.ci.collect.settings?.chromeFlags

    expect(flags).toBeDefined()
    expect(typeof flags).toBe('string')
    expect(flags).toContain('--no-sandbox')
    expect(flags).toContain('--disable-setuid-sandbox')
    expect(flags).toContain('--disable-dev-shm-usage')
    expect(flags).toContain('--disable-features=IsolateOrigins,site-per-process')
  })
})
