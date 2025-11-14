/**
 * Type Definitions for Automated Peer Review System
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and provide clear contracts between different parts of the system.
 */

// ============================================================================
// RESEARCH FIELDS & SPECIALTIES
// ============================================================================

/**
 * Primary research fields supported by the system
 */
export type ResearchField =
  | 'Medical Research'
  | 'Computer Science'
  | 'Social Sciences'
  | 'Natural Sciences'
  | 'Engineering';

/**
 * Medical Research sub-specialties (20 total)
 */
export type MedicalSpecialty =
  | 'Oncology'
  | 'Neurology & Neuroscience'
  | 'Cardiology & Cardiovascular Research'
  | 'Immunology & Infectious Diseases'
  | 'Endocrinology & Metabolism'
  | 'Gastroenterology'
  | 'Pulmonology & Respiratory Medicine'
  | 'Nephrology & Urology'
  | 'Hematology'
  | 'Psychiatry & Mental Health'
  | 'Pediatrics'
  | 'Geriatrics & Aging Research'
  | 'Genetics & Genomics'
  | 'Pharmacology & Drug Development'
  | 'Epidemiology & Public Health'
  | 'Medical Imaging & Radiology'
  | 'Surgery & Surgical Techniques'
  | 'Pathology'
  | 'Dermatology'
  | 'Ophthalmology';

/**
 * Computer Science sub-specialties (20 total)
 */
export type ComputerScienceSpecialty =
  | 'Artificial Intelligence & Machine Learning'
  | 'Natural Language Processing'
  | 'Computer Vision'
  | 'Robotics & Autonomous Systems'
  | 'Cybersecurity & Cryptography'
  | 'Distributed Systems & Cloud Computing'
  | 'Databases & Data Management'
  | 'Software Engineering & Programming Languages'
  | 'Human-Computer Interaction'
  | 'Computer Graphics & Visualization'
  | 'Networks & Communications'
  | 'Operating Systems'
  | 'Algorithms & Computational Complexity'
  | 'Quantum Computing'
  | 'Bioinformatics & Computational Biology'
  | 'High-Performance Computing'
  | 'Embedded Systems & IoT'
  | 'Blockchain & Distributed Ledgers'
  | 'Computer Architecture'
  | 'Information Retrieval & Search';

/**
 * Social Sciences sub-specialties (20 total)
 */
export type SocialScienceSpecialty =
  | 'Clinical Psychology'
  | 'Cognitive Psychology'
  | 'Developmental Psychology'
  | 'Social Psychology'
  | 'Sociology'
  | 'Microeconomics'
  | 'Macroeconomics'
  | 'Behavioral Economics'
  | 'Political Science & International Relations'
  | 'Cultural Anthropology'
  | 'Biological Anthropology'
  | 'Education & Pedagogy'
  | 'Linguistics'
  | 'Communication Studies'
  | 'Human Geography'
  | 'Criminology & Criminal Justice'
  | 'Social Work'
  | 'Gender Studies'
  | 'Urban Planning & Development'
  | 'Demography & Population Studies';

/**
 * Natural Sciences sub-specialties (20 total)
 */
export type NaturalScienceSpecialty =
  | 'Theoretical Physics'
  | 'Experimental & Particle Physics'
  | 'Condensed Matter Physics'
  | 'Astrophysics & Cosmology'
  | 'Organic Chemistry'
  | 'Inorganic Chemistry'
  | 'Physical Chemistry'
  | 'Analytical Chemistry'
  | 'Molecular Biology'
  | 'Cell Biology'
  | 'Ecology'
  | 'Evolutionary Biology'
  | 'Microbiology'
  | 'Botany & Plant Science'
  | 'Zoology & Animal Science'
  | 'Marine Biology & Oceanography'
  | 'Geology & Earth Sciences'
  | 'Atmospheric Science & Meteorology'
  | 'Environmental Science'
  | 'Astronomy';

/**
 * Engineering sub-specialties (20 total)
 */
export type EngineeringSpecialty =
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | 'Civil Engineering & Structures'
  | 'Chemical Engineering'
  | 'Aerospace Engineering'
  | 'Materials Science & Engineering'
  | 'Biomedical Engineering'
  | 'Environmental Engineering'
  | 'Industrial Engineering & Operations Research'
  | 'Nuclear Engineering'
  | 'Petroleum Engineering'
  | 'Manufacturing Engineering'
  | 'Robotics Engineering'
  | 'Nanotechnology & Nanomaterials'
  | 'Optical Engineering & Photonics'
  | 'Acoustical Engineering'
  | 'Agricultural Engineering'
  | 'Mining Engineering'
  | 'Systems Engineering'
  | 'Energy Engineering & Renewable Energy';

/**
 * Union type of all possible sub-specialties across all fields
 */
export type Specialty =
  | MedicalSpecialty
  | ComputerScienceSpecialty
  | SocialScienceSpecialty
  | NaturalScienceSpecialty
  | EngineeringSpecialty;

// ============================================================================
// REVIEW RECOMMENDATIONS
// ============================================================================

/**
 * Possible review recommendations following standard academic peer review outcomes
 */
export type ReviewRecommendation =
  | 'Accept'
  | 'Minor Revisions'
  | 'Major Revisions'
  | 'Reject';

/**
 * Editorial decision outcomes
 */
export type EditorialDecision = 'Accept for Review' | 'Desk Reject';

// ============================================================================
// EDITORIAL ASSESSMENT
// ============================================================================

/**
 * Reviewer selection with rationale
 */
export interface SelectedReviewer {
  /** Sub-specialty of the selected reviewer */
  specialty: Specialty;

  /** Explanation for why this reviewer was selected */
  rationale: string;
}

/**
 * Field classification result from The Editor
 */
export interface FieldClassification {
  /** Primary research field */
  primaryField: ResearchField;

  /** Specific sub-specialty within the field */
  subSpecialty: Specialty;

  /** Keywords extracted from the article */
  keywords: string[];
}

/**
 * Complete editorial assessment from The Editor
 */
export interface EditorialAssessment {
  /** Editorial decision (accept for review or desk reject) */
  decision: EditorialDecision;

  /** Detailed rationale for the decision */
  rationale: string;

  /** Field classification */
  classification: FieldClassification;

  /** Two selected reviewers */
  selectedReviewers: [SelectedReviewer, SelectedReviewer];

  /** Editorial guidance for reviewers */
  editorialGuidance: string;
}

// ============================================================================
// PEER REVIEW
// ============================================================================

/**
 * Detailed comments organized by manuscript section
 */
export interface SectionComments {
  abstract?: string;
  introduction?: string;
  methodology?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  references?: string;
}

/**
 * Complete peer review from a single reviewer
 */
export interface PeerReview {
  /** Reviewer's sub-specialty */
  reviewerSpecialty: Specialty;

  /** Overall recommendation */
  recommendation: ReviewRecommendation;

  /** Confidence level in the review (for Computer Science reviews) */
  confidence?: 'High' | 'Medium' | 'Low';

  /** Summary of the review (3-5 sentences) */
  summary: string;

  /** List of identified strengths */
  strengths: string[];

  /** List of identified weaknesses */
  weaknesses: string[];

  /** Detailed comments organized by section */
  detailedComments: SectionComments;

  /** Questions for the authors */
  questionsForAuthors: string[];

  /** Suggestions for improvement */
  suggestions: string[];

  /** Additional notes (ethics, data availability, conflicts, etc.) */
  additionalNotes?: string;
}

// ============================================================================
// ITERATION & SYNTHESIS
// ============================================================================

/**
 * Convergence assessment between review iterations
 */
export interface ConvergenceAssessment {
  /** Are reviewers moving toward consensus? */
  movingTowardAcceptance: boolean;

  /** Is another iteration worthwhile? */
  shouldContinue: boolean;

  /** Summary of progress */
  progressSummary: string;
}

/**
 * Editor's synthesis between review iterations
 */
export interface IterationSynthesis {
  /** Current iteration number (1, 2, or 3) */
  iterationNumber: number;

  /** Areas where reviewers agree */
  consensus: string[];

  /** Areas where reviewers disagree */
  disagreements: string[];

  /** Critical issues identified */
  criticalIssues: string[];

  /** Minor issues identified */
  minorIssues: string[];

  /** Convergence assessment */
  convergence: ConvergenceAssessment;

  /** Simulated revisions authors would likely make */
  simulatedRevisions: string[];

  /** Focus areas for next iteration */
  nextIterationFocus: string[];

  /** Decision to continue or stop */
  decision: 'Continue' | 'Accept' | 'Reject';
}

/**
 * Single review iteration containing all reviews and synthesis
 */
export interface ReviewIteration {
  /** Iteration number (1, 2, or 3) */
  iterationNumber: number;

  /** Editorial assessment (only present in iteration 1) */
  editorialAssessment?: EditorialAssessment;

  /** Reviews from the two selected reviewers */
  reviews: [PeerReview, PeerReview];

  /** Editor's synthesis (not present in final iteration if process completes) */
  synthesis?: IterationSynthesis;
}

// ============================================================================
// FINAL REVIEW REPORT
// ============================================================================

/**
 * Trajectory analysis showing improvement across iterations
 */
export interface TrajectoryAnalysis {
  /** Changes from iteration 1 to 2 */
  iteration1to2?: {
    improvements: string[];
    persistentIssues: string[];
  };

  /** Changes from iteration 2 to 3 */
  iteration2to3?: {
    improvements: string[];
    persistentIssues: string[];
  };

  /** Overall convergence assessment */
  overallConvergence: string;
}

/**
 * Complete peer review report containing all iterations and final recommendations
 */
export interface ReviewReport {
  /** Article title */
  articleTitle: string;

  /** Target journal name */
  targetJournal: string;

  /** Review completion date */
  reviewDate: Date;

  /** Total number of iterations performed */
  totalIterations: number;

  /** Final editorial recommendation */
  finalRecommendation: ReviewRecommendation;

  /** Final decision rationale */
  finalRationale: string;

  /** All review iterations */
  iterations: ReviewIteration[];

  /** Priority recommendations for authors */
  priorityRecommendations: string[];

  /** Strengths to preserve */
  strengthsToPreserve: string[];

  /** Critical issues to address */
  criticalIssuesToAddress: string[];

  /** Suggested next steps */
  suggestedNextSteps: string[];

  /** Trajectory analysis */
  trajectoryAnalysis: TrajectoryAnalysis;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request payload for initiating a review
 * Must include either pdfBase64 OR articleText
 */
export interface ReviewRequest {
  /** PDF file as base64 string (optional - required if articleText not provided) */
  pdfBase64?: string;

  /** Plain text article content (optional - required if pdfBase64 not provided) */
  articleText?: string;

  /** Original filename */
  filename: string;

  /** Target journal name */
  journalName: string;
}

/**
 * Response from review API endpoint
 */
export interface ReviewResponse {
  /** Success status */
  success: boolean;

  /** Complete review report (if successful) */
  report?: ReviewReport;

  /** Error message (if failed) */
  error?: string;

  /** Processing time in milliseconds */
  processingTime?: number;
}

// ============================================================================
// JOURNAL CRITERIA
// ============================================================================

/**
 * Publishing criteria for a journal
 */
export interface JournalCriteria {
  /** Journal name */
  journalName: string;

  /** Scope and focus areas */
  scope: string;

  /** Publication criteria */
  criteria: string;

  /** Whether criteria were automatically scraped or manually provided */
  source: 'scraped' | 'manual' | 'default';
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Progress update during review process
 */
export interface ReviewProgress {
  /** Current stage */
  stage:
    | 'extracting_text'
    | 'fetching_criteria'
    | 'editorial_assessment'
    | 'reviewer_1'
    | 'reviewer_2'
    | 'synthesis'
    | 'complete';

  /** Current iteration (1, 2, or 3) */
  iteration: number;

  /** Progress percentage (0-100) */
  percentage: number;

  /** Status message */
  message: string;
}
