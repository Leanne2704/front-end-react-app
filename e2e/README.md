# E2E Testing Setup

This directory contains end-to-end tests using Playwright for the authentication frontend application.

## Structure

```
e2e/
├── auth-flow.spec.ts      # Main authentication flow tests
├── fixtures/
│   └── test-data.ts       # Test data and user credentials
└── utils/
    └── mock-api.ts        # API mocking utilities
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- Playwright browsers installed (run `npx playwright install` if needed)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (visual test runner)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

## Test Structure

### Authentication Flow Tests (`auth-flow.spec.ts`)

**Test Flow 1: Complete Admin Login and Logout**

- Navigate to login page
- Fill in admin credentials
- Submit login form
- Verify redirect to dashboard
- Verify admin buttons are present (Add User, Add Job, Log Out)
- Click logout button
- Verify redirect back to login page

**Test Flow 2: Dashboard Functionality Verification**

- Login as admin user
- Verify all dashboard elements are present and functional
- Test navigation between different sections

### Page Object Pattern

The tests use the Page Object pattern with the `AuthFlowPage` class to:

- Encapsulate page interactions
- Provide reusable methods
- Make tests more maintainable
- Improve readability

### API Mocking

Tests use `MockApiHelper` to:

- Mock authentication API endpoints
- Simulate different user roles
- Test error scenarios
- Ensure consistent test data

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- Multiple browser testing (Chrome, Firefox, Safari)
- Automatic dev server startup
- Screenshot and video capture on failures
- Trace collection for debugging

## Test Data

Test users and API responses are defined in `fixtures/test-data.ts`:

- Admin user credentials
- Manager user credentials
- Worker user credentials
- Mock API response templates

## Next Steps

1. Implement the actual test cases in `auth-flow.spec.ts`
2. Add more specific test scenarios
3. Extend API mocking for additional endpoints
4. Add tests for different user roles and permissions
