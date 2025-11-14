/**
 * Main Application Page
 *
 * This is the primary interface for the Automated Peer Review System.
 * Users can upload PDFs, specify target journals, and view review results.
 */

'use client';

import { useState } from 'react';
import type { ReviewReport } from '@/types';
import UploadForm from '@/components/ui/UploadForm';
import ReviewResults from '@/components/review/ReviewResults';
import LoadingProgress from '@/components/ui/LoadingProgress';

export default function Home() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles file upload and initiates review process
   */
  const handleReviewSubmit = async (
    pdfBase64: string,
    filename: string,
    journalName: string
  ) => {
    setIsReviewing(true);
    setProgress(0);
    setCurrentStage('Uploading...');
    setError(null);
    setReport(null);

    try {
      // Call review API
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64,
          filename,
          journalName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Review failed');
      }

      // Set report
      setReport(data.report);
      setProgress(100);
      setCurrentStage('Complete!');
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
    setProgress(0);
    setCurrentStage('');
    setReport(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Automated Peer Review System
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                AI-powered manuscript review using Claude API
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Instructions Banner */}
        {!isReviewing && !report && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              How it works
            </h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>
                  Upload your research article (PDF format) and specify the target journal
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>
                  The Editor (Dr. Marcia Chen) assesses your article and selects 2
                  specialist reviewers
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>
                  Expert reviewers provide detailed feedback based on their field expertise
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>
                  The system iterates up to 3 times or until reviewers recommend acceptance
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">5.</span>
                <span>
                  Receive a comprehensive review report with actionable recommendations
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Upload Form */}
        {!isReviewing && !report && (
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <UploadForm onSubmit={handleReviewSubmit} />
          </div>
        )}

        {/* Loading Progress */}
        {isReviewing && !report && (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
            <LoadingProgress
              progress={progress}
              currentStage={currentStage}
              error={error}
            />
          </div>
        )}

        {/* Error Display */}
        {error && !isReviewing && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Review Failed
            </h3>
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <button
              onClick={handleNewReview}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Review Results */}
        {report && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Review Report</h2>
              <button
                onClick={handleNewReview}
                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                New Review
              </button>
            </div>
            <ReviewResults report={report} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>
              Powered by{' '}
              <a
                href="https://www.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Anthropic Claude API
              </a>
            </p>
            <p className="mt-1">
              Advanced AI peer review system with 100+ specialist reviewers
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
