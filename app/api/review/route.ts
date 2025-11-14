/**
 * Review API Endpoint
 *
 * POST /api/review
 *
 * Handles peer review requests. Accepts a PDF file and journal name,
 * orchestrates the complete review process, and returns the final report.
 *
 * This is the main entry point for the review system.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ReviewRequest, ReviewResponse } from '@/types';
import { orchestrateReview } from '@/lib/orchestrator';

/**
 * Maximum file size: 10MB
 * PDFs larger than this will be rejected
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST handler for review requests
 *
 * Expected body format:
 * ```json
 * {
 *   "pdfBase64": "base64-encoded PDF data",
 *   "filename": "article.pdf",
 *   "journalName": "Nature"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: ReviewRequest = await request.json();

    // Validate request
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        } as ReviewResponse,
        { status: 400 }
      );
    }

    const { pdfBase64, articleText, filename, journalName } = body;

    // Check file size (only for PDF uploads)
    if (pdfBase64) {
      const estimatedSize = (pdfBase64.length * 3) / 4; // Base64 to bytes
      if (estimatedSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          } as ReviewResponse,
          { status: 413 }
        );
      }
    }

    // Log request
    console.log('\n=================================================');
    console.log('NEW REVIEW REQUEST');
    console.log('=================================================');
    console.log(`Input Type: ${articleText ? 'Plain Text' : 'PDF'}`);
    console.log(`File: ${filename}`);
    console.log(`Journal: ${journalName}`);
    if (pdfBase64) {
      const estimatedSize = (pdfBase64.length * 3) / 4;
      console.log(`Size: ${(estimatedSize / 1024).toFixed(2)} KB`);
    } else {
      console.log(`Text Length: ${articleText.length} characters`);
    }
    console.log('=================================================\n');

    // Orchestrate the review process
    const report = await orchestrateReview(
      pdfBase64 || articleText, // Pass either PDF or text
      filename,
      journalName,
      // Progress callback - can be extended to support streaming updates
      (stage, iteration, percentage, message) => {
        console.log(
          `[${percentage}%] Iteration ${iteration} - ${stage}: ${message}`
        );
      },
      !pdfBase64 // isPlainText flag
    );

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    console.log('\n=================================================');
    console.log('REVIEW COMPLETED');
    console.log('=================================================');
    console.log(`Processing time: ${(processingTime / 1000).toFixed(2)}s`);
    console.log(`Iterations: ${report.totalIterations}`);
    console.log(`Final recommendation: ${report.finalRecommendation}`);
    console.log('=================================================\n');

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        report,
        processingTime,
      } as ReviewResponse,
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Log error
    console.error('\n=================================================');
    console.error('REVIEW ERROR');
    console.error('=================================================');
    console.error(error);
    console.error('=================================================\n');

    // Determine error message and status code
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    let statusCode = 500;

    // Specific error handling
    if (errorMessage.includes('API key')) {
      statusCode = 503; // Service Unavailable
    } else if (errorMessage.includes('PDF')) {
      statusCode = 400; // Bad Request
    } else if (errorMessage.includes('timeout')) {
      statusCode = 504; // Gateway Timeout
    }

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ReviewResponse,
      { status: statusCode }
    );
  }
}

/**
 * Validates the review request
 *
 * @param body - Request body to validate
 * @returns Error message if invalid, null if valid
 */
function validateRequest(body: any): string | null {
  if (!body) {
    return 'Request body is required';
  }

  // Must have either pdfBase64 or articleText
  if (!body.pdfBase64 && !body.articleText) {
    return 'Either pdfBase64 or articleText field is required';
  }

  // Validate pdfBase64 if provided
  if (body.pdfBase64 && typeof body.pdfBase64 !== 'string') {
    return 'pdfBase64 must be a string';
  }

  // Validate articleText if provided
  if (body.articleText && typeof body.articleText !== 'string') {
    return 'articleText must be a string';
  }

  // Validate text length
  if (body.articleText && body.articleText.length < 100) {
    return 'Article text must be at least 100 characters';
  }

  if (!body.filename || typeof body.filename !== 'string') {
    return 'filename field is required and must be a string';
  }

  if (!body.journalName || typeof body.journalName !== 'string') {
    return 'journalName field is required and must be a string';
  }

  // Validate journal name length
  if (body.journalName.length < 2 || body.journalName.length > 100) {
    return 'Journal name must be between 2 and 100 characters';
  }

  return null;
}

/**
 * GET handler - returns API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      name: 'Automated Peer Review API',
      version: '1.0.0',
      description:
        'AI-powered peer review system using Claude API to simulate academic peer review',
      endpoints: {
        'POST /api/review': {
          description: 'Submit an article for peer review',
          body: {
            pdfBase64: 'Base64-encoded PDF data (required)',
            filename: 'Original filename (required)',
            journalName: 'Target journal name (required)',
          },
          response: {
            success: 'Boolean indicating success',
            report: 'Complete ReviewReport object (if successful)',
            error: 'Error message (if failed)',
            processingTime: 'Processing time in milliseconds',
          },
        },
      },
      limits: {
        maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
        maxIterations: 3,
        timeout: '10 minutes',
      },
    },
    { status: 200 }
  );
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
