// e2e/fixtures/test-data.ts - Test data and mock server setup
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    firstName: "Admin",
    surname: "User",
  },
  manager: {
    email: "manager@example.com",
    password: "manager123",
    role: "manager",
    firstName: "Manager",
    surname: "User",
    branch: "1",
  },
  worker: {
    email: "worker@example.com",
    password: "worker123",
    role: "worker",
    firstName: "Worker",
    surname: "User",
    branch: "2",
  },
};

export const API_RESPONSES = {
  loginSuccess: (role: string) => ({
    user: {
      id: 1,
      email: TEST_USERS[role as keyof typeof TEST_USERS].email,
      role: role,
      firstName: TEST_USERS[role as keyof typeof TEST_USERS].firstName,
      surname: TEST_USERS[role as keyof typeof TEST_USERS].surname,
    },
    token: "mock-jwt-token",
  }),

  loginFailure: {
    error: "Invalid credentials",
  },

  authCheck: (role: string) => ({
    user: {
      id: 1,
      role: role,
      email: TEST_USERS[role as keyof typeof TEST_USERS].email,
    },
  }),

  createUserSuccess: {
    message: "User created successfully",
    user: {
      id: 2,
      email: "john.doe@example.com",
      role: "manager",
      firstName: "John",
      surname: "Doe",
    },
  },

  createUserFailure: {
    error: "Email already exists",
  },

  networkError: {
    error: "Network error occurred",
  },
};
