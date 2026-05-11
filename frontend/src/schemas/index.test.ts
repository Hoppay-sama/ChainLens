import { describe, it, expect } from 'vitest'
import { ProductSchema, ShipmentSchema } from '@/schemas/index'

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'

describe('ProductSchema', () => {
  it('accepts a valid minimal product', () => {
    const result = ProductSchema.safeParse({ name: 'Widget', manufacturer_address: VALID_ADDRESS })
    expect(result.success).toBe(true)
  })

  it('accepts a product with all optional fields', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: VALID_ADDRESS,
      description: 'A test widget',
      metadata_uri: 'https://example.com/meta.json',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a name that is too short (1 char)', () => {
    const result = ProductSchema.safeParse({ name: 'W', manufacturer_address: VALID_ADDRESS })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('name')
    }
  })

  it('rejects a name that is too long (101 chars)', () => {
    const result = ProductSchema.safeParse({
      name: 'W'.repeat(101),
      manufacturer_address: VALID_ADDRESS,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid ethereum address', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: 'not-an-address',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('manufacturer_address')
    }
  })

  it('rejects a description that is too long (501 chars)', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: VALID_ADDRESS,
      description: 'D'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid metadata_uri that is not a URL and not empty', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: VALID_ADDRESS,
      metadata_uri: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts an empty string for description', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: VALID_ADDRESS,
      description: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts an empty string for metadata_uri', () => {
    const result = ProductSchema.safeParse({
      name: 'Widget',
      manufacturer_address: VALID_ADDRESS,
      metadata_uri: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('ShipmentSchema', () => {
  it('accepts a valid minimal shipment', () => {
    const result = ShipmentSchema.safeParse({
      product_id: 'PROD-001',
      origin: 'NYC',
      destination: 'LA',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a shipment missing product_id', () => {
    const result = ShipmentSchema.safeParse({ origin: 'NYC', destination: 'LA' })
    expect(result.success).toBe(false)
  })

  it('rejects an origin that is too short (1 char)', () => {
    const result = ShipmentSchema.safeParse({
      product_id: 'PROD-001',
      origin: 'N',
      destination: 'LA',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a destination that is too long (101 chars)', () => {
    const result = ShipmentSchema.safeParse({
      product_id: 'PROD-001',
      origin: 'NYC',
      destination: 'D'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('rejects notes that are too long (501 chars)', () => {
    const result = ShipmentSchema.safeParse({
      product_id: 'PROD-001',
      origin: 'NYC',
      destination: 'LA',
      notes: 'N'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts an empty string for notes', () => {
    const result = ShipmentSchema.safeParse({
      product_id: 'PROD-001',
      origin: 'NYC',
      destination: 'LA',
      notes: '',
    })
    expect(result.success).toBe(true)
  })
})
