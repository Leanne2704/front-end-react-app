"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import TextArea from "../../components/TextArea";
import Select from "../../components/Select";

export default function AddJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    predictedDuration: "",
    endDate: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = () => {
    if (formData.startDate && formData.predictedDuration) {
      const start = new Date(formData.startDate);
      const duration = parseInt(formData.predictedDuration);
      const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
      return end.toISOString().split("T")[0];
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.startDate ||
      !formData.predictedDuration ||
      !formData.notes
    ) {
      setError("All fields are required");
      return;
    }

    // Description validation - 10 words or less
    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 10) {
      setError("Description must be 10 words or less");
      return;
    }

    try {
      // TODO: Update this URL to your actual backend endpoint
      const endDate = calculateEndDate();
      const res = await fetch("http://localhost:3001/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          predicted_duration: formData.predictedDuration,
          end_date: endDate,
          notes: formData.notes,
          status: "pending",
        }),
      });

      if (res.ok) {
        router.push("/home");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create job");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const endDate = calculateEndDate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add Job</h2>

        <Input
          label="Job Title (e.g. Fix Roof)"
          type="text"
          value={formData.title}
          onChange={handleChange}
          name="title"
        />

        <TextArea
          label="Description (10 words or less)"
          value={formData.description}
          onChange={handleChange}
          name="description"
          placeholder="Brief job description"
          rows={2}
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          name="startDate"
        />

        <Select
          label="Predicted Duration (days)"
          value={formData.predictedDuration}
          onChange={handleChange}
          name="predictedDuration"
          options={[
            { value: "1", label: "1 day" },
            { value: "2", label: "2 days" },
            { value: "3", label: "3 days" },
            { value: "4", label: "4 days" },
            { value: "5", label: "5 days" },
            { value: "6", label: "6 days" },
            { value: "7", label: "7 days" },
          ]}
        />

        {endDate && (
          <div className="mb-4 p-2 bg-gray-50 border rounded">
            <label className="block text-sm font-medium text-gray-700">
              Calculated End Date
            </label>
            <p className="text-gray-900">{endDate}</p>
          </div>
        )}

        <Select
          label="Number of Staff"
          value={formData.notes}
          onChange={handleChange}
          name="notes"
          options={[
            { value: "1", label: "1 staff member" },
            { value: "2", label: "2 staff members" },
          ]}
        />

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
