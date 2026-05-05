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

  it('uses staticDistDir instead of startServerCommand (regression: CI server timeout)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const collect = config.ci.collect

    // staticDistDir uses LHCI's built-in static server, avoiding vite
    // preview startup delays that cause timeout on CI runners.
    expect(collect.staticDistDir).toBe('./dist')
    expect(collect.startServerCommand).toBeUndefined()
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
    expect(flags).toContain('--disable-background-timer-throttling')
    expect(flags).toContain('--disable-renderer-backgrounding')
    expect(flags).toContain('--window-size=1920,1080')
  })

  it('uses desktop preset to avoid aggressive mobile throttling on CI (regression: NO_FCP)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const preset = config.ci.collect.settings?.preset

    expect(preset).toBeDefined()
    expect(preset).toBe('desktop')
  })

  it('has maxWaitForFcp to allow slow CI runners to render (regression: NO_FCP)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const maxWait = config.ci.collect.settings?.maxWaitForFcp

    expect(maxWait).toBeDefined()
    expect(maxWait).toBe(120000)
  })

  it('has maxWaitForLoad to prevent timeout on heavy JS bundles (regression: NO_FCP)', () => {
    const require = createRequire(import.meta.url)
    const config = require(configPath)
    const maxWait = config.ci.collect.settings?.maxWaitForLoad

    expect(maxWait).toBeDefined()
    expect(maxWait).toBe(120000)
  })
})
