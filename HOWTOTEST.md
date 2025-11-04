# 🧪 Testing Guide

This document provides comprehensive instructions for running and understanding the test suite for the Horse Racing Simulator.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Unit Tests (Vitest)](#unit-tests-vitest)
- [E2E Tests (Playwright)](#e2e-tests-playwright)
- [Test Coverage](#test-coverage)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The project includes two types of tests:

1. **Unit Tests**: Test individual functions, utilities, and Vuex store modules
2. **E2E Tests**: Test complete user workflows in a real browser environment

**Test Statistics:**
- ✅ 37 Unit Tests (100% passing)
- ✅ 10 E2E Tests (100% passing)
- ✅ Total execution time: ~3 minutes

## 📦 Prerequisites

### Install Dependencies

```bash
# Install all project dependencies
npm install

# Install Playwright browsers (required for E2E tests)
npx playwright install
```

### Verify Installation

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version
npm --version
```

## 🔬 Unit Tests (Vitest)

Unit tests cover utilities and Vuex store modules using Vitest, a fast Vite-native testing framework.

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (auto-rerun on file changes)
npm run test -- --watch

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Unit Test Structure

#### 1. Randomization Tests (`src/utils/__tests__/randomization.spec.ts`)

Tests the random number generation utilities:

```typescript
✓ randomInt generates numbers within range
✓ randomFloat generates floats within range
✓ shuffle creates random permutations
✓ selectRandom picks random items
✓ Edge cases: empty arrays, single items, boundaries
```

**What it tests:**
- Random number distribution
- Boundary conditions
- Array shuffling correctness
- Random selection uniqueness

#### 2. Race Engine Tests (`src/utils/__tests__/race-engine.spec.ts`)

Tests the core race physics and calculations:

```typescript
✓ calculateHorseSpeed considers condition and distance
✓ calculateProgressIncrement computes movement correctly
✓ calculatePoints awards correct points by position
✓ applyFatigue reduces condition appropriately
✓ Edge cases: zero condition, maximum fatigue
```

**What it tests:**
- Speed calculation formulas
- Progress increment accuracy
- Points system correctness
- Fatigue mechanics

#### 3. Vuex Store Tests (`src/store/__tests__/horses.spec.ts`)

Tests the Vuex horses module:

```typescript
✓ generateHorses creates exactly 20 horses
✓ Horses have unique IDs, names, and colors
✓ Condition values are within 1-100 range
✓ selectRandomHorses returns correct count
✓ No duplicate horses in selection
✓ updateHorseCondition modifies state correctly
✓ Condition clamping to 1-100 range
✓ applyFatigueToHorses reduces condition
✓ Getters return correct data
```

**What it tests:**
- State initialization
- Mutations correctness
- Actions behavior
- Getters accuracy
- Edge case handling

### Understanding Test Output

```bash
 ✓ src/utils/__tests__/randomization.spec.ts (9)
 ✓ src/utils/__tests__/race-engine.spec.ts (15)
 ✓ src/store/__tests__/horses.spec.ts (13)

 Test Files  3 passed (3)
      Tests  37 passed (37)
   Start at  17:59:29
   Duration  688ms
```

- **Test Files**: Number of test files executed
- **Tests**: Total number of individual test cases
- **Duration**: Total execution time

### Coverage Report

```bash
npm run test:coverage
```

This generates:
- Terminal summary
- HTML report in `coverage/index.html`
- JSON report in `coverage/coverage-final.json`

**Coverage targets:**
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

## 🌐 E2E Tests (Playwright)

E2E tests simulate real user interactions in a Chromium browser.

### Running E2E Tests

```bash
# Run all E2E tests (headless mode)
npm run test:e2e

# Run with visible browser (headed mode)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/game-flow.spec.ts

# Run in debug mode (step through tests)
npx playwright test --debug

# View last test report
npx playwright show-report
```

### E2E Test Scenarios

#### Test 1: Initial State Display
```typescript
✓ Displays "Horse Racing Simulator" header
✓ "Generate Schedule" button is visible and enabled
✓ "Start Race" button is visible but disabled
```

#### Test 2: Schedule Generation
```typescript
✓ Clicking "Generate Schedule" creates horses
✓ Horse Roster shows "20/20" horses
✓ Schedule displays Round 1 through Round 6
✓ "Start Race" button becomes enabled
```

#### Test 3: Schedule Generation Lock
```typescript
✓ "Generate Schedule" button becomes disabled after click
✓ Prevents duplicate schedule generation
```

#### Test 4: Complete Race Execution
```typescript
✓ "Start Race" button starts the race
✓ "Race in progress" status appears
✓ 50x speed button accelerates the race
✓ "Round 1 completed!" message appears
✓ Results tab shows race outcomes
✓ Overall standings are displayed
```

#### Test 5: All 6 Rounds Sequential
```typescript
✓ Executes all 6 rounds in sequence
✓ Each round shows "Race in progress"
✓ 50x speed is applied to each race
✓ "Round X completed!" appears after each race
✓ "Start Next Round" button appears between rounds
✓ "All races completed! 🏆" shows after round 6
```

#### Test 6: Results Export
```typescript
✓ Completes a race
✓ Navigates to Results tab
✓ Clicks "Export Results as JSON"
✓ Downloads file with correct naming pattern
```

#### Test 7: Game Reset
```typescript
✓ Completes a race
✓ Clicks "Reset Game" button
✓ "Generate Schedule" becomes enabled
✓ "Start Race" becomes disabled
✓ Initial state message appears
```

#### Test 8: Live Leaderboard
```typescript
✓ Race starts successfully
✓ Leaderboard shows positions 1-10
✓ Positions update in real-time
```

#### Test 9: Horse Conditions Display
```typescript
✓ All 20 horses are displayed
✓ Each horse shows condition value
```

#### Test 10: Selected Horses Highlight
```typescript
✓ 10 horses are highlighted for current race
✓ Yellow border indicates selection
```

### E2E Test Configuration

**Playwright Config** (`playwright.config.ts`):
```typescript
- Browser: Chromium
- Base URL: http://localhost:5173
- Timeout: 30s per test (360s for 6-round test)
- Retries: 0 (tests must pass consistently)
- Workers: 4 (parallel execution)
```

### Understanding E2E Output

```bash
Running 10 tests using 4 workers

  10 passed (1.6m)

To open last HTML report run:
  npx playwright show-report
```

- **Workers**: Number of parallel test runners
- **Duration**: Total execution time
- **HTML Report**: Detailed report with screenshots and traces

### Viewing Test Reports

```bash
# Open interactive HTML report
npx playwright show-report

# Report includes:
# - Test execution timeline
# - Screenshots on failure
# - Network activity logs
# - Console output
# - Video recordings (if enabled)
```

## 📊 Test Coverage

### What's Covered

✅ **Utilities (100%)**
- Random number generation
- Race physics calculations
- Helper functions

✅ **Vuex Store (100%)**
- State initialization
- Mutations
- Actions
- Getters

✅ **User Flows (100%)**
- Schedule generation
- Race execution
- Results viewing
- Game reset
- Data export

### What's Not Covered

The following are intentionally excluded from automated tests:
- Visual styling (manual QA)
- Animation smoothness (manual QA)
- Cross-browser compatibility (tested in Chromium only)
- Mobile device testing (responsive design verified manually)

## 🐛 Troubleshooting

### Common Issues

#### 1. Playwright Browsers Not Installed

**Error:**
```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**
```bash
npx playwright install
```

#### 2. Port 5173 Already in Use

**Error:**
```
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

#### 3. Tests Timeout

**Error:**
```
Error: Test timeout of 30000ms exceeded
```

**Solution:**
- Ensure dev server is running (`npm run dev`)
- Check if 50x speed button is being clicked
- Increase timeout in test file if needed

#### 4. Unit Tests Fail to Import Modules

**Error:**
```
Error: Cannot find module '@/...'
```

**Solution:**
- Check `vitest.config.ts` has correct alias configuration
- Verify `tsconfig.json` paths are set correctly

#### 5. E2E Tests Can't Find Elements

**Error:**
```
Error: Locator not found
```

**Solution:**
- Verify the application is running on http://localhost:5173
- Check if UI text/selectors have changed
- Use `--headed` mode to see what's happening

### Debug Mode

```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Run E2E tests in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test -g "should run a complete race" --debug
```

### Getting Help

If tests fail:
1. Check the error message carefully
2. Run in debug/headed mode to see what's happening
3. Verify all dependencies are installed
4. Check if the dev server is running
5. Review the test code to understand expectations

## 🎯 Best Practices

### Writing New Tests

1. **Unit Tests**
   - Test one thing at a time
   - Use descriptive test names
   - Cover edge cases
   - Mock external dependencies

2. **E2E Tests**
   - Test user workflows, not implementation
   - Use semantic selectors (roles, labels)
   - Add appropriate waits for async operations
   - Keep tests independent

### Running Tests in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run unit tests
  run: npm run test

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

## 📈 Performance Benchmarks

- **Unit Tests**: < 1 second
- **E2E Tests**: ~2 minutes (with 50x speed)
- **Coverage Report**: ~2 seconds
- **Total CI/CD Time**: ~3 minutes

## ✅ Test Checklist

Before submitting code:

- [ ] All unit tests pass (`npm run test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Coverage is above 90% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)

---

**Happy Testing! 🎉**

For questions or issues, please refer to the main [README.md](./README.md).
