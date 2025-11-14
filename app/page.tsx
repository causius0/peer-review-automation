/**
 * Main Application Page
 *
 * Medical Peer Review System with Dr. Eric Topol
 * Professional interface for medical manuscript review
 */

'use client';

import { useState } from 'react';
import UploadForm from '@/components/ui/UploadForm';
import TopolReviewResults from '@/components/review/TopolReviewResults';
import ReviewingAnimation from '@/components/ui/ReviewingAnimation';

export default function Home() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewStage, setReviewStage] = useState<'editor' | 'reviewers'>('editor');
  const [stageMessage, setStageMessage] = useState('');
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles submission and initiates review process
   */
  const handleReviewSubmit = async (
    content: string,
    filename: string,
    journalName: string,
    isText: boolean = false
  ) => {
    setIsReviewing(true);
    setReviewStage('editor');
    setStageMessage('Dr. Eric Topol is reviewing your abstract and methods...');
    setError(null);
    setReport(null);

    try {
      // Simulate stage transitions for better UX
      const startTime = Date.now();

      // Call review API
      const response = await fetch('/api/topol-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleText: content,
          filename,
        }),
      });

      // After ~20 seconds, switch to reviewers stage
      const elapsed = Date.now() - startTime;
      if (elapsed < 20000) {
        await new Promise((resolve) => setTimeout(resolve, 20000 - elapsed));
      }

      setReviewStage('reviewers');
      setStageMessage('Two specialist reviewers are conducting parallel review...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Review failed');
      }

      // Ensure minimum 60 seconds total (for 1-2 min expected duration)
      const totalElapsed = Date.now() - startTime;
      if (totalElapsed < 60000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 60000 - totalElapsed)
        );
      }

      // Set report
      setReport(data.report);
      setIsReviewing(false);
    } catch (err) {
      console.error('Review error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsReviewing(false);
    }
  };

  /**
   * Resets the form for a new review
   */
  const handleNewReview = () => {
    setIsReviewing(false);
    setReviewStage('editor');
    setStageMessage('');
    setReport(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-blue-900 border-b border-blue-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Medical Peer Review System
              </h1>
              <p className="text-blue-200 text-base flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Editorial Leadership: Dr. Eric Topol
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-green-900 bg-opacity-30 px-4 py-2 rounded-lg border border-green-500">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm text-green-200 font-medium">
                System Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Form */}
        {!isReviewing && !report && (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300">
            <UploadForm onSubmit={handleReviewSubmit} />
          </div>
        )}

        {/* Reviewing Animation */}
        {isReviewing && !report && (
          <div className="space-y-6">
            <ReviewingAnimation stage={reviewStage} message={stageMessage} />
          </div>
        )}

        {/* Error Display */}
        {error && !isReviewing && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <svg
                className="w-8 h-8 text-red-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Review Process Failed
                </h3>
                <p className="text-red-800 mb-4">{error}</p>
                <button
                  onClick={handleNewReview}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Results */}
        {report && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Review Complete
                </h2>
                <p className="text-slate-600">
                  Your manuscript has been thoroughly reviewed
                </p>
              </div>
              <button
                onClick={handleNewReview}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Review
              </button>
            </div>
            <TopolReviewResults report={report} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-blue-900 border-t border-blue-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-2">
              Powered by{' '}
              <a
                href="https://www.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 font-semibold underline"
              >
                Anthropic Claude 3.5 Haiku
              </a>
            </p>
            <p className="text-blue-300 text-xs">
              AI-powered medical manuscript review system • Not a substitute for
              human peer review
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
