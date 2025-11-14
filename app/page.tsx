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
import AnimatedBackground from '@/components/ui/AnimatedBackground';

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
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-opacity-50 border-b border-[var(--color-border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Automated Peer Review System
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                AI-powered manuscript review using Claude API
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)'
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--color-accent-success)',
                  boxShadow: 'var(--glow-success)',
                  animation: 'neuralPulse 2s ease-in-out infinite'
                }}
              ></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-accent-success)' }}>
                System Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Instructions Banner */}
        {!isReviewing && !report && (
          <div
            className="mb-8 rounded-2xl p-6 backdrop-blur-sm border"
            style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderColor: 'rgba(59, 130, 246, 0.2)'
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              How it works
            </h2>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }}
                >
                  1
                </span>
                <span>
                  Upload your research article (PDF format) and specify the target journal
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }}
                >
                  2
                </span>
                <span>
                  The Editor (Dr. Marcia Chen) assesses your article and selects 2
                  specialist reviewers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }}
                >
                  3
                </span>
                <span>
                  Expert reviewers provide detailed feedback based on their field expertise
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }}
                >
                  4
                </span>
                <span>
                  The system iterates up to 3 times or until reviewers recommend acceptance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }}
                >
                  5
                </span>
                <span>
                  Receive a comprehensive review report with actionable recommendations
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Upload Form */}
        {!isReviewing && !report && (
          <div
            className="rounded-2xl backdrop-blur-sm border"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <UploadForm onSubmit={handleReviewSubmit} />
          </div>
        )}

        {/* Loading Progress */}
        {isReviewing && !report && (
          <div
            className="rounded-2xl backdrop-blur-sm border p-8"
            style={{
              background: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-primary)'
            }}
          >
            <LoadingProgress
              progress={progress}
              currentStage={currentStage}
              error={error}
            />
          </div>
        )}

        {/* Error Display */}
        {error && !isReviewing && (
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-accent-error)' }}
            >
              Review Failed
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={handleNewReview}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'var(--color-accent-error)',
                color: 'white'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Review Results */}
        {report && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Review Report
              </h2>
              <button
                onClick={handleNewReview}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)'
                }}
              >
                New Review
              </button>
            </div>
            <ReviewResults report={report} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 border-t mt-16"
        style={{
          borderColor: 'var(--color-border-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            <p>
              Powered by{' '}
              <a
                href="https://www.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-accent-primary)' }}
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
