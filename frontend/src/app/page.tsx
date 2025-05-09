"use client";

import { useEffect, useState } from "react";
import { Summary } from "./types";

export default function Home() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch("http://localhost:8000/summaries");
        if (!response.ok) {
          throw new Error(`Error fetching summaries: ${response.status}`);
        }
        const data = await response.json();
        setSummaries(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching summaries:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                Make sure your backend server is running at
                http://localhost:8000
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

                    <div className="text-xs text-gray-500 mt-4">
                      Created: {formatDate(summary.created_at)}
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
