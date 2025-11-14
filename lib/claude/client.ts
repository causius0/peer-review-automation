/**
 * Claude API Client
 *
 * This service handles all interactions with the Anthropic Claude API.
 * It provides methods for calling The Editor and Reviewers with appropriate prompts.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  EditorialAssessment,
  PeerReview,
  IterationSynthesis,
  Specialty,
  FieldClassification,
  SelectedReviewer,
} from '@/types';
import {
  getEditorPrompt,
  getReviewerPrompt,
  getSynthesisPrompt,
} from './prompts';

/**
 * Initialize Anthropic client
 * API key must be set in environment variables
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Claude model to use for API calls
 * Haiku 4.5 provides excellent quality/cost balance (Oct 2025 release)
 * Can be overridden via environment variable
 */
const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

/**
 * Maximum tokens for Claude responses
 * Increased for detailed reviews
 */
const MAX_TOKENS = 4096;

/**
 * Calls Claude API with a system prompt and returns the response
 *
 * @param systemPrompt - The system prompt for Claude
 * @param temperature - Sampling temperature (0-1), lower is more deterministic
 * @returns Claude's response text
 * @throws Error if API call fails
 */
async function callClaude(
  systemPrompt: string,
  temperature: number = 0.3
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      temperature,
      messages: [
        {
          role: 'user',
          content: 'Please provide your assessment in the specified JSON format.',
        },
      ],
      system: systemPrompt,
    });

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(
      `Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parses JSON from Claude's response, handling potential formatting issues
 *
 * Claude sometimes includes markdown code blocks or extra text.
 * This function extracts and parses the JSON robustly.
 *
 * @param responseText - Raw response from Claude
 * @returns Parsed JSON object
 * @throws Error if JSON cannot be parsed
 */
function parseClaudeJSON<T>(responseText: string): T {
  try {
    // Try direct parse first
    return JSON.parse(responseText) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch =
      responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/```\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }

    // Try to find JSON object boundaries
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString) as T;
    }

    throw new Error('Could not extract valid JSON from response');
  }
}

// ============================================================================
// EDITORIAL ASSESSMENT
// ============================================================================

/**
 * Editorial assessment response from Claude
 */
interface EditorResponse {
  decision: 'Accept for Review' | 'Desk Reject';
  rationale: string;
  primaryField: string;
  subSpecialty: string;
  keywords: string[];
  reviewer1: {
    specialty: string;
    rationale: string;
  };
  reviewer2: {
    specialty: string;
    rationale: string;
  };
  editorialGuidance: string;
}

/**
 * Calls The Editor (Dr. Marcia Chen) to assess an article
 *
 * @param articleText - Full text of the article
 * @param journalName - Target journal name
 * @param journalCriteria - Publishing criteria for the journal
 * @returns Editorial assessment
 */
export async function getEditorialAssessment(
  articleText: string,
  journalName: string,
  journalCriteria: string
): Promise<EditorialAssessment> {
  const prompt = getEditorPrompt(articleText, journalName, journalCriteria);

  const response = await callClaude(prompt, 0.3);

  const parsed = parseClaudeJSON<EditorResponse>(response);

  // Convert to our type
  const assessment: EditorialAssessment = {
    decision: parsed.decision,
    rationale: parsed.rationale,
    classification: {
      primaryField: parsed.primaryField as any,
      subSpecialty: parsed.subSpecialty as Specialty,
      keywords: parsed.keywords,
    },
    selectedReviewers: [
      {
        specialty: parsed.reviewer1.specialty as Specialty,
        rationale: parsed.reviewer1.rationale,
      },
      {
        specialty: parsed.reviewer2.specialty as Specialty,
        rationale: parsed.reviewer2.rationale,
      },
    ],
    editorialGuidance: parsed.editorialGuidance,
  };

  return assessment;
}

// ============================================================================
// PEER REVIEW
// ============================================================================

/**
 * Review response from Claude
 */
interface ReviewResponse {
  recommendation: 'Accept' | 'Minor Revisions' | 'Major Revisions' | 'Reject';
  confidence?: 'High' | 'Medium' | 'Low';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  detailedComments: {
    abstract?: string;
    introduction?: string;
    methodology?: string;
    results?: string;
    discussion?: string;
    conclusion?: string;
    references?: string;
  };
  questionsForAuthors: string[];
  suggestions: string[];
  additionalNotes?: string;
}

/**
 * Calls a specialist reviewer to review an article
 *
 * @param specialty - Reviewer's sub-specialty
 * @param articleText - Full text of the article
 * @returns Peer review
 */
export async function getPeerReview(
  specialty: Specialty,
  articleText: string
): Promise<PeerReview> {
  const prompt = getReviewerPrompt(specialty, articleText);

  const response = await callClaude(prompt, 0.4); // Slightly higher temp for varied feedback

  const parsed = parseClaudeJSON<ReviewResponse>(response);

  // Convert to our type
  const review: PeerReview = {
    reviewerSpecialty: specialty,
    recommendation: parsed.recommendation,
    confidence: parsed.confidence,
    summary: parsed.summary,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    detailedComments: parsed.detailedComments,
    questionsForAuthors: parsed.questionsForAuthors,
    suggestions: parsed.suggestions,
    additionalNotes: parsed.additionalNotes,
  };

  return review;
}

// ============================================================================
// ITERATION SYNTHESIS
// ============================================================================

/**
 * Synthesis response from Claude
 */
interface SynthesisResponse {
  consensus: string[];
  disagreements: string[];
  criticalIssues: string[];
  minorIssues: string[];
  convergence: {
    movingTowardAcceptance: boolean;
    shouldContinue: boolean;
    progressSummary: string;
  };
  simulatedRevisions: string[];
  nextIterationFocus: string[];
  decision: 'Continue' | 'Accept' | 'Reject';
}

/**
 * Calls The Editor to synthesize reviewer feedback
 *
 * @param articleText - Original article text
 * @param review1 - First reviewer's feedback (as JSON string)
 * @param review2 - Second reviewer's feedback (as JSON string)
 * @param iterationNumber - Current iteration (1, 2, or 3)
 * @returns Iteration synthesis
 */
export async function getIterationSynthesis(
  articleText: string,
  review1: PeerReview,
  review2: PeerReview,
  iterationNumber: number
): Promise<IterationSynthesis> {
  const review1Text = JSON.stringify(review1, null, 2);
  const review2Text = JSON.stringify(review2, null, 2);

  const prompt = getSynthesisPrompt(
    articleText,
    review1Text,
    review2Text,
    iterationNumber
  );

  const response = await callClaude(prompt, 0.3);

  const parsed = parseClaudeJSON<SynthesisResponse>(response);

  // Convert to our type
  const synthesis: IterationSynthesis = {
    iterationNumber,
    consensus: parsed.consensus,
    disagreements: parsed.disagreements,
    criticalIssues: parsed.criticalIssues,
    minorIssues: parsed.minorIssues,
    convergence: parsed.convergence,
    simulatedRevisions: parsed.simulatedRevisions,
    nextIterationFocus: parsed.nextIterationFocus,
    decision: parsed.decision,
  };

  return synthesis;
}

/**
 * Validates that the API key is configured
 *
 * @throws Error if API key is not set
 */
export function validateAPIKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file.'
    );
  }
}
