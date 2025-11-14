/**
 * Upload Form Component
 *
 * Medical manuscript submission form for peer review
 * Accepts plain text input only, focused on medical research
 */

'use client';

import { useState } from 'react';

interface UploadFormProps {
  onSubmit: (content: string, filename: string, journalName: string, isText: boolean) => void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [articleText, setArticleText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleText.trim()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Pass the text directly - journal is implied to be medical
      onSubmit(articleText, 'medical-manuscript.txt', 'Medical Journal', true);
    } catch (error) {
      console.error('Error processing submission:', error);
      alert('Failed to process submission. Please try again.');
      setIsProcessing(false);
    }
  };

  const isValid = articleText.trim().length > 100;

  return (
    <form onSubmit={handleSubmit} className="p-10">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Submit Medical Manuscript
          </h2>
          <p className="text-slate-600">
            Reviewed by Dr. Eric Topol and expert medical specialists
          </p>
        </div>

        {/* Text Input Area */}
        <div>
          <label
            htmlFor="articleText"
            className="block text-base font-semibold text-slate-700 mb-3"
          >
            Manuscript Text
          </label>
          <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-200">
            <p className="text-sm text-slate-600">
              <strong>Required sections:</strong> Abstract and Methods
              <br />
              <span className="text-xs text-slate-500 mt-1 block">
                You may also include Introduction, Results, and Discussion for context
              </span>
            </p>
          </div>
          <textarea
            id="articleText"
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            placeholder="Paste your medical research manuscript here...

ABSTRACT
Background: [Your background]
Methods: [Your methods]
Results: [Your results]
Conclusions: [Your conclusions]

METHODS
Study Design: [Details]
Participants: [Details]
Statistical Analysis: [Details]
..."
            className="w-full h-[32rem] px-5 py-4 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400 text-sm leading-relaxed resize-y shadow-inner bg-white"
            required
          />
          <p className="mt-2 text-sm text-slate-500 flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Minimum 100 characters. The review will focus on your Abstract and
              Methods sections specifically.
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isProcessing}
          className={`
            w-full py-5 px-8 rounded-lg font-semibold text-lg text-white
            transition-all duration-300 transform
            ${
              isValid && !isProcessing
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.01] shadow-lg hover:shadow-xl'
                : 'bg-slate-300 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
              Submitting for Review...
            </span>
          ) : (
            <>
              Begin Peer Review Process
              <svg
                className="inline-block ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Review Process
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                <strong>Editorial Assessment</strong> - Dr. Eric Topol reviews your
                Abstract and Methods
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                <strong>Specialist Review</strong> - Two expert reviewers conduct
                parallel assessment
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                <strong>Final Report</strong> - Comprehensive feedback with actionable
                recommendations
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-600 italic">
            Expected duration: 1-2 minutes
          </p>
        </div>
      </div>
    </form>
  );
}
