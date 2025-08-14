# Share Components Tests

This directory contains unit tests for the prominent share experience components.

## Setup

The project doesn't currently have a testing framework configured. To run these tests, you'll need to install the required dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Then add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Test Files

### `share-components.test.tsx`
Tests for all React components:
- **ShareInstructions**: Tests contextual messaging based on highlight states
- **ShareURL**: Tests URL display, copy functionality, and error states
- **GeneralNoteInput**: Tests input handling, debouncing, and character limits
- **SharePreview**: Tests content preview and different display states
- **ShareSection**: Tests integration of all sub-components

### `share-url-generator.test.ts`
Tests for the ShareURLGenerator utility class:
- **Debouncing**: Ensures multiple rapid calls are properly debounced
- **Content hashing**: Verifies identical content doesn't trigger regeneration
- **API integration**: Tests successful API calls and response handling
- **Fallback behavior**: Tests client-side generation when API fails
- **Retry logic**: Tests retry attempts before falling back
- **Error handling**: Tests error scenarios and proper error reporting

## Test Coverage

The tests cover:

### Functionality
- ✅ Component rendering with different props
- ✅ User interactions (clicking, typing, copying)
- ✅ State changes and callbacks
- ✅ Debounced operations
- ✅ Error handling and fallback behavior
- ✅ Accessibility features (ARIA labels, roles)

### Edge Cases
- ✅ Empty states (no highlights, no notes)
- ✅ Character limits and validation
- ✅ Clipboard API availability and fallbacks
- ✅ Network failures and retries
- ✅ Content change detection

### Browser Compatibility
- ✅ Clipboard API fallback to document.execCommand
- ✅ Environment without modern APIs

## Running Tests

Once dependencies are installed:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Mocking Strategy

The tests use comprehensive mocking for:
- **Clipboard API**: Mocked to test copy functionality
- **Fetch API**: Mocked to test API interactions
- **Timers**: Mocked to test debouncing behavior
- **DOM APIs**: Mocked for browser compatibility testing

## Integration Testing

While these are primarily unit tests, they also include some integration testing aspects:
- Testing component composition in ShareSection
- Testing the complete copy flow with fallbacks
- Testing the complete URL generation flow with retries

## Future Enhancements

Consider adding:
- **E2E tests** with Playwright or Cypress for full user flows
- **Visual regression tests** for UI consistency
- **Performance tests** for debouncing and large datasets
- **Accessibility tests** with axe-core