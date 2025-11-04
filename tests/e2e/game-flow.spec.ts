import { test, expect } from '@playwright/test'

test.describe('Horse Racing Game - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display initial state correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Horse Racing Simulator')
    await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Race' })).toBeDisabled()
  })

  test('should generate schedule successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    
    // Verify horses are generated
    await page.click('text=🐴 Horses')
    await expect(page.locator('h2').filter({ hasText: '🐴 Horse Roster (20/20)' })).toBeVisible()

    // Verify schedule is created
    await page.click('text=📅 Schedule')
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Round 6' })).toBeVisible()

    // Verify Start Race button is now enabled
    await expect(page.getByRole('button', { name: 'Start Race' })).toBeEnabled()
  })

  test('should prevent schedule generation during race', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    await expect(page.getByRole('button', { name: 'Generate Schedule' })).toBeDisabled()
  })

  test('should run a complete race', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
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
    await page.getByRole('button', { name: 'Generate Schedule' }).click()

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
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
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
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
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
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    await page.getByRole('button', { name: 'Start Race' }).click()

    // Wait a bit for race to progress
    await page.waitForTimeout(2000)

    // Verify leaderboard is visible
    await expect(page.locator('text=1.')).toBeVisible()
    await expect(page.locator('text=10.')).toBeVisible()
  })

  test('should display horse conditions', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    await page.click('text=🐴 Horses')

    // Verify all 20 horses are displayed with conditions
    const conditions = page.locator('text=condition')
    await expect(conditions).toHaveCount(20)
  })

  test('should highlight selected horses in current race', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Schedule' }).click()
    await page.click('text=🐴 Horses')

    // Count highlighted horses (should be 10)
    const selectedHorses = page.locator('div.w-12.h-12.rounded-full.border-2.border-yellow-500')
    await expect(selectedHorses).toHaveCount(10)
  })
})

