/**
 * Markdown Report Formatter
 *
 * Converts review reports to formatted markdown for export
 */

import type { ReviewReport, ReviewIteration, PeerReview } from '@/types';

/**
 * Converts a review report to markdown format
 */
export function formatReportAsMarkdown(report: ReviewReport): string {
  const sections: string[] = [];

  // Title and metadata
  sections.push(`# Peer Review Report: ${report.articleTitle}`);
  sections.push('');
  sections.push(`**Target Journal:** ${report.targetJournal}`);
  sections.push(`**Review Date:** ${new Date(report.reviewDate).toLocaleDateString()}`);
  sections.push(`**Total Iterations:** ${report.totalIterations}`);
  sections.push(`**Final Recommendation:** ${report.finalRecommendation}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Executive Summary
  sections.push('## Executive Summary');
  sections.push('');
  sections.push('### Editorial Decision');
  sections.push(report.finalRationale);
  sections.push('');

  // Priority Recommendations
  if (report.priorityRecommendations.length > 0) {
    sections.push('### Priority Recommendations');
    sections.push('');
    report.priorityRecommendations.forEach((rec, idx) => {
      sections.push(`${idx + 1}. ${rec}`);
    });
    sections.push('');
  }

  // Strengths and Critical Issues
  if (report.strengthsToPreserve.length > 0 || report.criticalIssuesToAddress.length > 0) {
    sections.push('### Key Findings');
    sections.push('');

    if (report.strengthsToPreserve.length > 0) {
      sections.push('**Strengths to Preserve:**');
      sections.push('');
      report.strengthsToPreserve.forEach((strength) => {
        sections.push(`- ✓ ${strength}`);
      });
      sections.push('');
    }

    if (report.criticalIssuesToAddress.length > 0) {
      sections.push('**Critical Issues to Address:**');
      sections.push('');
      report.criticalIssuesToAddress.forEach((issue) => {
        sections.push(`- ⚠ ${issue}`);
      });
      sections.push('');
    }
  }

  // Suggested Next Steps
  if (report.suggestedNextSteps.length > 0) {
    sections.push('### Suggested Next Steps');
    sections.push('');
    report.suggestedNextSteps.forEach((step, idx) => {
      sections.push(`${idx + 1}. ${step}`);
    });
    sections.push('');
  }

  sections.push('---');
  sections.push('');

  // Trajectory Analysis
  sections.push('## Trajectory Analysis');
  sections.push('');
  sections.push(report.trajectoryAnalysis.overallConvergence);
  sections.push('');

  if (report.trajectoryAnalysis.iteration1to2) {
    sections.push('### Changes: Iteration 1 → 2');
    sections.push('');

    if (report.trajectoryAnalysis.iteration1to2.improvements.length > 0) {
      sections.push('**Improvements:**');
      sections.push('');
      report.trajectoryAnalysis.iteration1to2.improvements.forEach((imp) => {
        sections.push(`- ${imp}`);
      });
      sections.push('');
    }

    if (report.trajectoryAnalysis.iteration1to2.persistentIssues.length > 0) {
      sections.push('**Persistent Issues:**');
      sections.push('');
      report.trajectoryAnalysis.iteration1to2.persistentIssues.forEach((issue) => {
        sections.push(`- ${issue}`);
      });
      sections.push('');
    }
  }

  if (report.trajectoryAnalysis.iteration2to3) {
    sections.push('### Changes: Iteration 2 → 3');
    sections.push('');

    if (report.trajectoryAnalysis.iteration2to3.improvements.length > 0) {
      sections.push('**Improvements:**');
      sections.push('');
      report.trajectoryAnalysis.iteration2to3.improvements.forEach((imp) => {
        sections.push(`- ${imp}`);
      });
      sections.push('');
    }

    if (report.trajectoryAnalysis.iteration2to3.persistentIssues.length > 0) {
      sections.push('**Persistent Issues:**');
      sections.push('');
      report.trajectoryAnalysis.iteration2to3.persistentIssues.forEach((issue) => {
        sections.push(`- ${issue}`);
      });
      sections.push('');
    }
  }

  sections.push('---');
  sections.push('');

  // Detailed Review Iterations
  sections.push('## Detailed Review Iterations');
  sections.push('');

  report.iterations.forEach((iteration) => {
    sections.push(`### Iteration ${iteration.iterationNumber}`);
    sections.push('');

    // Editorial Assessment (first iteration only)
    if (iteration.editorialAssessment) {
      sections.push('#### Editorial Assessment (Dr. Marcia Chen)');
      sections.push('');
      sections.push(`**Decision:** ${iteration.editorialAssessment.decision}`);
      sections.push(`**Field:** ${iteration.editorialAssessment.classification.subSpecialty}`);
      sections.push(`**Rationale:** ${iteration.editorialAssessment.rationale}`);
      sections.push('');
      sections.push('**Selected Reviewers:**');
      sections.push('');
      iteration.editorialAssessment.selectedReviewers.forEach((rev, idx) => {
        sections.push(`${idx + 1}. **${rev.specialty}** - ${rev.rationale}`);
      });
      sections.push('');
    }

    // Reviewer 1
    sections.push(...formatReviewAsMarkdown(iteration.reviews[0], 1));

    // Reviewer 2
    sections.push(...formatReviewAsMarkdown(iteration.reviews[1], 2));

    // Synthesis
    if (iteration.synthesis) {
      sections.push('#### Editor\'s Synthesis');
      sections.push('');

      sections.push('**Consensus Points:**');
      sections.push('');
      iteration.synthesis.consensus.forEach((item) => {
        sections.push(`- ${item}`);
      });
      sections.push('');

      if (iteration.synthesis.disagreements.length > 0) {
        sections.push('**Disagreements:**');
        sections.push('');
        iteration.synthesis.disagreements.forEach((item) => {
          sections.push(`- ${item}`);
        });
        sections.push('');
      }

      sections.push('**Critical Issues:**');
      sections.push('');
      iteration.synthesis.criticalIssues.forEach((item) => {
        sections.push(`- ${item}`);
      });
      sections.push('');

      sections.push(`**Synthesis Decision:** ${iteration.synthesis.decision}`);
      sections.push('');
    }

    sections.push('---');
    sections.push('');
  });

  // Footer
  sections.push('---');
  sections.push('');
  sections.push('*Generated by Automated Peer Review System*');
  sections.push('');

  return sections.join('\n');
}

/**
 * Formats a single peer review as markdown
 */
function formatReviewAsMarkdown(review: PeerReview, reviewerNumber: number): string[] {
  const sections: string[] = [];

  sections.push(`#### Reviewer ${reviewerNumber}: ${review.reviewerSpecialty}`);
  sections.push('');
  sections.push(`**Recommendation:** ${review.recommendation}`);
  sections.push('');
  sections.push(`**Summary:** ${review.summary}`);
  sections.push('');

  // Strengths
  if (review.strengths.length > 0) {
    sections.push('**Strengths:**');
    sections.push('');
    review.strengths.forEach((strength) => {
      sections.push(`- ✓ ${strength}`);
    });
    sections.push('');
  }

  // Weaknesses
  if (review.weaknesses.length > 0) {
    sections.push('**Weaknesses:**');
    sections.push('');
    review.weaknesses.forEach((weakness) => {
      sections.push(`- ⚠ ${weakness}`);
    });
    sections.push('');
  }

  // Detailed Comments
  sections.push('**Detailed Comments:**');
  sections.push('');
  Object.entries(review.detailedComments).forEach(([section, comment]) => {
    if (comment) {
      sections.push(`- **${section.charAt(0).toUpperCase() + section.slice(1)}:** ${comment}`);
    }
  });
  sections.push('');

  // Questions for Authors
  if (review.questionsForAuthors.length > 0) {
    sections.push('**Questions for Authors:**');
    sections.push('');
    review.questionsForAuthors.forEach((q, idx) => {
      sections.push(`${idx + 1}. ${q}`);
    });
    sections.push('');
  }

  // Suggestions
  if (review.suggestions.length > 0) {
    sections.push('**Suggestions:**');
    sections.push('');
    review.suggestions.forEach((sug) => {
      sections.push(`- ${sug}`);
    });
    sections.push('');
  }

  // Additional Notes
  if (review.additionalNotes) {
    sections.push('**Additional Notes:**');
    sections.push('');
    sections.push(review.additionalNotes);
    sections.push('');
  }

  return sections;
}
