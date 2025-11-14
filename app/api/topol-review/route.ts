/**
 * Eric Topol Medical Review API Endpoint
 *
 * POST /api/topol-review
 *
 * Simplified peer review workflow:
 * 1. Dr. Eric Topol reviews Abstract and Methods
 * 2. If accepted, two specialist reviewers conduct parallel review
 * 3. Returns comprehensive report in both JSON and Markdown formats
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  getEricTopolPrompt,
  getMedicalReviewerPrompt,
  extractAbstract,
  extractMethods,
  generateMarkdownReport,
} from '@/lib/claude/topol-prompts';
import { resetTokenUsage, getTokenUsage, checkTokenLimit } from '@/lib/claude/client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const MAX_TOKENS = 4096;

interface TopolReviewRequest {
  articleText: string;
  filename: string;
}

interface EditorDecision {
  decision: 'Accept for Review' | 'Desk Reject';
  rationale: string;
  reviewers: Array<{
    specialty: string;
    rationale: string;
  }>;
  guidanceForReviewers: string;
}

interface ReviewerFeedback {
  recommendation: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  methodologicalConcerns: string[];
  questionsForAuthors: string[];
  recommendations: string[];
  confidentialCommentsToEditor?: string;
  specialty?: string;
}

/**
 * Calls Claude API and tracks token usage
 */
async function callClaude(systemPrompt: string): Promise<string> {
  checkTokenLimit();

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: 'Please provide your assessment in the specified JSON format.',
      },
    ],
    system: systemPrompt,
  });

  console.log(
    `[Token Usage] Input: ${message.usage.input_tokens}, Output: ${message.usage.output_tokens}, Total: ${getTokenUsage()}`
  );

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return textContent.text;
}

/**
 * Parses JSON from Claude response
 */
function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract from markdown code block
    const match =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/```\s*([\s\S]*?)\s*```/);

    if (match) {
      return JSON.parse(match[1]) as T;
    }

    // Try to find JSON object
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1)) as T;
    }

    throw new Error('Could not parse JSON from response');
  }
}

/**
 * POST handler for Eric Topol review requests
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  resetTokenUsage();

  try {
    const body: TopolReviewRequest = await request.json();

    // Validate request
    if (!body.articleText || typeof body.articleText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'articleText is required' },
        { status: 400 }
      );
    }

    if (body.articleText.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article text must be at least 100 characters',
        },
        { status: 400 }
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('NEW ERIC TOPOL REVIEW REQUEST');
    console.log('='.repeat(60));
    console.log(`File: ${body.filename}`);
    console.log(`Text Length: ${body.articleText.length} characters`);
    console.log('='.repeat(60) + '\n');

    // Extract abstract and methods
    const abstractText = extractAbstract(body.articleText);
    const methodsText = extractMethods(body.articleText);

    console.log(`Abstract Length: ${abstractText.length} characters`);
    console.log(`Methods Length: ${methodsText.length} characters\n`);

    // STEP 1: Editorial Assessment by Dr. Eric Topol
    console.log('[Step 1/3] Dr. Eric Topol reviewing Abstract and Methods...');
    const editorPrompt = getEricTopolPrompt(abstractText, methodsText);
    const editorResponse = await callClaude(editorPrompt);
    const editorDecision = parseJSON<EditorDecision>(editorResponse);

    console.log(`Editor Decision: ${editorDecision.decision}\n`);

    // If desk rejected, return early
    if (editorDecision.decision === 'Desk Reject') {
      const report = {
        articleTitle: body.filename.replace(/\.(txt|md)$/, ''),
        reviewDate: new Date().toISOString(),
        editorDecision,
        reviews: [],
        markdownReport: generateMarkdownReport(
          editorDecision,
          null as any,
          null as any,
          body.filename.replace(/\.(txt|md)$/, '')
        ),
      };

      console.log('='.repeat(60));
      console.log('REVIEW COMPLETED (Desk Rejected)');
      console.log(`Processing Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
      console.log(`Total Tokens: ${getTokenUsage()}`);
      console.log('='.repeat(60) + '\n');

      return NextResponse.json({
        success: true,
        report,
        processingTime: Date.now() - startTime,
        tokensUsed: getTokenUsage(),
      });
    }

    // STEP 2: Parallel Reviewer Assessment
    console.log('[Step 2/3] Two specialist reviewers conducting parallel review...');

    const reviewer1Specialty = editorDecision.reviewers[0].specialty;
    const reviewer2Specialty = editorDecision.reviewers[1].specialty;

    console.log(`Reviewer 1: ${reviewer1Specialty}`);
    console.log(`Reviewer 2: ${reviewer2Specialty}\n`);

    // Call reviewers in parallel
    const [review1Response, review2Response] = await Promise.all([
      callClaude(
        getMedicalReviewerPrompt(
          reviewer1Specialty,
          abstractText,
          methodsText,
          editorDecision.guidanceForReviewers
        )
      ),
      callClaude(
        getMedicalReviewerPrompt(
          reviewer2Specialty,
          abstractText,
          methodsText,
          editorDecision.guidanceForReviewers
        )
      ),
    ]);

    const review1 = parseJSON<ReviewerFeedback>(review1Response);
    const review2 = parseJSON<ReviewerFeedback>(review2Response);

    // Add specialty to reviews
    review1.specialty = reviewer1Specialty;
    review2.specialty = reviewer2Specialty;

    console.log(`Reviewer 1 Recommendation: ${review1.recommendation}`);
    console.log(`Reviewer 2 Recommendation: ${review2.recommendation}\n`);

    // STEP 3: Generate Final Report
    console.log('[Step 3/3] Generating final report...');

    const markdownReport = generateMarkdownReport(
      editorDecision,
      review1,
      review2,
      body.filename.replace(/\.(txt|md)$/, '')
    );

    const report = {
      articleTitle: body.filename.replace(/\.(txt|md)$/, ''),
      reviewDate: new Date().toISOString(),
      editorDecision,
      reviews: [review1, review2],
      markdownReport,
    };

    console.log('\n' + '='.repeat(60));
    console.log('REVIEW COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`Processing Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`Total Tokens Used: ${getTokenUsage()}`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      report,
      processingTime: Date.now() - startTime,
      tokensUsed: getTokenUsage(),
    });
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('REVIEW ERROR');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60) + '\n');

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    let statusCode = 500;
    if (errorMessage.includes('API key')) {
      statusCode = 503;
    } else if (errorMessage.includes('Token limit')) {
      statusCode = 429;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * GET handler - API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Eric Topol Medical Peer Review API',
    version: '1.0.0',
    description:
      'Specialized medical manuscript review system led by Dr. Eric Topol',
    endpoints: {
      'POST /api/topol-review': {
        description: 'Submit medical manuscript for peer review',
        body: {
          articleText: 'Plain text of the medical manuscript (required)',
          filename: 'Original filename (required)',
        },
        response: {
          success: 'Boolean indicating success',
          report: 'Complete review report with editor decision and reviewer feedback',
          markdownReport: 'Downloadable markdown version of the report',
          processingTime: 'Processing time in milliseconds',
          tokensUsed: 'Total API tokens consumed',
        },
      },
    },
    features: {
      editor: 'Dr. Eric Topol - Medical editorial expert',
      focus: 'Abstract and Methods sections only',
      reviewers: 'Two medical specialists selected based on manuscript topic',
      duration: '1-2 minutes typical',
      tokenLimit: '100,000 tokens per request',
    },
  });
}
