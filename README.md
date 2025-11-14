# Automated Peer Review System

An advanced AI-powered peer review system that simulates the academic peer review process using Claude API. The system features world-class AI agents modeled after leading researchers across 100+ scientific specialties.

## Features

- **AI-Powered Editorial Assessment**: Dr. Marcia Chen (AI Editor) evaluates article fit and selects appropriate reviewers
- **100+ Specialist Reviewers**: Domain experts across Medical Research, Computer Science, Social Sciences, Natural Sciences, and Engineering
- **Iterative Review Process**: Up to 3 automatic iterations with feedback synthesis
- **Comprehensive Reports**: Detailed feedback with strengths, weaknesses, and actionable recommendations
- **Journal-Specific Criteria**: Automatic extraction of publishing criteria from journal websites
- **Beautiful UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Export Functionality**: Download review reports as Markdown, PDF, or JSON

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Anthropic Claude API (Sonnet 3.5)
- **PDF Processing**: pdf-parse
- **File Upload**: react-dropzone
- **Web Scraping**: Cheerio

## Architecture

```
peer-review-automation/
├── app/
│   ├── page.tsx                      # Main application page
│   └── api/
│       └── review/
│           └── route.ts              # Review API endpoint
├── components/
│   ├── ui/
│   │   ├── UploadForm.tsx           # PDF upload interface
│   │   └── LoadingProgress.tsx      # Progress indicator
│   └── review/
│       └── ReviewResults.tsx         # Review results display
├── lib/
│   ├── claude/
│   │   ├── client.ts                # Claude API client
│   │   └── prompts.ts               # AI prompts for all reviewers
│   ├── pdf/
│   │   └── parser.ts                # PDF text extraction
│   ├── journal/
│   │   └── scraper.ts               # Journal criteria fetching
│   └── orchestrator/
│       └── index.ts                 # Main review orchestration engine
└── types/
    └── index.ts                      # TypeScript type definitions
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Anthropic API key (get one at [https://console.anthropic.com/](https://console.anthropic.com/))

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd peer-review-automation
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Add your Anthropic API key to `.env.local`**:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   CLAUDE_MODEL=claude-3-5-sonnet-20241022
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Usage

### Submitting an Article for Review

1. **Upload PDF**: Drag and drop or click to upload your research article (PDF format, max 10MB)
2. **Specify Journal**: Enter the target journal name (e.g., "Nature", "Science", "Cell")
3. **Start Review**: Click "Start Peer Review" to begin the process
4. **Wait for Results**: The system will:
   - Extract text from your PDF
   - Fetch journal criteria
   - Have the Editor assess your article
   - Select 2 specialist reviewers
   - Conduct up to 3 review iterations
   - Generate a comprehensive report
5. **Review Results**: Explore detailed feedback, recommendations, and trajectory analysis
6. **Export Report**: Download the review in your preferred format:
   - **Markdown (.md)**: Clean, readable format perfect for documentation
   - **PDF**: Professional printable report via browser print dialog
   - **JSON**: Structured data for programmatic processing

### Review Process Timeline

- **Typical Duration**: 2-5 minutes
- **Iterations**: Up to 3 (stops early if reviewers recommend acceptance)
- **AI Calls**:
  - 1 editorial assessment
  - 2 reviews per iteration
  - 1 synthesis per iteration (except the last)
  - Total: ~5-10 Claude API calls per review

## API Reference

### POST /api/review

Submit an article for peer review.

**Request Body**:
```json
{
  "pdfBase64": "base64-encoded PDF data",
  "filename": "article.pdf",
  "journalName": "Nature"
}
```

**Response**:
```json
{
  "success": true,
  "report": {
    "articleTitle": "...",
    "targetJournal": "Nature",
    "finalRecommendation": "Minor Revisions",
    "iterations": [...],
    ...
  },
  "processingTime": 120000
}
```

## AI Reviewers

### The Editor: Dr. Marcia Chen
- 25 years editorial experience across Nature, Science, Cell
- PhD in Molecular Biology from Cambridge
- 200+ publications, h-index: 85
- Expert at assessing novelty, methodological rigor, and journal fit

### 100 Specialist Reviewers

#### Medical Research (20 specialties)
Oncology, Neurology, Cardiology, Immunology, Endocrinology, Gastroenterology, Pulmonology, Nephrology, Hematology, Psychiatry, Pediatrics, Geriatrics, Genetics, Pharmacology, Epidemiology, Radiology, Surgery, Pathology, Dermatology, Ophthalmology

#### Computer Science (20 specialties)
AI/ML, NLP, Computer Vision, Robotics, Security, Distributed Systems, Databases, Software Engineering, HCI, Graphics, Networks, OS, Algorithms, Quantum Computing, Bioinformatics, HPC, Embedded Systems, Blockchain, Architecture, Information Retrieval

#### Social Sciences (20 specialties)
Clinical/Cognitive/Developmental/Social Psychology, Sociology, Economics (Micro/Macro/Behavioral), Political Science, Anthropology (Cultural/Biological), Education, Linguistics, Communication, Geography, Criminology, Social Work, Gender Studies, Urban Planning, Demography

#### Natural Sciences (20 specialties)
Physics (Theoretical/Experimental/Condensed Matter/Astro), Chemistry (Organic/Inorganic/Physical/Analytical), Biology (Molecular/Cell/Ecology/Evolutionary), Microbiology, Botany, Zoology, Marine Biology, Geology, Atmospheric Science, Environmental Science, Astronomy

#### Engineering (20 specialties)
Mechanical, Electrical, Civil, Chemical, Aerospace, Materials Science, Biomedical, Environmental, Industrial, Nuclear, Petroleum, Manufacturing, Robotics, Nanotechnology, Optical, Acoustical, Agricultural, Mining, Systems, Energy

## Code Quality Features

### Comprehensive Comments
- Every function has detailed JSDoc comments
- Inline comments explain complex logic
- Clear descriptions of parameters and return values

### Type Safety
- Full TypeScript coverage
- Comprehensive type definitions in `types/index.ts`
- No `any` types used

### Error Handling
- Graceful error handling throughout
- User-friendly error messages
- Detailed logging for debugging

### Modularity
- Clear separation of concerns
- Reusable components and services
- Easy to maintain and extend

## Troubleshooting

### "API key not set" error
- Ensure `.env.local` file exists
- Check that `ANTHROPIC_API_KEY` is set correctly
- Restart the development server after adding the key

### PDF extraction fails
- Ensure PDF is not corrupted
- Check PDF is not image-only (requires OCR for scanned documents)
- Verify PDF file size is under 10MB

### Review takes too long
- Check internet connection
- Verify Claude API status
- Review article length (very long articles take longer)

### TypeScript errors
- Run `npm run build` to see all errors
- Ensure all dependencies are installed
- Check Node.js version (must be 18+)

## Cost Considerations

### Claude API Costs
- Uses Claude 3.5 Sonnet by default
- Average cost per review: ~$0.50-$2.00 (depending on article length)
- Cost breakdown:
  - Editorial assessment: ~$0.10-$0.30
  - Each review: ~$0.10-$0.30
  - Synthesis: ~$0.05-$0.15
  - Total per iteration: ~$0.25-$0.75

---

**Last Updated**: November 2025
**Version**: 1.0.0
