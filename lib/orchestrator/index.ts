/**
 * Review Orchestration Engine
 *
 * This is the core orchestrator that manages the entire peer review workflow.
 * It coordinates between PDF extraction, journal criteria fetching, The Editor,
 * the reviewers, and the iteration logic.
 *
 * Workflow:
 * 1. Extract text from PDF
 * 2. Fetch journal criteria
 * 3. Get editorial assessment
 * 4. If accepted for review, get 2 peer reviews
 * 5. Synthesize feedback
 * 6. Iterate up to 3 times or until convergence
 * 7. Generate final report
 */

import type {
  ReviewReport,
  ReviewIteration,
  PeerReview,
  ReviewRecommendation,
  TrajectoryAnalysis,
} from '@/types';
import { extractTextFromBase64PDF, extractTitle } from '@/lib/pdf/parser';
import { fetchJournalCriteria } from '@/lib/journal/scraper';
import {
  getEditorialAssessment,
  getPeerReview,
  getIterationSynthesis,
  validateAPIKey,
} from '@/lib/claude/client';

/**
 * Progress callback function type
 */
export type ProgressCallback = (
  stage: string,
  iteration: number,
  percentage: number,
  message: string
) => void;

/**
 * Main orchestration function that runs the complete review process
 *
 * @param contentOrPdfBase64 - Either plain text or base64-encoded PDF data
 * @param filename - Original filename
 * @param journalName - Target journal name
 * @param onProgress - Optional callback for progress updates
 * @param isPlainText - If true, treats input as plain text instead of PDF
 * @returns Complete review report
 * @throws Error if any step fails
 *
 * @example
 * ```typescript
 * const report = await orchestrateReview(
 *   pdfBase64,
 *   'article.pdf',
 *   'Nature',
 *   (stage, iter, pct, msg) => console.log(`${stage}: ${msg}`),
 *   false
 * );
 * ```
 */
export async function orchestrateReview(
  contentOrPdfBase64: string,
  filename: string,
  journalName: string,
  onProgress?: ProgressCallback,
  isPlainText: boolean = false
): Promise<ReviewReport> {
  // Validate API key before starting
  validateAPIKey();

  const startTime = Date.now();

  let articleText: string;
  let articleTitle: string;

  if (isPlainText) {
    // ========================================================================
    // STEP 1: Use provided plain text
    // ========================================================================
    onProgress?.('processing_text', 0, 5, 'Processing article text...');

    articleText = contentOrPdfBase64;
    articleTitle = extractTitle(articleText) || filename.replace(/\.[^/.]+$/, '');

    if (!articleText || articleText.length < 100) {
      throw new Error('Article text is too short (minimum 100 characters required).');
    }

    console.log(`✓ Received ${articleText.length} characters of text`);
  } else {
    // ========================================================================
    // STEP 1: Extract text from PDF
    // ========================================================================
    onProgress?.('extracting_text', 0, 5, 'Extracting text from PDF...');

    const pdfResult = await extractTextFromBase64PDF(contentOrPdfBase64);
    articleText = pdfResult.text;
    articleTitle =
      pdfResult.metadata?.title || extractTitle(articleText) || filename;

    if (!articleText || articleText.length < 500) {
      throw new Error(
        'Extracted text is too short. PDF may be corrupted or contain only images.'
      );
    }

    console.log(
      `✓ Extracted ${pdfResult.pageCount} pages, ${articleText.length} characters`
    );
  }

  // ========================================================================
  // STEP 2: Fetch journal criteria
  // ========================================================================
  onProgress?.('fetching_criteria', 0, 10, `Fetching criteria for ${journalName}...`);

  const journalCriteria = await fetchJournalCriteria(journalName);

  console.log(
    `✓ Fetched ${journalName} criteria (source: ${journalCriteria.source})`
  );

  // ========================================================================
  // STEP 3: Editorial assessment
  // ========================================================================
  onProgress?.(
    'editorial_assessment',
    1,
    15,
    'The Editor is assessing the article...'
  );

  const editorialAssessment = await getEditorialAssessment(
    articleText,
    journalName,
    `${journalCriteria.scope}\n\n${journalCriteria.criteria}`
  );

  console.log(
    `✓ Editorial decision: ${editorialAssessment.decision} (Field: ${editorialAssessment.classification.subSpecialty})`
  );

  // If desk rejected, return early with minimal report
  if (editorialAssessment.decision === 'Desk Reject') {
    return createDeskRejectReport(
      articleTitle,
      journalName,
      editorialAssessment,
      startTime
    );
  }

  // ========================================================================
  // STEP 4-6: Iterative review process (up to 3 iterations)
  // ========================================================================
  const iterations: ReviewIteration[] = [];
  const maxIterations = 3;

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n=== ITERATION ${i} ===`);

    // Get reviews from both selected reviewers
    const [reviewer1Specialty, reviewer2Specialty] =
      editorialAssessment.selectedReviewers.map((r) => r.specialty);

    // Reviewer 1
    onProgress?.(
      'reviewer_1',
      i,
      20 + (i - 1) * 25,
      `Reviewer 1 (${reviewer1Specialty}) is reviewing...`
    );

    const review1 = await getPeerReview(reviewer1Specialty, articleText);

    console.log(
      `✓ Reviewer 1 (${reviewer1Specialty}): ${review1.recommendation}`
    );

    // Reviewer 2
    onProgress?.(
      'reviewer_2',
      i,
      25 + (i - 1) * 25,
      `Reviewer 2 (${reviewer2Specialty}) is reviewing...`
    );

    const review2 = await getPeerReview(reviewer2Specialty, articleText);

    console.log(
      `✓ Reviewer 2 (${reviewer2Specialty}): ${review2.recommendation}`
    );

    // Create iteration object
    const iteration: ReviewIteration = {
      iterationNumber: i,
      reviews: [review1, review2],
    };

    // Add editorial assessment to first iteration
    if (i === 1) {
      iteration.editorialAssessment = editorialAssessment;
    }

    // Synthesize feedback (except on final iteration)
    if (i < maxIterations) {
      onProgress?.(
        'synthesis',
        i,
        30 + (i - 1) * 25,
        'The Editor is synthesizing feedback...'
      );

      const synthesis = await getIterationSynthesis(
        articleText,
        review1,
        review2,
        i
      );

      iteration.synthesis = synthesis;

      console.log(`✓ Synthesis: ${synthesis.decision}`);

      iterations.push(iteration);

      // Check if we should stop iterating
      if (synthesis.decision === 'Accept' || synthesis.decision === 'Reject') {
        console.log(`Stopping iterations: ${synthesis.decision}`);
        break;
      }

      // Check if both reviewers are positive (early stop)
      if (
        (review1.recommendation === 'Accept' ||
          review1.recommendation === 'Minor Revisions') &&
        (review2.recommendation === 'Accept' ||
          review2.recommendation === 'Minor Revisions')
      ) {
        console.log('Stopping iterations: Both reviewers positive');
        break;
      }
    } else {
      // Final iteration - no synthesis
      iterations.push(iteration);
    }
  }

  // ========================================================================
  // STEP 7: Generate final report
  // ========================================================================
  onProgress?.('complete', iterations.length, 95, 'Generating final report...');

  const report = generateFinalReport(
    articleTitle,
    journalName,
    iterations,
    startTime
  );

  onProgress?.('complete', iterations.length, 100, 'Review complete!');

  console.log(`\n✓ Review complete in ${report.totalIterations} iteration(s)`);
  console.log(`  Final recommendation: ${report.finalRecommendation}`);
  console.log(`  Processing time: ${Date.now() - startTime}ms`);

  return report;
}

/**
 * Creates a report for desk-rejected articles
 */
function createDeskRejectReport(
  articleTitle: string,
  journalName: string,
  editorialAssessment: any,
  startTime: number
): ReviewReport {
  return {
    articleTitle,
    targetJournal: journalName,
    reviewDate: new Date(),
    totalIterations: 0,
    finalRecommendation: 'Reject',
    finalRationale: `This article was desk rejected by the Editor. ${editorialAssessment.rationale}`,
    iterations: [],
    priorityRecommendations: [
      'Article does not meet journal criteria - consider alternative journals',
      'Review editorial feedback and revise substantially before resubmission',
    ],
    strengthsToPreserve: [],
    criticalIssuesToAddress: ['See editorial rationale for specific concerns'],
    suggestedNextSteps: [
      'Review journal scope and ensure alignment',
      'Consider feedback from editorial assessment',
      'Identify more appropriate target journals',
    ],
    trajectoryAnalysis: {
      overallConvergence: 'Article was not sent for peer review.',
    },
  };
}

/**
 * Generates the final comprehensive report
 */
function generateFinalReport(
  articleTitle: string,
  journalName: string,
  iterations: ReviewIteration[],
  startTime: number
): ReviewReport {
  const lastIteration = iterations[iterations.length - 1];
  const lastReviews = lastIteration.reviews;

  // Determine final recommendation based on last iteration
  const finalRecommendation = determineFinalRecommendation(lastReviews);

  // Extract all recommendations
  const allRecommendations = extractAllRecommendations(iterations);

  // Generate trajectory analysis
  const trajectoryAnalysis = analyzeTrajectory(iterations);

  // Compile final recommendations
  const priorityRecommendations = compilePriorityRecommendations(iterations);

  // Extract strengths and critical issues
  const { strengths, criticalIssues } = extractStrengthsAndIssues(iterations);

  // Generate next steps
  const suggestedNextSteps = generateNextSteps(finalRecommendation, iterations);

  return {
    articleTitle,
    targetJournal: journalName,
    reviewDate: new Date(),
    totalIterations: iterations.length,
    finalRecommendation,
    finalRationale: generateFinalRationale(
      finalRecommendation,
      iterations,
      trajectoryAnalysis
    ),
    iterations,
    priorityRecommendations,
    strengthsToPreserve: strengths,
    criticalIssuesToAddress: criticalIssues,
    suggestedNextSteps,
    trajectoryAnalysis,
  };
}

/**
 * Determines final recommendation from last reviews
 */
function determineFinalRecommendation(
  reviews: [PeerReview, PeerReview]
): ReviewRecommendation {
  const [review1, review2] = reviews;

  // Map to scores for averaging
  const scoreMap: Record<ReviewRecommendation, number> = {
    Accept: 4,
    'Minor Revisions': 3,
    'Major Revisions': 2,
    Reject: 1,
  };

  const avgScore =
    (scoreMap[review1.recommendation] + scoreMap[review2.recommendation]) / 2;

  // Convert back to recommendation
  if (avgScore >= 3.5) return 'Accept';
  if (avgScore >= 2.5) return 'Minor Revisions';
  if (avgScore >= 1.5) return 'Major Revisions';
  return 'Reject';
}

/**
 * Extracts all recommendations across iterations
 */
function extractAllRecommendations(
  iterations: ReviewIteration[]
): ReviewRecommendation[] {
  return iterations.flatMap((iter) =>
    iter.reviews.map((r) => r.recommendation)
  );
}

/**
 * Analyzes improvement trajectory across iterations
 */
function analyzeTrajectory(iterations: ReviewIteration[]): TrajectoryAnalysis {
  const analysis: TrajectoryAnalysis = {
    overallConvergence: '',
  };

  if (iterations.length >= 2) {
    analysis.iteration1to2 = {
      improvements: iterations[1].synthesis?.simulatedRevisions || [],
      persistentIssues: iterations[1].synthesis?.criticalIssues || [],
    };
  }

  if (iterations.length >= 3) {
    analysis.iteration2to3 = {
      improvements: iterations[2].synthesis?.simulatedRevisions || [],
      persistentIssues: iterations[2].synthesis?.criticalIssues || [],
    };
  }

  // Overall convergence summary
  const lastSynthesis = iterations[iterations.length - 1]?.synthesis;
  if (lastSynthesis) {
    analysis.overallConvergence = lastSynthesis.convergence.progressSummary;
  } else {
    const lastReviews = iterations[iterations.length - 1].reviews;
    const positiveReviews = lastReviews.filter(
      (r) => r.recommendation === 'Accept' || r.recommendation === 'Minor Revisions'
    );
    analysis.overallConvergence =
      positiveReviews.length === 2
        ? 'Both reviewers recommend acceptance or minor revisions.'
        : positiveReviews.length === 1
          ? 'Mixed recommendations - some concerns remain.'
          : 'Significant revisions needed based on reviewer feedback.';
  }

  return analysis;
}

/**
 * Compiles priority recommendations from all iterations
 */
function compilePriorityRecommendations(
  iterations: ReviewIteration[]
): string[] {
  const recommendations = new Set<string>();

  // Add critical issues from all syntheses
  iterations.forEach((iter) => {
    iter.synthesis?.criticalIssues.forEach((issue) => recommendations.add(issue));
  });

  // Add top suggestions from last iteration
  const lastReviews = iterations[iterations.length - 1].reviews;
  lastReviews.forEach((review) => {
    review.suggestions.slice(0, 2).forEach((sug) => recommendations.add(sug));
  });

  return Array.from(recommendations).slice(0, 8);
}

/**
 * Extracts strengths and critical issues
 */
function extractStrengthsAndIssues(iterations: ReviewIteration[]): {
  strengths: string[];
  criticalIssues: string[];
} {
  const strengthsSet = new Set<string>();
  const issuesSet = new Set<string>();

  iterations.forEach((iter) => {
    iter.reviews.forEach((review) => {
      review.strengths.forEach((s) => strengthsSet.add(s));
      review.weaknesses.slice(0, 3).forEach((w) => issuesSet.add(w));
    });

    iter.synthesis?.criticalIssues.forEach((i) => issuesSet.add(i));
  });

  return {
    strengths: Array.from(strengthsSet).slice(0, 6),
    criticalIssues: Array.from(issuesSet).slice(0, 6),
  };
}

/**
 * Generates suggested next steps
 */
function generateNextSteps(
  recommendation: ReviewRecommendation,
  iterations: ReviewIteration[]
): string[] {
  const steps: string[] = [];

  switch (recommendation) {
    case 'Accept':
      steps.push('Prepare final manuscript for submission');
      steps.push('Address any minor suggestions from reviewers');
      steps.push('Ensure all formatting requirements are met');
      break;

    case 'Minor Revisions':
      steps.push('Address all reviewer comments systematically');
      steps.push('Prepare point-by-point response letter');
      steps.push('Revise and resubmit within suggested timeframe');
      break;

    case 'Major Revisions':
      steps.push('Conduct additional analyses as suggested');
      steps.push('Substantially revise methodology/interpretation sections');
      steps.push('Consider additional experiments or data collection');
      steps.push('Prepare detailed response addressing all major concerns');
      break;

    case 'Reject':
      steps.push('Carefully review all feedback');
      steps.push('Consider substantial restructuring of the work');
      steps.push('Identify alternative target journals');
      steps.push('Address fundamental methodological concerns before resubmission');
      break;
  }

  // Add specific suggestions from last iteration
  const lastReviews = iterations[iterations.length - 1].reviews;
  lastReviews.forEach((review) => {
    if (review.suggestions.length > 0) {
      steps.push(review.suggestions[0]);
    }
  });

  return steps.slice(0, 6);
}

/**
 * Generates final decision rationale
 */
function generateFinalRationale(
  recommendation: ReviewRecommendation,
  iterations: ReviewIteration[],
  trajectory: TrajectoryAnalysis
): string {
  const parts: string[] = [];

  parts.push(
    `After ${iterations.length} iteration(s) of peer review, the final recommendation is: **${recommendation}**.`
  );

  parts.push(trajectory.overallConvergence);

  const lastReviews = iterations[iterations.length - 1].reviews;
  const recommendations = lastReviews.map((r) => r.recommendation).join(' and ');
  parts.push(`Final reviewers recommended: ${recommendations}.`);

  return parts.join(' ');
}
