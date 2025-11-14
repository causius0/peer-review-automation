/**
 * Review Results Component
 *
 * Displays the complete peer review report with all iterations,
 * reviewer feedback, and final recommendations.
 */

'use client';

import { useState } from 'react';
import type { ReviewReport, ReviewIteration, PeerReview } from '@/types';
import { formatReportAsMarkdown } from '@/lib/formatters/markdown';

interface ReviewResultsProps {
  report: ReviewReport;
}

export default function ReviewResults({ report }: ReviewResultsProps) {
  const [expandedIteration, setExpandedIteration] = useState<number>(1);
  const [expandedReviewer, setExpandedReviewer] = useState<{
    iteration: number;
    reviewer: number;
  } | null>(null);

  const toggleIteration = (iterNum: number) => {
    setExpandedIteration(expandedIteration === iterNum ? 0 : iterNum);
  };

  const toggleReviewer = (iterNum: number, reviewerNum: number) => {
    if (
      expandedReviewer?.iteration === iterNum &&
      expandedReviewer?.reviewer === reviewerNum
    ) {
      setExpandedReviewer(null);
    } else {
      setExpandedReviewer({ iteration: iterNum, reviewer: reviewerNum });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Accept':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'Minor Revisions':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'Major Revisions':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'Reject':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  const downloadJSON = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${report.articleTitle.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const markdown = formatReportAsMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${report.articleTitle.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const markdown = formatReportAsMarkdown(report);

    // Create a new window with the markdown content formatted for print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    // Convert markdown to HTML for better PDF rendering
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Peer Review Report - ${report.articleTitle}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 { color: #1a202c; border-bottom: 3px solid #4299e1; padding-bottom: 10px; }
            h2 { color: #2d3748; border-bottom: 2px solid #cbd5e0; padding-bottom: 8px; margin-top: 30px; }
            h3 { color: #4a5568; margin-top: 20px; }
            h4 { color: #718096; margin-top: 15px; }
            strong { color: #2d3748; }
            ul, ol { margin-left: 20px; }
            li { margin: 5px 0; }
            hr { border: none; border-top: 1px solid #e2e8f0; margin: 30px 0; }
            @media print {
              body { padding: 0; }
              h2 { page-break-before: auto; }
            }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: inherit;">${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {report.articleTitle}
            </h2>
            <p className="text-sm text-slate-600">
              Target Journal: <span className="font-medium">{report.targetJournal}</span>
            </p>
            <p className="text-sm text-slate-600">
              Review Date:{' '}
              <span className="font-medium">
                {new Date(report.reviewDate).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Iterations: <span className="font-medium">{report.totalIterations}</span>
            </p>
          </div>
          <div
            className={`px-6 py-3 rounded-lg border-2 font-semibold text-lg ${getRecommendationColor(report.finalRecommendation)}`}
          >
            {report.finalRecommendation}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Editorial Decision
          </h3>
          <p className="text-slate-700">{report.finalRationale}</p>
        </div>

        {/* Priority Recommendations */}
        {report.priorityRecommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Priority Recommendations
            </h3>
            <ul className="space-y-2">
              {report.priorityRecommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start text-sm text-slate-700"
                >
                  <span className="mr-2 text-blue-600 font-bold">{idx + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths and Critical Issues */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          {report.strengthsToPreserve.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                Strengths to Preserve
              </h3>
              <ul className="space-y-2">
                {report.strengthsToPreserve.map((strength, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-slate-700"
                  >
                    <span className="mr-2 text-green-600">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Issues */}
          {report.criticalIssuesToAddress.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                Critical Issues to Address
              </h3>
              <ul className="space-y-2">
                {report.criticalIssuesToAddress.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-slate-700"
                  >
                    <span className="mr-2 text-red-600">!</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Suggested Next Steps */}
        {report.suggestedNextSteps.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Suggested Next Steps
            </h3>
            <ul className="space-y-2">
              {report.suggestedNextSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start text-sm text-slate-700"
                >
                  <span className="mr-2 text-blue-600">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trajectory Analysis */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Trajectory Analysis
        </h3>
        <p className="text-slate-700 mb-4">
          {report.trajectoryAnalysis.overallConvergence}
        </p>

        {report.trajectoryAnalysis.iteration1to2 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Iteration 1 → 2 Changes
            </h4>
            {report.trajectoryAnalysis.iteration1to2.improvements.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-blue-800">Improvements:</p>
                <ul className="ml-4 text-sm text-blue-700">
                  {report.trajectoryAnalysis.iteration1to2.improvements.map(
                    (imp, idx) => (
                      <li key={idx}>• {imp}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            {report.trajectoryAnalysis.iteration1to2.persistentIssues.length > 0 && (
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Persistent Issues:
                </p>
                <ul className="ml-4 text-sm text-blue-700">
                  {report.trajectoryAnalysis.iteration1to2.persistentIssues.map(
                    (issue, idx) => (
                      <li key={idx}>• {issue}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {report.trajectoryAnalysis.iteration2to3 && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">
              Iteration 2 → 3 Changes
            </h4>
            {report.trajectoryAnalysis.iteration2to3.improvements.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-purple-800">Improvements:</p>
                <ul className="ml-4 text-sm text-purple-700">
                  {report.trajectoryAnalysis.iteration2to3.improvements.map(
                    (imp, idx) => (
                      <li key={idx}>• {imp}</li>
                    )
                  )}
                </ul>
              </div>
            )}
            {report.trajectoryAnalysis.iteration2to3.persistentIssues.length > 0 && (
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Persistent Issues:
                </p>
                <ul className="ml-4 text-sm text-purple-700">
                  {report.trajectoryAnalysis.iteration2to3.persistentIssues.map(
                    (issue, idx) => (
                      <li key={idx}>• {issue}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Iterations */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Review Iterations</h3>

        {report.iterations.map((iteration) => (
          <IterationView
            key={iteration.iterationNumber}
            iteration={iteration}
            isExpanded={expandedIteration === iteration.iterationNumber}
            onToggle={() => toggleIteration(iteration.iterationNumber)}
            expandedReviewer={expandedReviewer}
            onToggleReviewer={toggleReviewer}
            getRecommendationColor={getRecommendationColor}
          />
        ))}
      </div>

      {/* Export Buttons */}
      <div className="flex justify-center space-x-4 flex-wrap gap-y-3">
        <button
          onClick={downloadMarkdown}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
          title="Download as Markdown file"
        >
          📄 Export as Markdown
        </button>
        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
          title="Print to PDF (uses browser print dialog)"
        >
          📑 Export as PDF
        </button>
        <button
          onClick={downloadJSON}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          title="Download as JSON file"
        >
          💾 Export as JSON
        </button>
      </div>
    </div>
  );
}

/**
 * Iteration View Component
 */
interface IterationViewProps {
  iteration: ReviewIteration;
  isExpanded: boolean;
  onToggle: () => void;
  expandedReviewer: { iteration: number; reviewer: number } | null;
  onToggleReviewer: (iterNum: number, reviewerNum: number) => void;
  getRecommendationColor: (rec: string) => string;
}

function IterationView({
  iteration,
  isExpanded,
  onToggle,
  expandedReviewer,
  onToggleReviewer,
  getRecommendationColor,
}: IterationViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <h4 className="text-lg font-semibold text-slate-900">
          Iteration {iteration.iterationNumber}
        </h4>
        <svg
          className={`w-6 h-6 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Editorial Assessment (Iteration 1 only) */}
          {iteration.editorialAssessment && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-semibold text-yellow-900 mb-2">
                Editorial Assessment (Dr. Marcia Chen)
              </h5>
              <div className="text-sm text-yellow-800 space-y-2">
                <p>
                  <strong>Decision:</strong> {iteration.editorialAssessment.decision}
                </p>
                <p>
                  <strong>Field:</strong>{' '}
                  {iteration.editorialAssessment.classification.subSpecialty}
                </p>
                <p>
                  <strong>Rationale:</strong>{' '}
                  {iteration.editorialAssessment.rationale}
                </p>
                <div>
                  <strong>Selected Reviewers:</strong>
                  <ul className="ml-4 mt-1">
                    {iteration.editorialAssessment.selectedReviewers.map(
                      (rev, idx) => (
                        <li key={idx}>
                          {idx + 1}. {rev.specialty} - {rev.rationale}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Reviewer 1 */}
          <ReviewerView
            review={iteration.reviews[0]}
            reviewerNumber={1}
            isExpanded={
              expandedReviewer?.iteration === iteration.iterationNumber &&
              expandedReviewer?.reviewer === 1
            }
            onToggle={() => onToggleReviewer(iteration.iterationNumber, 1)}
            getRecommendationColor={getRecommendationColor}
          />

          {/* Reviewer 2 */}
          <ReviewerView
            review={iteration.reviews[1]}
            reviewerNumber={2}
            isExpanded={
              expandedReviewer?.iteration === iteration.iterationNumber &&
              expandedReviewer?.reviewer === 2
            }
            onToggle={() => onToggleReviewer(iteration.iterationNumber, 2)}
            getRecommendationColor={getRecommendationColor}
          />

          {/* Synthesis */}
          {iteration.synthesis && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-3">
                Editor's Synthesis
              </h5>
              <div className="text-sm text-purple-800 space-y-3">
                <div>
                  <strong>Consensus:</strong>
                  <ul className="ml-4">
                    {iteration.synthesis.consensus.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                {iteration.synthesis.disagreements.length > 0 && (
                  <div>
                    <strong>Disagreements:</strong>
                    <ul className="ml-4">
                      {iteration.synthesis.disagreements.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <strong>Critical Issues:</strong>
                  <ul className="ml-4">
                    {iteration.synthesis.criticalIssues.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Decision:</strong> {iteration.synthesis.decision}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reviewer View Component
 */
interface ReviewerViewProps {
  review: PeerReview;
  reviewerNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  getRecommendationColor: (rec: string) => string;
}

function ReviewerView({
  review,
  reviewerNumber,
  isExpanded,
  onToggle,
  getRecommendationColor,
}: ReviewerViewProps) {
  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-150 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-900">
            Reviewer {reviewerNumber}
          </span>
          <span className="text-sm text-slate-600">({review.reviewerSpecialty})</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(review.recommendation)}`}
          >
            {review.recommendation}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 text-sm">
          {/* Summary */}
          <div>
            <h6 className="font-semibold text-slate-900 mb-1">Summary</h6>
            <p className="text-slate-700">{review.summary}</p>
          </div>

          {/* Strengths */}
          {review.strengths.length > 0 && (
            <div>
              <h6 className="font-semibold text-green-900 mb-1">Strengths</h6>
              <ul className="space-y-1 text-green-800">
                {review.strengths.map((strength, idx) => (
                  <li key={idx}>✓ {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {review.weaknesses.length > 0 && (
            <div>
              <h6 className="font-semibold text-red-900 mb-1">Weaknesses</h6>
              <ul className="space-y-1 text-red-800">
                {review.weaknesses.map((weakness, idx) => (
                  <li key={idx}>! {weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Comments */}
          <div>
            <h6 className="font-semibold text-slate-900 mb-2">Detailed Comments</h6>
            <div className="space-y-2 text-slate-700">
              {Object.entries(review.detailedComments).map(([section, comment]) => (
                comment && (
                  <div key={section} className="pl-4 border-l-2 border-slate-300">
                    <p className="font-medium capitalize">{section}:</p>
                    <p className="text-slate-600">{comment}</p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Questions */}
          {review.questionsForAuthors.length > 0 && (
            <div>
              <h6 className="font-semibold text-slate-900 mb-1">
                Questions for Authors
              </h6>
              <ol className="list-decimal ml-5 space-y-1 text-slate-700">
                {review.questionsForAuthors.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Suggestions */}
          {review.suggestions.length > 0 && (
            <div>
              <h6 className="font-semibold text-slate-900 mb-1">Suggestions</h6>
              <ul className="space-y-1 text-slate-700">
                {review.suggestions.map((sug, idx) => (
                  <li key={idx}>→ {sug}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Notes */}
          {review.additionalNotes && (
            <div className="pt-2 border-t border-slate-200">
              <h6 className="font-semibold text-slate-900 mb-1">Additional Notes</h6>
              <p className="text-slate-700">{review.additionalNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
