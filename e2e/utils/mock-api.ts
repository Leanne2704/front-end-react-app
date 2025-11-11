// e2e/utils/mock-api.ts - API mocking utilities for E2E tests
import { Page } from "@playwright/test";
import { API_RESPONSES, TEST_USERS } from "../fixtures/test-data";

/**
 * Mock API utilities for E2E testing
 * These functions set up route interception to mock backend responses
 */
export class MockApiHelper {
  constructor(private page: Page) {}

  /**
   * Mock successful login response
   */
  async mockLoginSuccess(role: "admin" | "manager" | "worker" = "admin") {
    await this.page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(API_RESPONSES.loginSuccess(role)),
      });
    });
  }

  /**
   * Mock failed login response
   */
  async mockLoginFailure() {
    await this.page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify(API_RESPONSES.loginFailure),
      });
    });
  }

  /**
   * Mock auth check response (for protected routes)
   * Using the correct endpoint from your app: /api/auth/me
   */
  async mockAuthCheck(role: "admin" | "manager" | "worker" = "admin") {
    await this.page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: 1,
            role: role,
            email: TEST_USERS[role as keyof typeof TEST_USERS].email,
            first_name: TEST_USERS[role as keyof typeof TEST_USERS].firstName,
            surname: TEST_USERS[role as keyof typeof TEST_USERS].surname,
          },
        }),
      });
    });
  }

  /**
   * Mock logout response
   */
  async mockLogout() {
    await this.page.route("**/api/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Logged out successfully" }),
      });
    });
  }

  /**
   * Mock auth failure (for unauthorized access)
   */
  async mockAuthFailure() {
    await this.page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });
  }

  /**
   * Mock successful user creation
   */
  async mockCreateUserSuccess() {
    await this.page.route("**/api/users", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          message: "User created successfully",
          user: {
            id: 2,
            email: "john.doe@example.com",
            role: "manager",
            firstName: "John",
            surname: "Doe",
          },
        }),
      });
    });
  }

  /**
   * Mock failed user creation
   */
  async mockCreateUserFailure() {
    await this.page.route("**/api/users", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email already exists" }),
      });
    });
  }

  /**
   * Clear all route mocks
   */
  async clearMocks() {
    await this.page.unrouteAll();
  }
}
