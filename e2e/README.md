# E2E Tests

This directory contains end-to-end (e2e) tests for the Camping Place Manager application using Playwright.

> **📖 See also**: [Main README.md](../README.md) for general project information and setup instructions.

## Overview

The e2e tests verify the complete user workflows across the application:
- Home page navigation
- Camping places management (CRUD operations)
- Camping items management
- Bookings management
- Form validation

Tests run across multiple browsers (Chromium, Firefox, WebKit) to ensure cross-browser compatibility.

## Test Data Management

All e2e tests use a **"TEST_" prefix** for all test data to ensure:

1. **Database Safety**: Test data is clearly marked and can be easily identified
2. **Automatic Cleanup**: Test data is automatically cleaned up after tests
3. **No Production Impact**: Production data is never accidentally modified

### Test Data Prefix

All test data must use the `TEST_` prefix:
- **Names**: `TEST_Camping Place`, `TEST_Item Name`
- **Emails**: `TEST_user@example.com`
- **Locations**: `TEST_Location`

### Helper Functions

Use the helper functions from `test-helpers.ts`:

```typescript
import { testName, testEmail, cleanupTestData } from './test-helpers';

// Generate test names
const placeName = testName('Camping Place'); // Returns "TEST_Camping Place"
const email = testEmail('user@example.com'); // Returns "TEST_user@example.com"

// Clean up test data
await cleanupTestData(page);
```

### Automatic Cleanup

Test data is automatically cleaned up:
- **After each test**: Tests that create data should call `cleanupTestData()` in `afterEach`
- **After all tests**: Global teardown runs after all tests complete
- **Manual cleanup**: You can also manually clean up using the helper function

### Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run with UI (for debugging)
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Run only chromium (faster)
npx playwright test --project=chromium
```

### Test Structure

Each test file should:
1. Import test helpers: `import { cleanupTestData, testName, testEmail } from './test-helpers';`
2. Add cleanup hooks:
   ```typescript
   test.afterAll(async ({ browser }) => {
     const context = await browser.newContext();
     const page = await context.newPage();
     await cleanupTestData(page);
     await context.close();
   });
   ```
3. Use TEST_ prefix for all data creation

### Important Notes

- **Never use production data** in tests
- **Always use TEST_ prefix** for any data created in tests
- **Clean up after tests** to keep the database clean
- Tests will fail safely if cleanup fails (won't break the test run)

## Test Files

- `home.spec.ts` - Home page navigation and layout tests
- `camping-places.spec.ts` - Camping places CRUD operations
- `camping-items.spec.ts` - Camping items management tests
- `bookings.spec.ts` - Booking creation and management tests
- `analytics.spec.ts` - Analytics page tests
- `test-helpers.ts` - Shared test utilities and cleanup functions
- `global-teardown.ts` - Global cleanup after all tests

## Configuration

Test configuration is in `playwright.config.ts` at the project root. Key settings:
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start server**: Development server starts automatically before tests
- **Global teardown**: Automatic cleanup of all test data

## Troubleshooting

### Tests fail with "Executable doesn't exist"
Run `npm run test:e2e:install` to install Playwright browsers.

### Database connection errors
Ensure MongoDB is running: `npm run db:start`

### Tests create data in production database
All test data uses the "TEST_" prefix and is automatically cleaned up. If you see test data, run cleanup manually or check that the cleanup functions are working.

### Tests timeout
- Check that the dev server is running on port 3000
- Verify database connection
- Increase timeout in `playwright.config.ts` if needed

