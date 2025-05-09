"use client";

import { useEffect, useState, FormEvent } from "react";
import { Summary } from "./types";

// Get API URL from environment variable or use default
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export default function Home() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rerunningIds, setRerunningIds] = useState<number[]>([]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/summaries`);
      if (!response.ok) {
        throw new Error(`Error fetching summaries: ${response.status}`);
      }
      const data = await response.json();
      setSummaries(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching summaries:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!transcript.trim()) {
      setSubmitError("Please enter a transcript");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const response = await fetch(`${API_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`Error submitting transcript: ${response.status}`);
      }

      // Clear the form
      setTranscript("");

      // Refresh the summaries list
      await fetchSummaries();
    } catch (err) {
      console.error("Error submitting transcript:", err);
      setSubmitError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRerun = async (id: number) => {
    try {
      // Add the ID to the rerunning list to show loading state
      setRerunningIds((prev) => [...prev, id]);

      const response = await fetch(`${API_URL}/re-summarize/${id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(`Error re-running summary: ${response.status}`);
      }

      // Refresh the summaries list
      await fetchSummaries();
    } catch (err) {
      console.error(`Error re-running summary for ID ${id}:`, err);
      // We could add error handling for individual cards here
    } finally {
      // Remove the ID from the rerunning list
      setRerunningIds((prev) =>
        prev.filter((rerunningId) => rerunningId !== id)
      );
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    try {
      // Parse the date string and ensure it's treated as UTC
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Format the date in the local timezone
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

  // Function to trim text to a specific length
  const trimText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
