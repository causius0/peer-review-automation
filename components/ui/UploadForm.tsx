/**
 * Upload Form Component
 *
 * Provides drag-and-drop PDF upload interface and journal name input.
 * Uses react-dropzone for robust file handling.
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadFormProps {
  onSubmit: (pdfBase64: string, filename: string, journalName: string) => void;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [journalName, setJournalName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handles file drop/selection
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  /**
   * Converts file to base64 string
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !journalName.trim()) {
      return;
    }

    setIsProcessing(true);

    try {
      const base64 = await fileToBase64(file);
      onSubmit(base64, file.name, journalName.trim());
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Failed to process PDF file. Please try again.');
      setIsProcessing(false);
    }
  };

  /**
   * Removes selected file
   */
  const handleRemoveFile = () => {
    setFile(null);
  };

  /**
   * Formats file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isValid = file && journalName.trim().length >= 2;

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Research Article (PDF)
          </label>

          {!file ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-all duration-200
                ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-slate-600">
                {isDragActive ? (
                  <span className="font-medium text-blue-600">Drop PDF here</span>
                ) : (
                  <>
                    <span className="font-medium text-slate-700">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">PDF files only, max 10MB</p>
            </div>
          ) : (
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

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
            placeholder="e.g., Nature, Science, Cell, NEJM"
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
