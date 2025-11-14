/**
 * Eric Topol Review Results Component
 *
 * Displays review report from the simplified Eric Topol workflow
 * Includes markdown download functionality
 */

'use client';

import { useState } from 'react';

interface TopolReviewResultsProps {
  report: any; // Simplified report structure
}

export default function TopolReviewResults({ report }: TopolReviewResultsProps) {
  const [expandedReviewer, setExpandedReviewer] = useState<number | null>(null);

  const toggleReviewer = (index: number) => {
    setExpandedReviewer(expandedReviewer === index ? null : index);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([report.markdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peer-review-${report.articleTitle.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peer-review-${report.articleTitle.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRecommendationColor = (recommendation: string) => {
    if (!recommendation) return 'text-slate-700 bg-slate-100 border-slate-300';

    if (recommendation.toLowerCase().includes('accept')) {
      return 'text-green-700 bg-green-100 border-green-300';
    } else if (recommendation.toLowerCase().includes('minor')) {
      return 'text-blue-700 bg-blue-100 border-blue-300';
    } else if (recommendation.toLowerCase().includes('major')) {
      return 'text-orange-700 bg-orange-100 border-orange-300';
    } else if (recommendation.toLowerCase().includes('reject')) {
      return 'text-red-700 bg-red-100 border-red-300';
    }
    return 'text-slate-700 bg-slate-100 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              {report.articleTitle}
            </h2>
            <p className="text-sm text-slate-600 mb-1">
              Review Date:{' '}
              <span className="font-semibold">
                {new Date(report.reviewDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Reviewed by:{' '}
              <span className="font-semibold text-blue-700">
                Dr. Eric Topol
              </span>
            </p>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadMarkdown}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Report (MD)
            </button>
            <button
              onClick={downloadJSON}
              className="px-5 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
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
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              JSON
            </button>
          </div>
        </div>

        {/* Editorial Decision */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`px-4 py-2 rounded-lg border-2 font-bold ${
                  report.editorDecision.decision === 'Accept for Review'
                    ? 'text-green-700 bg-green-100 border-green-400'
                    : 'text-red-700 bg-red-100 border-red-400'
                }`}
              >
                {report.editorDecision.decision}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Editor's Decision
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {report.editorDecision.rationale}
              </p>
            </div>
          </div>
        </div>

        {/* Guidance for Reviewers (if accepted) */}
        {report.editorDecision.decision === 'Accept for Review' &&
          report.editorDecision.guidanceForReviewers && (
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Editorial Guidance to Reviewers
              </h3>
              <p className="text-sm text-slate-600">
                {report.editorDecision.guidanceForReviewers}
              </p>
            </div>
          )}
      </div>

      {/* Reviewer Reports (only if accepted for review) */}
      {report.reviews && report.reviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Specialist Reviews
          </h2>

          {report.reviews.map((review: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden"
            >
              {/* Reviewer Header */}
              <button
                onClick={() => toggleReviewer(index)}
                className="w-full px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-900">
                      Reviewer {index + 1}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Specialty: {review.specialty || 'Medical Specialist'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`px-4 py-2 rounded-lg border-2 font-semibold ${getRecommendationColor(review.recommendation)}`}
                  >
                    {review.recommendation}
                  </div>
                  <svg
                    className={`w-6 h-6 text-slate-600 transition-transform ${
                      expandedReviewer === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Reviewer Details (Expandable) */}
              {expandedReviewer === index && (
                <div className="p-6 space-y-6 bg-white border-t-2 border-slate-200">
                  {/* Summary */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Summary
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {review.summary}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {review.strengths && review.strengths.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {review.strengths.map((strength: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-green-900 flex items-start gap-2"
                            >
                              <span className="text-green-600 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {review.weaknesses && review.weaknesses.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
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
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {review.weaknesses.map((weakness: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-red-900 flex items-start gap-2"
                            >
                              <span className="text-red-600 mt-1">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Methodological Concerns */}
                  {review.methodologicalConcerns &&
                    review.methodologicalConcerns.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="text-sm font-bold text-orange-900 mb-3">
                          Methodological Concerns
                        </h4>
                        <ul className="space-y-2">
                          {review.methodologicalConcerns.map(
                            (concern: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-orange-900 flex items-start gap-2"
                              >
                                <span className="text-orange-600 font-bold mt-1">
                                  {i + 1}.
                                </span>
                                <span>{concern}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Questions for Authors */}
                  {review.questionsForAuthors &&
                    review.questionsForAuthors.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-900 mb-3">
                          Questions for Authors
                        </h4>
                        <ul className="space-y-2">
                          {review.questionsForAuthors.map(
                            (question: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-blue-900 flex items-start gap-2"
                              >
                                <span className="text-blue-600 font-bold">Q{i + 1}:</span>
                                <span>{question}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Recommendations */}
                  {review.recommendations && review.recommendations.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <h4 className="text-sm font-bold text-indigo-900 mb-3">
                        Recommendations for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {review.recommendations.map((rec: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-indigo-900 flex items-start gap-2"
                          >
                            <span className="text-indigo-600 font-bold mt-1">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
