/**
 * Upload Form Component
 *
 * Provides both plain text input and PDF upload with journal name input.
 * Redesigned with Perplexity-inspired modern aesthetic.
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
        {/* Mode Toggle - Modern Segmented Control */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Input Method
          </label>
          <div
            className="flex rounded-xl p-1"
            style={{
              background: 'var(--color-bg-elevated)'
            }}
          >
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2.5 px-4 font-medium rounded-lg transition-all ${
                inputMode === 'text' ? 'shadow-lg' : ''
              }`}
              style={{
                background: inputMode === 'text' ? 'var(--gradient-primary)' : 'transparent',
                color: inputMode === 'text' ? 'white' : 'var(--color-text-tertiary)'
              }}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              className="flex-1 py-2.5 px-4 font-medium rounded-lg transition-all opacity-50 cursor-not-allowed"
              style={{
                background: inputMode === 'pdf' ? 'var(--gradient-primary)' : 'transparent',
                color: inputMode === 'pdf' ? 'white' : 'var(--color-text-tertiary)'
              }}
              disabled
            >
              Upload PDF (Coming Soon)
            </button>
          </div>
        </div>

        {/* Text Input Area - Code Editor Style */}
        {inputMode === 'text' && (
          <div>
            <label
              htmlFor="articleText"
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Article Text
            </label>
            <textarea
              id="articleText"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste your research article text here (abstract, introduction, methods, results, discussion, etc.)..."
              className="w-full h-96 px-4 py-3 rounded-xl transition-all resize-y font-mono text-sm"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-primary)',
                color: 'var(--color-text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-accent-primary)';
                e.target.style.boxShadow = 'var(--glow-primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Minimum 100 characters required. Include your abstract, methods, results, and discussion.
            </p>
          </div>
        )}

        {/* Journal Name Input */}
        <div>
          <label
            htmlFor="journalName"
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Target Journal
          </label>
          <input
            type="text"
            id="journalName"
            value={journalName}
            onChange={(e) => setJournalName(e.target.value)}
            placeholder="e.g., Nature, Science, Cell, NEJM, Journal of Public Health Policy"
            className="w-full px-4 py-3 rounded-xl transition-all"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-primary)',
              color: 'var(--color-text-primary)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-accent-primary)';
              e.target.style.boxShadow = 'var(--glow-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border-primary)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Enter the name of the journal you're targeting for submission
          </p>
        </div>

        {/* Submit Button - Prominent CTA */}
        <button
          type="submit"
          disabled={!isValid || isProcessing}
          className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform relative overflow-hidden"
          style={{
            background: isValid && !isProcessing ? 'var(--gradient-primary)' : 'var(--color-bg-elevated)',
            opacity: isValid && !isProcessing ? 1 : 0.5,
            cursor: isValid && !isProcessing ? 'pointer' : 'not-allowed',
            boxShadow: isValid && !isProcessing ? '0 4px 20px rgba(59, 130, 246, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (isValid && !isProcessing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (isValid && !isProcessing) {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
            }
          }}
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
            <>
              <span className="relative z-10">Start Peer Review</span>
              {isValid && (
                <div
                  className="absolute inset-0 -z-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  }}
                />
              )}
            </>
          )}
        </button>

        {/* Info Box */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>What happens next:</strong> Your article will be reviewed by AI
            agents modeled after world-class researchers. The process typically takes
            2-5 minutes and includes editorial assessment, specialist peer reviews, and
            iterative feedback synthesis.
          </p>
        </div>
      </div>
    </form>
  );
}
