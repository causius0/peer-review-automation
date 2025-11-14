/**
 * Upload Form Component
 *
 * Provides both plain text input and PDF upload with journal name input.
 */

'use client';

import { useState } from 'react';

interface UploadFormProps {
  onSubmit: (content: string, filename: string, journalName: string, isText: boolean) => void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [articleText, setArticleText] = useState('');
  const [journalName, setJournalName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!journalName.trim() || !articleText.trim()) {
      return;
    }

    setIsProcessing(true);

    try {
      // For text mode, pass the text directly
      onSubmit(articleText, 'article.txt', journalName.trim(), true);
    } catch (error) {
      console.error('Error processing submission:', error);
      alert('Failed to process submission. Please try again.');
      setIsProcessing(false);
    }
  };

  const isValid = articleText.trim().length > 100 && journalName.trim().length >= 2;

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Input Method
          </label>
          <div className="flex rounded-lg overflow-hidden border border-slate-300">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2 px-4 font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              className={`flex-1 py-2 px-4 font-medium transition-colors ${
                inputMode === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
              disabled
            >
              Upload PDF (Coming Soon)
            </button>
          </div>
        </div>

        {/* Text Input Area */}
        {inputMode === 'text' && (
          <div>
            <label
              htmlFor="articleText"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Article Text
            </label>
            <textarea
              id="articleText"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste your research article text here (abstract, introduction, methods, results, discussion, etc.)..."
              className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 font-mono text-sm resize-y"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum 100 characters required. Include your abstract, methods, results, and discussion.
            </p>
          </div>
        )}

        {/* Journal Name Input */}
        <div>
          <label
            htmlFor="journalName"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Target Journal
          </label>
          <input
            type="text"
            id="journalName"
            value={journalName}
            onChange={(e) => setJournalName(e.target.value)}
            placeholder="e.g., Nature, Science, Cell, NEJM, Journal of Public Health Policy"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Enter the name of the journal you're targeting for submission
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isProcessing}
          className={`
            w-full py-4 px-6 rounded-lg font-medium text-white
            transition-all duration-200 transform
            ${
              isValid && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] shadow-md hover:shadow-lg'
                : 'bg-slate-300 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            'Start Peer Review'
          )}
        </button>

        {/* Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600">
            <strong>What happens next:</strong> Your article will be reviewed by AI
            agents modeled after world-class researchers. The process typically takes
            2-5 minutes and includes editorial assessment, specialist peer reviews, and
            iterative feedback synthesis.
          </p>
        </div>
      </div>
    </form>
  );
}
