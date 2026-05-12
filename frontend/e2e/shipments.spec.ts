import { test, expect } from '@playwright/test'
import { setupRoutes } from './helpers/routes'

test.beforeEach(async ({ page }) => {
  await setupRoutes(page)
  await page.goto('/shipments')
  // Wait for the table to render before each test
  await expect(page.getByText('SHP-001')).toBeVisible()
})

test('shipment table renders rows from mocked data', async ({ page }) => {
  await expect(page.getByText('SHP-001')).toBeVisible()
  await expect(page.getByText('Shanghai')).toBeVisible()
  await expect(page.getByText('Rotterdam')).toBeVisible()
  await expect(page.getByText('SHP-002')).toBeVisible()
  await expect(page.getByText('New York')).toBeVisible()
  await expect(page.getByText('London')).toBeVisible()
})

test('search input has the correct placeholder', async ({ page }) => {
  await expect(
    page.getByPlaceholder('Search by origin or destination...')
  ).toBeVisible()
})

test('Add Shipment button opens the modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Shipment' }).click()
  // The modal's submit button "Create Shipment" confirms the modal is open
  await expect(page.getByRole('button', { name: 'Create Shipment' })).toBeVisible()
  // ProductCombobox placeholder is visible in add mode
  await expect(page.getByPlaceholder('e.g., PROD-8842')).toBeVisible()
})

test('edit button opens the modal pre-filled with shipment data', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit shipment SHP-001' }).click()
  // Modal title switches to "Edit Shipment"
  await expect(page.getByText('Edit Shipment')).toBeVisible()
  // Submit button says "Save Changes" in edit mode
  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible()
  // Origin field is pre-populated from MOCK_SHIPMENTS[0].origin
  await expect(page.getByPlaceholder('Origin location')).toHaveValue('Shanghai')
})

test('status filter select shows all status options', async ({ page }) => {
  // The status select contains "All Statuses" as its first option
  const statusSelect = page.locator('select').filter({ hasText: 'All Statuses' })
  await expect(statusSelect).toBeVisible()
  // 5 options: All Statuses, Created, In Transit, At Checkpoint, Delivered
  await expect(statusSelect.locator('option')).toHaveCount(5)
})
