// e2e/auth-flow.spec.ts - E2E tests for authentication flow
import { test, expect, type Page } from "@playwright/test";
import { MockApiHelper } from "./utils/mock-api";
import { TEST_USERS } from "./fixtures/test-data";

/**
 * E2E Authentication Flow Tests
 *
 * These tests cover the complete user authentication journey:
 * 1. Admin login flow with successful authentication
 * 2. Dashboard access and functionality verification
 * 3. Add user functionality with form validation
 * 4. Logout flow with proper session cleanup
 */

// Page Object Methods for reusable actions
class AuthFlowPage {
  private mockApi: MockApiHelper;

  constructor(private page: Page) {
    this.mockApi = new MockApiHelper(page);
  }

  async navigateToLogin() {
    await this.page.goto("/login");
    await expect(this.page).toHaveURL("/login");
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  async submitLogin() {
    await this.page.click('button[type="submit"]');
  }

  async verifyDashboardElements() {
    // Verify we're on the home/dashboard page
    await expect(this.page).toHaveURL("/home");
    // Verify admin dashboard buttons are present with exact text
    await expect(
      this.page.getByRole("button", { name: "Add User" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Add Job" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Logout" })
    ).toBeVisible();
  }

  async performLogout() {
    await this.page.click('button:has-text("Logout")');
  }

  async verifyLogoutSuccess() {
    // Should redirect back to login page
    await expect(this.page).toHaveURL("/login");

    // Login form should be visible again
    await expect(
      this.page.getByRole("button", { name: "Login" })
    ).toBeVisible();
  }

  async navigateToAddUser() {
    await this.page.click('button:has-text("Add User")');
    await expect(this.page).toHaveURL("/add-user");
    await expect(this.page.getByText("Add User")).toBeVisible();
  }

  async fillAddUserForm(userData: {
    firstName: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    branch?: string;
  }) {
    await this.page.fill('input[name="firstName"]', userData.firstName);
    await this.page.fill('input[name="surname"]', userData.surname);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.selectOption('select[name="role"]', userData.role);

    // Select branch if role is not admin
    if (userData.role !== "admin" && userData.branch) {
      await this.page.selectOption('select[name="branch"]', userData.branch);
    }
  }

  async submitAddUserForm() {
    await this.page.click('button[type="submit"]');
  }

  async verifyFormValidationError(errorMessage: string) {
    await expect(this.page.getByText(errorMessage)).toBeVisible();
  }

  async setupApiMocks() {
    await this.mockApi.mockAuthCheck("admin");
    await this.mockApi.mockLoginSuccess("admin");
    await this.mockApi.mockLogout();
  }

  async mockCreateUserSuccess() {
    await this.page.route("**/api/users", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: "User created successfully" }),
      });
    });
  }

  async mockCreateUserFailure() {
    await this.page.route("**/api/users", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email already exists" }),
      });
    });
  }
}

test.describe("Authentication Flow E2E Tests", () => {
  let authPage: AuthFlowPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthFlowPage(page);
    await authPage.setupApiMocks();
  });

  test.describe("Flow 1: Complete Login and Logout", () => {
    test("should allow admin to login, view dashboard, and logout successfully", async ({
      page,
    }) => {
      // Navigate to login page
      await authPage.navigateToLogin();

      // Fill and submit login form
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Verify successful login and dashboard elements
      await authPage.verifyDashboardElements();

      // Perform logout
      await authPage.performLogout();

      // Verify successful logout
      await authPage.verifyLogoutSuccess();
    });

    test("should handle login with invalid credentials", async ({ page }) => {
      const mockApi = new MockApiHelper(page);
      await mockApi.mockLoginFailure();

      await authPage.navigateToLogin();
      await authPage.fillLoginForm("invalid@example.com", "wrongpassword");
      await authPage.submitLogin();

      // Should show error message and stay on login page
      await expect(page.getByText(/invalid credentials/i)).toBeVisible();
      await expect(page).toHaveURL("/login");
    });

    test("should handle network errors during login", async ({ page }) => {
      // Mock network failure
      await page.route("**/api/auth/login", async (route) => {
        route.abort("failed");
      });

      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Should show network error message
      await expect(page.getByText(/network error/i)).toBeVisible();
    });

    test("should validate required login fields", async ({ page }) => {
      await authPage.navigateToLogin();

      // Try to submit empty form
      await authPage.submitLogin();

      // Should stay on login page (form validation prevents submission)
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Flow 2: Add User Functionality", () => {
    test("should allow admin to add a new user successfully", async ({
      page,
    }) => {
      await authPage.mockCreateUserSuccess();

      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();
      await authPage.verifyDashboardElements();

      // Navigate to Add User page
      await authPage.navigateToAddUser();

      // Fill out user form
      const newUserData = {
        firstName: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "manager",
        branch: "1",
      };

      await authPage.fillAddUserForm(newUserData);
      await authPage.submitAddUserForm();

      // Should redirect back to home page after successful creation
      await expect(page).toHaveURL("/home?success=User%20added%20successfully");
    });

    test("should handle add user form validation", async ({ page }) => {
      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Navigate to Add User page
      await authPage.navigateToAddUser();

      // Try to submit empty form
      await authPage.submitAddUserForm();

      // Should stay on add user page (form validation prevents submission)
      await expect(page).toHaveURL("/add-user");
    });

    test("should handle add user with duplicate email", async ({ page }) => {
      await authPage.mockCreateUserFailure();

      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Navigate to Add User page
      await authPage.navigateToAddUser();

      // Fill form with existing email
      const duplicateUserData = {
        firstName: "Jane",
        surname: "Smith",
        email: "admin@example.com", // Duplicate email
        password: "password123",
        role: "worker",
        branch: "2",
      };

      await authPage.fillAddUserForm(duplicateUserData);
      await authPage.submitAddUserForm();

      // Should show error message
      await expect(page.getByText(/email already exists/i)).toBeVisible();
    });

    test("should handle cancel button on add user form", async ({ page }) => {
      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Navigate to Add User page
      await authPage.navigateToAddUser();

      // Click cancel button
      await page.click('button:has-text("Cancel")');

      // Should return to home page
      await expect(page).toHaveURL("/home");
    });

    test("should handle network errors during user creation", async ({
      page,
    }) => {
      // Mock network failure for user creation
      await page.route("**/api/users", async (route) => {
        route.abort("failed");
      });

      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Navigate to Add User page and fill form
      await authPage.navigateToAddUser();

      const userData = {
        firstName: "Test",
        surname: "User",
        email: "test@example.com",
        password: "password123",
        role: "worker",
        branch: "1",
      };

      await authPage.fillAddUserForm(userData);
      await authPage.submitAddUserForm();

      // Should show network error message
      await expect(
        page.getByText(/network error|failed to create/i)
      ).toBeVisible();
    });
  });

  test.describe("Edge Cases and Error Handling", () => {
    test("should handle session timeout during add user flow", async ({
      page,
    }) => {
      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.admin.email,
        TEST_USERS.admin.password
      );
      await authPage.submitLogin();

      // Navigate to Add User page
      await authPage.navigateToAddUser();

      // Mock session timeout (auth check fails)
      await page.route("**/api/auth/me", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Session expired" }),
        });
      });

      // Try to submit form (should trigger auth check)
      const userData = {
        firstName: "Test",
        surname: "User",
        email: "test@example.com",
        password: "password123",
        role: "worker",
        branch: "1",
      };

      await authPage.fillAddUserForm(userData);
      await authPage.submitAddUserForm();

      // Should show authentication required error message
      await expect(page.getByText(/authentication required/i)).toBeVisible();
    });

    test("should not show add user button or allow access for non-admin user", async ({
      page,
    }) => {
      const mockApi = new MockApiHelper(page);
      await mockApi.mockAuthCheck("manager"); // Non-admin user
      await mockApi.mockLoginSuccess("manager");

      // Login as manager
      await authPage.navigateToLogin();
      await authPage.fillLoginForm(
        TEST_USERS.manager.email,
        TEST_USERS.manager.password
      );
      await authPage.submitLogin();

      // Should NOT see the Add User button on dashboard
      await expect(
        page.getByRole("button", { name: "Add User" })
      ).not.toBeVisible();

      // Try to navigate directly to add-user page
      await page.goto("/add-user");

      // Wait for possible redirect
      await page.waitForURL("/home", { timeout: 2000 });

      // Should redirect to home page (not authorized)
      await expect(page).toHaveURL("/home");
    });
  });
});

export { AuthFlowPage };
