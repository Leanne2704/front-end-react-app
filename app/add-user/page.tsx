"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Select from "../../components/Select";

export default function AddUserPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    role: "",
    branch: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is admin before showing form
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.user.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/home"); // Redirect if not admin
        }
      } catch (err) {
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.firstName ||
      !formData.surname ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.role !== "admin" && !formData.branch) {
      setError("Please select a branch for non-admin users");
      return;
    }

    try {
      // Send request to backend with credentials (session cookie)
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // This sends the session cookie automatically
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.surname,
          email: formData.email,
          password_hash: formData.password, // Backend will hash this
          role: formData.role,
          branch_id: formData.branch ? parseInt(formData.branch) : null,
        }),
      });

      if (res.ok) {
        router.push("/home?success=User%20added%20successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add User</h2>

        <Input
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          name="firstName"
        />

        <Input
          label="Surname"
          type="text"
          value={formData.surname}
          onChange={handleChange}
          name="surname"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          name="email"
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          name="password"
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={handleChange}
          name="role"
          options={[
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
            { value: "worker", label: "Worker" },
          ]}
        />

        {formData.role !== "admin" && (
          <Select
            label="Branch"
            value={formData.branch}
            onChange={handleChange}
            name="branch"
            options={[
              { value: "1", label: "London" },
              { value: "2", label: "Manchester" },
              { value: "3", label: "Cardiff" },
            ]}
          />
        )}

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => router.push("/home")}
            className="flex-1 bg-gray-400 hover:bg-gray-500"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
