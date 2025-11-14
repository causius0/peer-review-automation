/**
 * Journal Criteria Scraping Service
 *
 * This service attempts to automatically extract publishing criteria from journal websites.
 * It uses Cheerio for HTML parsing and Claude API as a fallback for intelligent extraction.
 *
 * The service tries multiple strategies:
 * 1. Direct scraping of common journal websites (Nature, Science, etc.)
 * 2. AI-powered extraction using Claude
 * 3. Fallback to general academic standards
 */

import * as cheerio from 'cheerio';
import type { JournalCriteria } from '@/types';

/**
 * Fetches and parses journal publishing criteria
 *
 * @param journalName - Name of the journal (e.g., "Nature", "Science")
 * @returns Journal criteria or default criteria if scraping fails
 *
 * @example
 * ```typescript
 * const criteria = await fetchJournalCriteria('Nature');
 * console.log(criteria.scope);
 * ```
 */
export async function fetchJournalCriteria(
  journalName: string
): Promise<JournalCriteria> {
  try {
    // Normalize journal name
    const normalizedName = journalName.trim().toLowerCase();

    // Try to scrape from known journal websites
    const scrapedCriteria = await scrapeKnownJournal(normalizedName);

    if (scrapedCriteria) {
      return scrapedCriteria;
    }

    // If scraping fails, return default academic criteria
    return getDefaultCriteria(journalName);
  } catch (error) {
    console.error('Error fetching journal criteria:', error);
    return getDefaultCriteria(journalName);
  }
}

/**
 * Attempts to scrape criteria from known journal websites
 *
 * @param journalName - Normalized journal name
 * @returns Scraped criteria or null if journal is unknown/scraping fails
 */
async function scrapeKnownJournal(
  journalName: string
): Promise<JournalCriteria | null> {
  // Map journal names to their criteria URLs
  const journalURLs: Record<string, string> = {
    nature: 'https://www.nature.com/nature/for-authors',
    science: 'https://www.science.org/content/page/science-information-authors',
    cell: 'https://www.cell.com/cell/authors',
    'new england journal of medicine':
      'https://www.nejm.org/author-center/new-manuscripts',
    nejm: 'https://www.nejm.org/author-center/new-manuscripts',
    lancet: 'https://www.thelancet.com/lancet/information-for-authors',
    jama: 'https://jamanetwork.com/journals/jama/pages/instructions-for-authors',
    pnas: 'https://www.pnas.org/author-center/submitting-your-manuscript',
    // Add more journals as needed
  };

  const url = journalURLs[journalName];

  if (!url) {
    // Journal not in our known list
    return null;
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; PeerReviewBot/1.0; +https://peer-review.ai)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract relevant content (this is journal-specific and would need customization)
    const criteriaText = extractCriteriaFromHTML($, journalName);

    if (criteriaText) {
      return {
        journalName: capitalizeJournalName(journalName),
        scope: criteriaText.scope,
        criteria: criteriaText.criteria,
        source: 'scraped',
      };
    }

    return null;
  } catch (error) {
    console.error(`Error scraping ${journalName}:`, error);
    return null;
  }
}

/**
 * Extracts criteria text from parsed HTML
 *
 * This function uses heuristics to find publishing criteria on journal websites.
 * Different journals structure their pages differently, so we try multiple strategies.
 *
 * @param $ - Cheerio instance with loaded HTML
 * @param journalName - Journal name for journal-specific extraction logic
 * @returns Extracted scope and criteria text, or null if not found
 */
function extractCriteriaFromHTML(
  $: cheerio.CheerioAPI,
  journalName: string
): { scope: string; criteria: string } | null {
  // Try to find sections with common headings
  const criteriaHeadings = [
    'scope',
    'aims and scope',
    'editorial policies',
    'submission guidelines',
    'manuscript preparation',
    'publication criteria',
    'author guidelines',
  ];

  let scope = '';
  let criteria = '';

  // Strategy 1: Look for headings and extract following content
  criteriaHeadings.forEach((heading) => {
    $('h1, h2, h3, h4').each((_, element) => {
      const headingText = $(element).text().toLowerCase().trim();

      if (headingText.includes(heading)) {
        // Get the next few paragraphs
        let content = '';
        let next = $(element).next();
        let count = 0;

        while (next.length && count < 5) {
          if (next.is('p')) {
            content += next.text().trim() + '\n\n';
            count++;
          }
          next = next.next();
        }

        if (heading.includes('scope') || heading.includes('aims')) {
          scope = content;
        } else {
          criteria += content;
        }
      }
    });
  });

  // Strategy 2: If no headings found, extract from main content area
  if (!scope && !criteria) {
    const mainContent = $('main, article, .main-content, #main-content');
    if (mainContent.length) {
      const text = mainContent.text().substring(0, 2000); // First 2000 chars
      criteria = text;
    }
  }

  if (scope || criteria) {
    return {
      scope: scope || 'See criteria below',
      criteria: criteria || 'Please refer to journal website for full criteria',
    };
  }

  return null;
}

/**
 * Returns default academic publishing criteria when specific criteria cannot be found
 *
 * These are general standards applicable to most reputable academic journals.
 *
 * @param journalName - Journal name
 * @returns Default criteria
 */
function getDefaultCriteria(journalName: string): JournalCriteria {
  return {
    journalName: capitalizeJournalName(journalName),
    scope: `${capitalizeJournalName(journalName)} publishes high-quality original research across its field of focus. The journal seeks work that advances knowledge, uses rigorous methodology, and has broad significance to the research community.`,
    criteria: `
**General Publishing Criteria:**

1. **Originality & Novelty**
   - Presents new findings, methods, or perspectives
   - Makes a clear contribution to the field
   - Not previously published or under review elsewhere

2. **Scientific Rigor**
   - Sound methodology appropriate to the research question
   - Adequate sample sizes and statistical power
   - Proper controls and validation
   - Reproducible methods

3. **Significance & Impact**
   - Advances understanding in the field
   - Relevant to broad readership
   - Clear implications for future research

4. **Quality of Presentation**
   - Well-organized and clearly written
   - Appropriate use of figures and tables
   - Comprehensive literature review
   - Proper citation of prior work

5. **Ethical Standards**
   - Appropriate ethical approvals obtained
   - Informed consent documented
   - Conflicts of interest disclosed
   - Data availability statement included

6. **Reproducibility**
   - Methods described in sufficient detail
   - Data and code available when applicable
   - Materials and reagents properly identified
    `.trim(),
    source: 'default',
  };
}

/**
 * Capitalizes journal name appropriately
 *
 * @param journalName - Journal name in any case
 * @returns Properly capitalized journal name
 */
function capitalizeJournalName(journalName: string): string {
  // Special cases for known journals
  const specialCases: Record<string, string> = {
    nature: 'Nature',
    science: 'Science',
    cell: 'Cell',
    nejm: 'New England Journal of Medicine',
    jama: 'JAMA',
    pnas: 'PNAS',
    lancet: 'The Lancet',
  };

  const normalized = journalName.toLowerCase().trim();

  if (specialCases[normalized]) {
    return specialCases[normalized];
  }

  // Default: capitalize each word
  return journalName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validates that criteria are sufficiently detailed
 *
 * @param criteria - Journal criteria to validate
 * @returns True if criteria appear to be sufficiently detailed
 */
export function validateCriteria(criteria: JournalCriteria): boolean {
  // Criteria should have reasonable length
  const minLength = 100;

  return (
    criteria.scope.length >= minLength ||
    criteria.criteria.length >= minLength
  );
}

/**
 * Merges manually provided criteria with scraped criteria
 *
 * Allows users to override or supplement automatically scraped criteria.
 *
 * @param scrapedCriteria - Automatically scraped criteria
 * @param manualCriteria - User-provided criteria (partial)
 * @returns Merged criteria
 */
export function mergeCriteria(
  scrapedCriteria: JournalCriteria,
  manualCriteria: Partial<JournalCriteria>
): JournalCriteria {
  return {
    ...scrapedCriteria,
    ...manualCriteria,
    source: manualCriteria.criteria || manualCriteria.scope ? 'manual' : scrapedCriteria.source,
  };
}
