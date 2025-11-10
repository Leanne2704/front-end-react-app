"use client";
import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/models/types";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  useEffect(() => {
    // Fetch current user data
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          console.log("Fetched user:", data.user);
        } else {
          // Not authenticated, redirect to login
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push("/login");
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      alert("Network error during logout");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        {successMessage && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">
            {successMessage}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2 text-center">Home</h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome, {user?.first_name}
        </p>

        <div className="flex flex-col gap-4">
          {/* Admin: Show all buttons */}
          {user.role === "admin" && (
            <>
              <Button onClick={() => router.push("/add-user")}>Add User</Button>
              <Button onClick={() => router.push("/add-job")}>Add Job</Button>
            </>
          )}

          {/* Manager: Show add job button */}
          {user.role === "manager" && (
            <Button onClick={() => router.push("/add-job")}>Add Job</Button>
          )}

          {/* Worker: No additional buttons */}
          {user.role === "worker" && (
            <p className="text-center text-gray-500">No actions available</p>
          )}

          {/* All roles: Logout button */}
          <Button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
