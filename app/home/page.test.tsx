import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "./page";
import { useRouter, useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Button component
jest.mock("../../components/Button", () => (props: any) => (
  <button {...props}>{props.children}</button>
));

// Mock fetch globally
global.fetch = jest.fn();

describe("HomePage", () => {
  let pushMock: jest.Mock;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === "success" ? null : null),
    });
    // Reset fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading initially", () => {
    // Mock a slow fetch to keep loading state visible
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<HomePage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("redirects to login if not authenticated", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to login on fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<HomePage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("renders admin buttons", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin", first_name: "Admin" } }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome, Admin")).toBeInTheDocument();
      expect(screen.getByText("Add User")).toBeInTheDocument();
      expect(screen.getByText("Add Job")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  it("renders manager buttons", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "manager", first_name: "Manager" } }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome, Manager")).toBeInTheDocument();
      expect(screen.getByText("Add Job")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.queryByText("Add User")).not.toBeInTheDocument();
    });
  });

  it("renders worker message", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "worker", first_name: "Worker" } }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome, Worker")).toBeInTheDocument();
      expect(screen.getByText("No actions available")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.queryByText("Add User")).not.toBeInTheDocument();
      expect(screen.queryByText("Add Job")).not.toBeInTheDocument();
    });
  });

  it("shows success message if present", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === "success" ? "Account created!" : null),
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "admin", first_name: "Admin" } }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Account created!")).toBeInTheDocument();
    });
  });

  it("handles logout success", async () => {
    // First fetch for user data
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin", first_name: "Admin" } }),
      } as Response)
      // Second fetch for logout
      .mockResolvedValueOnce({
        ok: true,
      } as Response);

    render(<HomePage />);

    await waitFor(() => screen.getByText("Logout"));

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("handles logout failure", async () => {
    // Mock alert
    window.alert = jest.fn();

    // First fetch for user data
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin", first_name: "Admin" } }),
      } as Response)
      // Second fetch for logout fails
      .mockResolvedValueOnce({
        ok: false,
      } as Response);

    render(<HomePage />);

    await waitFor(() => screen.getByText("Logout"));

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Logout failed");
    });
  });

  it("handles logout network error", async () => {
    // Mock alert
    window.alert = jest.fn();

    // First fetch for user data
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "admin", first_name: "Admin" } }),
      } as Response)
      // Second fetch for logout throws error
      .mockRejectedValueOnce(new Error("Network error"));

    render(<HomePage />);

    await waitFor(() => screen.getByText("Logout"));

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Network error during logout");
    });
  });
});
