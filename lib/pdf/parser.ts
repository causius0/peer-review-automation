/**
 * PDF Processing Service
 *
 * This service handles PDF file processing and text extraction.
 * It converts uploaded PDF files into plain text that can be analyzed by AI reviewers.
 *
 * Uses pdf-parse library for robust PDF text extraction.
 */

/**
 * Result from PDF text extraction
 */
export interface PDFExtractionResult {
  /** Extracted plain text from the PDF */
  text: string;

  /** Number of pages in the PDF */
  pageCount: number;

  /** PDF metadata if available */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
  };
}

/**
 * Extracts text content from a PDF file
 *
 * @param pdfBuffer - Buffer containing the PDF file data
 * @returns Extracted text and metadata
 * @throws Error if PDF parsing fails
 *
 * @example
 * ```typescript
 * const buffer = await readFile('article.pdf');
 * const result = await extractTextFromPDF(buffer);
 * console.log(result.text);
 * ```
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    // Try different ways to import and use pdf-parse
    let data;

    try {
      // Method 1: Try as default function (common pattern)
      const pdfParse = (await import('pdf-parse')).default;
      if (typeof pdfParse === 'function') {
        data = await pdfParse(pdfBuffer);
      } else {
        throw new Error('Default export is not a function');
      }
    } catch (e1) {
      try {
        // Method 2: Try the PDFParse static method
        const { PDFParse } = await import('pdf-parse');
        // @ts-ignore
        if (PDFParse && typeof PDFParse.parse === 'function') {
          // @ts-ignore
          data = await PDFParse.parse(pdfBuffer);
        } else {
          throw new Error('PDFParse.parse is not a function');
        }
      } catch (e2) {
        // Method 3: Try direct module export as function
        const pdfParseModule = await import('pdf-parse');
        // @ts-ignore
        if (typeof pdfParseModule === 'function') {
          // @ts-ignore
          data = await pdfParseModule(pdfBuffer);
        } else {
          throw new Error(`Cannot find working pdf-parse method. Error 1: ${e1}, Error 2: ${e2}`);
        }
      }
    }

    // Extract and clean the text
    const cleanedText = cleanExtractedText(data.text);

    // Build result object
    const result: PDFExtractionResult = {
      text: cleanedText,
      pageCount: data.numpages,
      metadata: data.info
        ? {
            title: data.info.Title,
            author: data.info.Author,
            subject: data.info.Subject,
            keywords: data.info.Keywords,
            creator: data.info.Creator,
            producer: data.info.Producer,
            creationDate: data.info.CreationDate,
          }
        : undefined,
    };

    return result;
  } catch (error) {
    // Provide detailed error message for debugging
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

/**
 * Cleans extracted text by removing excessive whitespace and formatting artifacts
 *
 * PDF extraction often includes formatting artifacts, excessive newlines,
 * and irregular spacing. This function normalizes the text for better AI processing.
 *
 * @param text - Raw extracted text from PDF
 * @returns Cleaned text
 */
function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace before punctuation
      .replace(/\s+([.,!?;:])/g, '$1')
      // Normalize paragraph breaks (2+ newlines become exactly 2)
      .replace(/\n{3,}/g, '\n\n')
      // Trim leading/trailing whitespace
      .trim()
  );
}

/**
 * Converts a base64-encoded PDF string to a Buffer
 *
 * @param base64String - Base64-encoded PDF data
 * @returns Buffer containing the PDF data
 *
 * @example
 * ```typescript
 * const pdfBuffer = base64ToBuffer(request.pdfBase64);
 * ```
 */
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
  const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');

  // Convert base64 to buffer
  return Buffer.from(base64Data, 'base64');
}

/**
 * Validates that a buffer contains valid PDF data
 *
 * Checks for the PDF magic number (%PDF-) at the start of the file.
 *
 * @param buffer - Buffer to validate
 * @returns True if buffer appears to be a valid PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  // PDF files start with %PDF- (magic number)
  const pdfMagicNumber = Buffer.from('%PDF-');

  // Check if buffer starts with PDF magic number
  return buffer.subarray(0, 5).equals(pdfMagicNumber);
}

/**
 * Extracts text from a base64-encoded PDF string
 *
 * Convenience function that combines base64 conversion and text extraction.
 *
 * @param base64String - Base64-encoded PDF data
 * @returns Extracted text and metadata
 * @throws Error if PDF is invalid or extraction fails
 *
 * @example
 * ```typescript
 * const result = await extractTextFromBase64PDF(pdfBase64);
 * console.log(`Extracted ${result.pageCount} pages`);
 * ```
 */
export async function extractTextFromBase64PDF(
  base64String: string
): Promise<PDFExtractionResult> {
  // Convert base64 to buffer
  const pdfBuffer = base64ToBuffer(base64String);

  // Validate PDF format
  if (!isValidPDF(pdfBuffer)) {
    throw new Error(
      'Invalid PDF file: File does not appear to be a valid PDF document'
    );
  }

  // Extract text
  return extractTextFromPDF(pdfBuffer);
}

/**
 * Estimates reading time for extracted text
 *
 * Useful for providing users with an estimate of review processing time.
 * Assumes average reading speed of 200 words per minute.
 *
 * @param text - Extracted text
 * @returns Estimated reading time in minutes
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extracts the title from PDF text
 *
 * Attempts to identify the article title from the beginning of the text.
 * Uses heuristics to find the most likely title.
 *
 * @param text - Extracted PDF text
 * @returns Likely article title or "Untitled" if not found
 */
export function extractTitle(text: string): string {
  // Get first 500 characters
  const beginning = text.substring(0, 500);

  // Split into lines
  const lines = beginning.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return 'Untitled';
  }

  // Look for a title-like line (typically the first substantial line)
  // Title is usually not too short and not too long
  for (const line of lines) {
    const trimmed = line.trim();
    const wordCount = trimmed.split(/\s+/).length;

    // Title typically has 3-20 words
    if (wordCount >= 3 && wordCount <= 20) {
      return trimmed;
    }
  }

  // Fallback to first line
  return lines[0].trim();
}
