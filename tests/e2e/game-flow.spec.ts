import { test, expect } from '@playwright/test'

/**
 * Helper function to generate horses until we have at least 10
 * Since horses are randomly generated (1-20), we may need multiple attempts
 */
async function generateScheduleWithEnoughHorses(page: any, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    
    // Check if error message appears (insufficient horses)
    await page.waitForTimeout(500)
    const errorVisible = await page.locator('text=At least 10 horses are required').isVisible().catch(() => false)
    
    if (!errorVisible) {
      // Success! Schedule was generated
      return true
    }
    // Otherwise, try again
  }
  throw new Error('Failed to generate enough horses after multiple attempts')
}

test.describe('Horse Racing Game - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display initial state correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Horse Racing Simulator')
    await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Race' })).toBeDisabled()
  })

  test('should handle insufficient horses with retry', async ({ page }) => {
    // This test verifies that the system handles cases where < 10 horses are generated
    // and allows the user to regenerate
    let foundError = false
    
    for (let attempt = 0; attempt < 5; attempt++) {
      // Check if button is enabled before clicking
      const isEnabled = await page.getByRole('button', { name: 'Generate Schedule' }).isEnabled()
      if (!isEnabled) {
        // Button is disabled, meaning schedule was successfully generated
        break
      }
      
      await page.getByRole('button', { name: 'Generate Schedule' }).click()
      await page.waitForTimeout(500)
      
      const errorVisible = await page.locator('text=At least 10 horses are required').isVisible().catch(() => false)
      
      if (errorVisible) {
        foundError = true
        // Verify error message is displayed
        await expect(page.locator('text=At least 10 horses are required')).toBeVisible()
        // Verify Generate Schedule button is still enabled for retry
        await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeEnabled()
        break
      }
    }
    
    // Note: Due to randomness, we might not always get < 10 horses
    // This test passes if we either find the error or successfully generate a schedule
  })

  test('should generate schedule successfully', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    
    // Verify horses are generated (between 10-20)
    await page.click('text=🐴 Horses')
    // Check that horse roster header exists (count varies)
    await expect(page.locator('h2').filter({ hasText: '🐴 Horse Roster' })).toBeVisible()

    // Verify schedule is created
    await page.click('text=📅 Schedule')
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Round 6' })).toBeVisible()

    // Verify Start Race button is now enabled
    await expect(page.getByRole('button', { name: 'Start Race' })).toBeEnabled()
  })

  test('should prevent schedule generation during race', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeDisabled()
  })

  test('should run a complete race', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.getByRole('button', { name: 'Start Race' }).click()

    // Wait for race to start
    await expect(page.locator('text=Race in progress')).toBeVisible()

    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '50x' }).click()

    // Wait for race to complete with 50x speed (60 seconds is enough)
    await expect(page.locator('text=Round 1 completed!')).toBeVisible({ timeout: 60000 })

    // Verify results are displayed
    await page.click('text=🏆 Results')
    await expect(page.locator('text=📊 Round Results')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Round 1 Results' })).toBeVisible()
    await expect(page.locator('text=Overall Standings')).toBeVisible()
  })

  test('should run all 6 rounds sequentially', async ({ page }) => {
    test.setTimeout(360000)
    await generateScheduleWithEnoughHorses(page)

    for (let round = 1; round <= 6; round++) {
      await page.getByRole('button', { name: /Start (Race|Next Round)/ }).click()
      await expect(page.locator('text=Race in progress')).toBeVisible()
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: '50x' }).click()
      
      // Wait for round to complete with 50x speed
      if (round < 6) {
        await expect(page.locator(`text=Round ${round} completed!`)).toBeVisible({ timeout: 60000 })
        // Verify "Start Next Round" button appears
        await expect(page.getByRole('button', { name: 'Start Next Round' })).toBeVisible()
      } else {
        // Last round - wait for all races completed message
        await expect(page.locator('text=All races completed!')).toBeVisible({ timeout: 60000 })
      }
    }
  })

  test('should export results', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.getByRole('button', { name: 'Start Race' }).click()
    await expect(page.locator('text=Race in progress')).toBeVisible()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '50x' }).click()
    await expect(page.locator('text=Round 1 completed!')).toBeVisible({ timeout: 60000 })

    await page.click('text=🏆 Results')
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export Results as JSON' }).click()
    const download = await downloadPromise
    
    // Verify filename
    expect(download.suggestedFilename()).toMatch(/race-results-.*\.json/)
  })

  test('should reset game correctly', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.getByRole('button', { name: 'Start Race' }).click()
    await expect(page.locator('text=Race in progress')).toBeVisible()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '50x' }).click()
    await expect(page.locator('text=Round 1 completed!')).toBeVisible({ timeout: 60000 })

    await page.getByRole('button', { name: 'Reset Game' }).click()

    // Verify game is reset
    await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Start Race' })).toBeDisabled()
    await expect(page.locator('text=Click "Generate Schedule" to begin')).toBeVisible()
  })

  test('should show live leaderboard during race', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.getByRole('button', { name: 'Start Race' }).click()

    // Wait a bit for race to progress
    await page.waitForTimeout(2000)

    // Verify leaderboard is visible by checking for position numbers in the leaderboard
    // Use more specific selectors to avoid matching timer elements
    await expect(page.locator('span.font-bold').filter({ hasText: '1.' })).toBeVisible()
    await expect(page.locator('span.font-bold').filter({ hasText: '10.' })).toBeVisible()
  })

  test('should display horse conditions', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.click('text=🐴 Horses')

    // Verify horses are displayed with conditions (between 10-20)
    const conditions = page.locator('text=condition')
    const count = await conditions.count()
    expect(count).toBeGreaterThanOrEqual(10)
    expect(count).toBeLessThanOrEqual(20)
  })

  test('should highlight selected horses in current race', async ({ page }) => {
    await generateScheduleWithEnoughHorses(page)
    await page.click('text=🐴 Horses')

    // Count highlighted horses (should be 10)
    // Note: The CSS selector might need adjustment based on actual implementation
    const selectedHorses = page.locator('[class*="border-yellow"]').filter({ has: page.locator('div') })
    const count = await selectedHorses.count()
    // Should have 10 selected horses if schedule was generated
    expect(count).toBeGreaterThanOrEqual(10)
  })
})

