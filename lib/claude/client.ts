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
 * Maximum article length (in characters) to avoid rate limits
 * ~3000 words = ~4500 tokens (safe for 10k/min limit)
 */
const MAX_ARTICLE_LENGTH = 15000;

/**
 * Delay between API calls (in ms) to avoid rate limits
 */
const API_CALL_DELAY = 1500; // 1.5 seconds

/**
 * Truncates article text if it's too long
 */
function truncateArticle(text: string): string {
  if (text.length <= MAX_ARTICLE_LENGTH) {
    return text;
  }

  console.warn(`Article truncated from ${text.length} to ${MAX_ARTICLE_LENGTH} characters to avoid rate limits`);
  return text.substring(0, MAX_ARTICLE_LENGTH) + '\n\n[Article truncated due to length...]';
}

/**
 * Delays execution to avoid rate limits
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Add delay before API call to avoid rate limits
      if (retryCount > 0) {
        const backoffDelay = API_CALL_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retry ${retryCount}: Waiting ${backoffDelay}ms before retry...`);
        await delay(backoffDelay);
      } else {
        await delay(API_CALL_DELAY);
      }

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
    } catch (error: any) {
      console.error('Claude API error:', error);

      // Check if it's a rate limit error
      if (error?.status === 429 || error?.error?.type === 'rate_limit_error') {
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Rate limit hit. Retrying (${retryCount}/${maxRetries})...`);
          continue;
        }
      }

      throw new Error(
        `Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  throw new Error('Max retries exceeded for Claude API call');
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
  // Truncate article to avoid rate limits
  const truncatedArticle = truncateArticle(articleText);

  const prompt = getEditorPrompt(truncatedArticle, journalName, journalCriteria);

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
  // Truncate article to avoid rate limits
  const truncatedArticle = truncateArticle(articleText);

  const prompt = getReviewerPrompt(specialty, truncatedArticle);

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
  // Truncate article to avoid rate limits
  const truncatedArticle = truncateArticle(articleText);

  const review1Text = JSON.stringify(review1, null, 2);
  const review2Text = JSON.stringify(review2, null, 2);

  const prompt = getSynthesisPrompt(
    truncatedArticle,
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
