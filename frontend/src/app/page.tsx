"use client";

import { useEffect, useState, FormEvent } from "react";
import { Summary } from "./types";

// API configuration
// Removes trailing slash if present to ensure consistent URL formatting
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export default function Home() {
  // Data states
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcript, setTranscript] = useState<string>("");

  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rerunningIds, setRerunningIds] = useState<number[]>([]);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Fetches all summaries from the API
   *
   * This function retrieves the list of transcript summaries
   * from the backend API and updates the state accordingly.
   */
  const fetchSummaries = async () => {
    try {
      // Show loading indicator
      setLoading(true);

      // Fetch summaries from API
      const response = await fetch(`${API_URL}/summaries`);

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(
          `Error fetching summaries: ${response.status} ${response.statusText}`
        );
      }

      // Parse and store the data
      const data = await response.json();
      setSummaries(data);

      // Clear any previous errors
      setError(null);
    } catch (err) {
      // Log and display error
      console.error("Error fetching summaries:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      // Hide loading indicator
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  /**
   * Handles form submission to create a new summary
   *
   * This function validates the transcript input, submits it to the API,
   * and refreshes the summaries list upon success.
   *
   * @param e - The form submission event
   */
  const handleSubmit = async (e: FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Validate input
    if (!transcript.trim()) {
      setSubmitError("Please enter a transcript");
      return;
    }

    try {
      // Update UI state for submission
      setSubmitting(true);
      setSubmitError(null);

      // Send transcript to API for summarization
      const response = await fetch(`${API_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      // Handle API errors
      if (!response.ok) {
        throw new Error(
          `Error submitting transcript: ${response.status} ${response.statusText}`
        );
      }

      // Reset form on success
      setTranscript("");

      // Refresh the summaries list to show the new entry
      await fetchSummaries();
    } catch (err) {
      // Handle and display errors
      console.error("Error submitting transcript:", err);
      setSubmitError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      // Reset submission state
      setSubmitting(false);
    }
  };

  /**
   * Handles re-running the summarization for a specific transcript
   *
   * This function sends a request to regenerate the summary for an existing
   * transcript and updates the UI accordingly.
   *
   * @param id - The ID of the summary to regenerate
   */
  const handleRerun = async (id: number) => {
    try {
      // Update UI to show loading state for this specific summary
      setRerunningIds((prev) => [...prev, id]);

      // Send request to re-generate the summary
      const response = await fetch(`${API_URL}/re-summarize/${id}`, {
        method: "PUT",
      });

      // Handle API errors
      if (!response.ok) {
        throw new Error(
          `Error re-running summary: ${response.status} ${response.statusText}`
        );
      }

      // Refresh the summaries list to show the updated summary
      await fetchSummaries();
    } catch (err) {
      // Log the error (could add UI feedback for individual cards in the future)
      console.error(`Error re-running summary for ID ${id}:`, err);

      // Note: We could add per-card error handling here with a new state variable
      // such as const [rerunErrors, setRerunErrors] = useState<Record<number, string>>({});
    } finally {
      // Remove the loading state for this summary
      setRerunningIds((prev) =>
        prev.filter((rerunningId) => rerunningId !== id)
      );
    }
  };

  /**
   * Formats a date string into a human-readable format
   *
   * @param dateString - ISO date string from the API
   * @returns Formatted date string in local timezone
   */
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";

    try {
      // Parse the date string
      const date = new Date(dateString);

      // Validate the date
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Format the date in a user-friendly format with the local timezone
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error formatting date";
    }
  };

  /**
   * Truncates text to a specified length with ellipsis
   *
   * @param text - The text to trim
   * @param maxLength - Maximum length before truncation
   * @returns Trimmed text with ellipsis if needed
   */
  const trimText = (text: string, maxLength: number): string => {
    // Return original text if it's already short enough
    if (!text || text.length <= maxLength) return text;

    // Truncate and add ellipsis
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SmileScript</h1>
          <p className="text-gray-600 mt-2">
            AI-powered call summarizer for dental clinics
          </p>
        </header>

        <main>
          {/* Transcript Submission Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Submit New Transcript
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="transcript"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Call Transcript
                </label>
                <textarea
                  id="transcript"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your call transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={submitting}
                ></textarea>

                {submitError && (
                  <p className="mt-2 text-sm text-red-600">{submitError}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    submitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Generate Summary"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Summaries List */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Saved Summaries
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <p className="text-sm mt-1">
                Make sure your backend server is running at {API_URL}
              </p>
            </div>
          ) : summaries.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">
                No summaries found. Add your first transcript to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Transcript
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {trimText(summary.transcript, 100)}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Summary
                      </h3>
                      <p className="text-gray-600">{summary.summary}</p>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(summary.created_at)}
                      </div>
                      {summary.updated_at &&
                        new Date(summary.updated_at).getTime() >
                          new Date(summary.created_at).getTime() && (
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(summary.updated_at)}
                          </div>
                        )}

                      <button
                        onClick={() => handleRerun(summary.id)}
                        disabled={rerunningIds.includes(summary.id)}
                        className={`mt-3 px-3 py-1 text-sm rounded-md text-white font-medium ${
                          rerunningIds.includes(summary.id)
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        }`}
                      >
                        {rerunningIds.includes(summary.id) ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Re-run Summary"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
