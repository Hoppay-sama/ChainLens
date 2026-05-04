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
})
