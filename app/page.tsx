/**
 * Main Application Page
 *
 * This is the primary interface for the Automated Peer Review System.
 * Users can upload PDFs, specify target journals, and view review results.
 */

'use client';

import { useState, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  /**
   * Handles file upload and initiates review process
   */
  const handleReviewSubmit = async (
    content: string,
    filename: string,
    journalName: string,
    isText: boolean = false
  ) => {
    setIsReviewing(true);
    setProgress(0);
    setCurrentStage(isText ? 'Processing text...' : 'Uploading...');
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
          pdfBase64: isText ? null : content,
          articleText: isText ? content : null,
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
    <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Automated Peer Review System
              </h1>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                AI-powered manuscript review using Claude API
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>System Online</span>
              </div>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  // Sun icon
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  // Moon icon
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Instructions Banner */}
        {!isReviewing && !report && (
          <div className={`mb-8 ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>
              How it works
            </h2>
            <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
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
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-md border`}>
            <UploadForm onSubmit={handleReviewSubmit} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Loading Progress */}
        {isReviewing && !report && (
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-md border p-8`}>
            <LoadingProgress
              progress={progress}
              currentStage={currentStage}
              error={error}
            />
          </div>
        )}

        {/* Error Display */}
        {error && !isReviewing && (
          <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-900'} mb-2`}>
              Review Failed
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'} mb-4`}>{error}</p>
            <button
              onClick={handleNewReview}
              className={`px-4 py-2 ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md transition-colors text-sm font-medium`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Review Results */}
        {report && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Review Report</h2>
              <button
                onClick={handleNewReview}
                className={`px-4 py-2 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-600 hover:bg-slate-700'} text-white rounded-md transition-colors text-sm font-medium`}
              >
                New Review
              </button>
            </div>
            <ReviewResults report={report} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
