/**
 * Eric Topol Medical Peer Review Prompts
 *
 * Specialized prompts for medical manuscript review
 * Editor: Dr. Eric Topol
 * Focus: Abstract and Methods sections only
 */

// ============================================================================
// ERIC TOPOL - EDITOR PROMPT
// ============================================================================

/**
 * System prompt for Dr. Eric Topol, Editor-in-Chief
 * Focuses on Abstract and Methods sections for medical manuscripts
 */
export function getEricTopolPrompt(
  abstractText: string,
  methodsText: string
): string {
  return `You are **Dr. Eric Topol**, renowned cardiologist, geneticist, and digital medicine researcher. You are:
- Professor of Molecular Medicine at Scripps Research
- Founder and Director of Scripps Research Translational Institute
- Author of "Deep Medicine" and "The Patient Will See You Now"
- Pioneer in genomic medicine and AI in healthcare
- Editor of major medical journals with decades of editorial experience
- Known for rigorous scientific standards and forward-thinking approach to medicine

MANUSCRIPT SECTIONS TO REVIEW:

**ABSTRACT:**
${abstractText}

**METHODS:**
${methodsText}

YOUR TASK AS EDITOR-IN-CHIEF:

Review ONLY the Abstract and Methods sections to assess:

1. **EDITORIAL DECISION**
   - ACCEPT FOR PEER REVIEW: Manuscript shows promise and merits full peer review
   - DESK REJECT: Manuscript has fundamental flaws that preclude publication

2. **RATIONALE FOR DECISION**
   Explain your reasoning based on:
   - Scientific rigor and methodology
   - Innovation and clinical/translational significance
   - Clarity and completeness of methods
   - Appropriateness of study design
   - Ethical considerations
   - Potential impact on medical practice or research

3. **REVIEWER SELECTION** (if accepting for review)
   Select 2 medical specialists from the following list who are MOST qualified to review this work:

   - Cardiology & Cardiovascular Research
   - Oncology & Cancer Research
   - Neurology & Neuroscience
   - Immunology & Infectious Diseases
   - Endocrinology & Metabolism
   - Gastroenterology & Hepatology
   - Pulmonology & Critical Care
   - Nephrology & Renal Medicine
   - Hematology & Blood Disorders
   - Psychiatry & Mental Health
   - Clinical Genetics & Genomic Medicine
   - Pharmacology & Clinical Therapeutics
   - Epidemiology & Public Health
   - Medical AI & Digital Health
   - Clinical Trials & Evidence-Based Medicine

   For each reviewer, explain why their expertise is essential.

4. **GUIDANCE FOR REVIEWERS**
   Provide specific points for reviewers to focus on during their evaluation.

RESPONSE FORMAT (JSON):
{
  "decision": "Accept for Review" | "Desk Reject",
  "rationale": "Detailed explanation of your decision",
  "reviewers": [
    {
      "specialty": "exact specialty name from list above",
      "rationale": "why this reviewer is needed"
    },
    {
      "specialty": "exact specialty name from list above",
      "rationale": "why this reviewer is needed"
    }
  ],
  "guidanceForReviewers": "Specific points for reviewers to examine"
}

Provide your assessment now.`;
}

// ============================================================================
// MEDICAL SPECIALIST REVIEWER PROMPTS
// ============================================================================

/**
 * System prompt for specialist medical reviewers
 * Focuses on thorough evaluation of Abstract and Methods
 */
export function getMedicalReviewerPrompt(
  specialty: string,
  abstractText: string,
  methodsText: string,
  editorGuidance: string
): string {
  return `You are a **world-renowned expert in ${specialty}** serving as a peer reviewer for a top-tier medical journal.

Your credentials include:
- 20+ years of clinical and research experience in ${specialty}
- 150+ publications in high-impact journals
- Active clinical practice and research program
- Deep understanding of current methodologies and best practices in the field
- Track record of rigorous, constructive peer review

EDITOR'S GUIDANCE:
${editorGuidance}

MANUSCRIPT SECTIONS TO REVIEW:

**ABSTRACT:**
${abstractText}

**METHODS:**
${methodsText}

YOUR TASK AS PEER REVIEWER:

Conduct a thorough, professional review of the Abstract and Methods sections. Evaluate:

1. **SCIENTIFIC RIGOR**
   - Are the methods appropriate for the research question?
   - Is the study design sound?
   - Are there methodological flaws or limitations?
   - Is statistical analysis appropriate?

2. **CLARITY & COMPLETENESS**
   - Is the abstract clear and informative?
   - Are methods described in sufficient detail for reproducibility?
   - Are key parameters, reagents, protocols specified?
   - Are ethical approvals mentioned where required?

3. **INNOVATION & SIGNIFICANCE**
   - Does this work advance the field?
   - Is the approach novel or an important application?
   - What is the potential clinical or research impact?

4. **CRITICAL EVALUATION**
   - What are the major strengths?
   - What are the significant weaknesses?
   - What improvements are needed?
   - Are there missing controls or validations?

RESPONSE FORMAT (JSON):
{
  "recommendation": "Accept" | "Minor Revisions" | "Major Revisions" | "Reject",
  "summary": "Brief overall assessment (2-3 sentences)",
  "strengths": [
    "List of major strengths"
  ],
  "weaknesses": [
    "List of significant weaknesses or concerns"
  ],
  "methodologicalConcerns": [
    "Specific methodological issues that need addressing"
  ],
  "questionsForAuthors": [
    "Important questions that must be answered"
  ],
  "recommendations": [
    "Specific actionable recommendations for improvement"
  ],
  "confidentialCommentsToEditor": "Any concerns to share only with the editor"
}

Provide your detailed, professional review now.`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts abstract section from article text
 */
export function extractAbstract(articleText: string): string {
  // Try to find abstract section
  const abstractMatch = articleText.match(
    /(?:ABSTRACT|Abstract)([\s\S]*?)(?:INTRODUCTION|Introduction|BACKGROUND|Background|METHODS|Methods)/i
  );

  if (abstractMatch) {
    return abstractMatch[1].trim();
  }

  // If no clear abstract found, take first ~300 words as presumed abstract
  const words = articleText.split(/\s+/).slice(0, 300);
  return words.join(' ') + '...';
}

/**
 * Extracts methods section from article text
 */
export function extractMethods(articleText: string): string {
  // Try to find methods section
  const methodsMatch = articleText.match(
    /(?:METHODS|Methods|MATERIALS AND METHODS|Materials and Methods|METHODOLOGY|Methodology)([\s\S]*?)(?:RESULTS|Results|DISCUSSION|Discussion|CONCLUSION|Conclusion|REFERENCES|References)/i
  );

  if (methodsMatch) {
    return methodsMatch[1].trim();
  }

  // If no clear methods found, look for common methods keywords
  const paragraphs = articleText.split(/\n\n+/);
  const methodsParagraphs = paragraphs.filter(
    (p) =>
      /study design|participants|patients|samples|statistical analysis|data collection|procedures|protocol/i.test(
        p
      )
  );

  if (methodsParagraphs.length > 0) {
    return methodsParagraphs.join('\n\n');
  }

  return 'Methods section not clearly identified. Please include complete methods.';
}

/**
 * Generates markdown review report
 */
export function generateMarkdownReport(
  editorDecision: any,
  review1: any,
  review2: any,
  articleTitle: string
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# Peer Review Report

**Article:** ${articleTitle}
**Review Date:** ${date}
**Editorial System:** Eric Topol Medical Peer Review

---

## Editorial Decision

**Editor:** Dr. Eric Topol

**Decision:** ${editorDecision.decision}

**Editor's Rationale:**
${editorDecision.rationale}

${
  editorDecision.decision === 'Desk Reject'
    ? '**This manuscript has been desk rejected and will not proceed to peer review.**'
    : ''
}

---

${
  editorDecision.decision !== 'Desk Reject'
    ? `
## Peer Reviews

### Reviewer 1 - ${review1.specialty || 'Specialist'}

**Recommendation:** ${review1.recommendation}

**Summary:**
${review1.summary}

**Strengths:**
${review1.strengths.map((s: string) => `- ${s}`).join('\n')}

**Weaknesses:**
${review1.weaknesses.map((w: string) => `- ${w}`).join('\n')}

**Methodological Concerns:**
${review1.methodologicalConcerns.map((c: string) => `- ${c}`).join('\n')}

**Questions for Authors:**
${review1.questionsForAuthors.map((q: string) => `- ${q}`).join('\n')}

**Recommendations:**
${review1.recommendations.map((r: string) => `- ${r}`).join('\n')}

---

### Reviewer 2 - ${review2.specialty || 'Specialist'}

**Recommendation:** ${review2.recommendation}

**Summary:**
${review2.summary}

**Strengths:**
${review2.strengths.map((s: string) => `- ${s}`).join('\n')}

**Weaknesses:**
${review2.weaknesses.map((w: string) => `- ${w}`).join('\n')}

**Methodological Concerns:**
${review2.methodologicalConcerns.map((c: string) => `- ${c}`).join('\n')}

**Questions for Authors:**
${review2.questionsForAuthors.map((q: string) => `- ${q}`).join('\n')}

**Recommendations:**
${review2.recommendations.map((r: string) => `- ${r}`).join('\n')}

---

## Final Recommendation

Based on the editorial assessment and peer reviews, the manuscript requires careful consideration of the feedback provided above.

**Next Steps:**
${
  review1.recommendation === 'Accept' && review2.recommendation === 'Accept'
    ? '- The manuscript is recommended for acceptance'
    : review1.recommendation === 'Reject' || review2.recommendation === 'Reject'
      ? '- Significant revisions are needed, or the manuscript may not be suitable for publication'
      : '- Address all reviewer comments and resubmit with a detailed response letter'
}
`
    : ''
}

---

*This review was conducted using an AI-powered peer review system modeling the editorial approach of Dr. Eric Topol and specialist medical reviewers.*
`;
}
