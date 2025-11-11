import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AddUserPage from "./page";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Input component
jest.mock("../../components/Input", () => (props: any) => (
  <div>
    <label htmlFor={props.name}>{props.label}</label>
    <input
      id={props.name}
      type={props.type}
      value={props.value}
      onChange={props.onChange}
      name={props.name}
    />
  </div>
));

// Mock Button component
jest.mock("../../components/Button", () => (props: any) => (
  <button {...props}>{props.children}</button>
));

// Mock Select component
jest.mock("../../components/Select", () => (props: any) => (
  <div>
    <label htmlFor={props.name}>{props.label}</label>
    <select
      id={props.name}
      value={props.value}
      onChange={props.onChange}
      name={props.name}
    >
      <option value="">Select {props.label.toLowerCase()}</option>
      {props.options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

// Mock fetch globally
global.fetch = jest.fn();

describe("AddUserPage", () => {
  let pushMock: jest.Mock;
  // declaring variable and asigning type.
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    pushMock = jest.fn(); // actuaally giving the pushMock a value.
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects non-admin users to home page", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "worker" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects to home when auth check fails", async () => {
    mockFetch.mockRejectedValue(new Error("Auth failed"));

    render(<AddUserPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home");
    });
  });

  it("renders form for admin users", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    });

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });

    // Check form fields are present
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Surname")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Branch")).toBeInTheDocument();

    // Check buttons are present
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("updates form fields when user types", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(
      "First Name"
    ) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    expect(emailInput.value).toBe("john@example.com");
  });

  it("has a drop-down list for roles with all options", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
    });

    const roleSelect = screen.getByLabelText("Role") as HTMLSelectElement;
    // Check that all role options are present
    expect(roleSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Manager" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Worker" })).toBeInTheDocument();
  });

  it("has a drop-down list for branches", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Branch")).toBeInTheDocument();
    });

    // Branch drop-down should appear for non-admin roles
    const branchSelect = screen.getByLabelText("Branch") as HTMLSelectElement;
    expect(branchSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "London" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Manchester" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cardiff" })).toBeInTheDocument();
  });

  it("shows validation error when required fields are missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("All fields are required")).toBeInTheDocument();
    });
  });

  it("shows validation error when branch is not selected", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "worker" },
    });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please select a branch for non-admin users")
      ).toBeInTheDocument();
    });
  });

  it("submits form successfully with valid data", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "manager" },
    });
    fireEvent.change(screen.getByLabelText("Branch"), {
      target: { value: "1" },
    });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/users",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      );
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/home?success=User%20added%20successfully"
      );
    });
  });

  it("displays error message when user creation fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Email already exists" }),
      } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "admin" },
    });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("displays network error when fetch fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin" } }),
      } as Response)
      .mockRejectedValueOnce(new Error("Network error"));

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Surname"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "admin" },
    });

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("navigates to home page when cancel button is clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin" } }),
    } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("includes correct data in the API request", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    render(<AddUserPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Surname"), {
      target: { value: "Smith" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "securepass" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "admin" },
    });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      const fetchCall = mockFetch.mock.calls[1];
      const requestBody = JSON.parse(fetchCall[1]?.body as string);

      expect(requestBody).toEqual({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password_hash: "securepass",
        role: "admin",
        branch_id: null,
      });
    });
  });
});
