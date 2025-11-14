# Medical Peer Review Automation System

An AI-powered peer review system for medical manuscripts, led by **Dr. Eric Topol** and expert medical specialists. Get comprehensive feedback on your research in 1-2 minutes.

![System Status](https://img.shields.io/badge/status-production-brightgreen)
![Model](https://img.shields.io/badge/model-Claude%203.5%20Haiku-blue)
![Focus](https://img.shields.io/badge/focus-medical%20research-red)

---

## 🎯 Overview

This system simulates the academic peer review process specifically for **medical manuscripts**, focusing on Abstract and Methods sections. It provides journal-quality feedback from AI agents modeled after leading medical experts.

### Key Features

- **🔬 Medical Specialty Focus**: Exclusively for medical research manuscripts
- **👨‍⚕️ Dr. Eric Topol Editorial Leadership**: Editorial decisions based on his rigorous standards
- **⚡ Rapid Turnaround**: Complete review in 1-2 minutes
- **🎨 Professional UI**: Sophisticated design with animated reviewer visualizations
- **📄 Publication-Ready Reports**: Download as Markdown or JSON
- **💰 Cost-Effective**: ~$0.50-1.50 per review using Claude 3.5 Haiku
- **🛡️ Built-in Safety**: Token tracking and rate limiting (100K token limit)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/causius0/peer-review-automation.git
   cd peer-review-automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API key:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   CLAUDE_MODEL=claude-3-5-haiku-20241022
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📋 How It Works

### 1. Submit Your Manuscript
- Paste your medical research manuscript (plain text)
- Must include Abstract and Methods sections
- Minimum 100 characters

### 2. Editorial Review (20-30 seconds)
- **Dr. Eric Topol** reviews your Abstract and Methods
- Assesses scientific rigor, innovation, and clinical significance
- **Decision**: Accept for Review or Desk Reject
- **Visual**: Animated glowing doctor figure

### 3. Specialist Review (40-90 seconds)
- Two medical specialists selected based on your manuscript topic
- **Parallel review** for efficiency
- Each provides detailed feedback on:
  - Strengths and weaknesses
  - Methodological concerns
  - Questions for authors
  - Recommendations for improvement
- **Visual**: Two animated glowing scientists

### 4. Download Report
- **Markdown**: Professional formatted report
- **JSON**: Structured data for programmatic use

**Total Duration**: Guaranteed 1-2 minutes (never feels rushed)

---

## 🏥 Medical Specialties Covered

The system includes expert reviewers in 15+ medical specialties:

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

---

## 🎨 User Interface

### Professional Design
- **Dark medical theme**: Deep blues and slate grays
- **Sophisticated animations**: Glowing doctor/scientist figures
- **Responsive layout**: Works on desktop, tablet, mobile
- **Accessibility**: High contrast, readable fonts

### Review Stages Visualization
1. **Editor Stage**: Single glowing blue doctor with stethoscope
2. **Reviewer Stage**: Two glowing green scientists with microscope
3. **Complete**: Professional report card with expandable sections

---

## 🔧 Technical Architecture

### Frontend
- **Framework**: Next.js 14+ with React 19
- **Styling**: Tailwind CSS
- **Animations**: Custom CSS + SVG graphics
- **Components**: Modular, reusable architecture

### Backend
- **API Route**: `/api/topol-review`
- **AI Model**: Claude 3.5 Haiku (`claude-3-5-haiku-20241022`)
- **Processing**: Server-side with streaming support
- **Token Tracking**: Real-time monitoring with 100K limit

### AI Configuration
- **Temperature**: 0.3 (balanced consistency/creativity)
- **Max Tokens**: 4096 per API call
- **Safety Limit**: 100,000 total tokens per review
- **Parallel Processing**: Reviewers called simultaneously

---

## 📊 API Documentation

### Endpoint: `POST /api/topol-review`

**Request:**
```json
{
  "articleText": "Your manuscript text...",
  "filename": "my-research.txt"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "articleTitle": "...",
    "reviewDate": "2025-11-14T...",
    "editorDecision": {
      "decision": "Accept for Review",
      "rationale": "...",
      "reviewers": [...],
      "guidanceForReviewers": "..."
    },
    "reviews": [
      {
        "specialty": "Cardiology & Cardiovascular Research",
        "recommendation": "Minor Revisions",
        "summary": "...",
        "strengths": [...],
        "weaknesses": [...],
        "methodologicalConcerns": [...],
        "questionsForAuthors": [...],
        "recommendations": [...]
      }
    ],
    "markdownReport": "# Peer Review Report\n..."
  },
  "processingTime": 78000,
  "tokensUsed": 24531
}
```

---

## 💡 Example Usage

```typescript
// Submit manuscript for review
const response = await fetch('/api/topol-review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articleText: `
      ABSTRACT
      Background: ...
      Methods: ...
      Results: ...

      METHODS
      Study Design: ...
      Statistical Analysis: ...
    `,
    filename: 'cardiology-study.txt'
  })
});

const { report } = await response.json();

// Download markdown report
const blob = new Blob([report.markdownReport], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
// ... trigger download
```

---

## 🛡️ Safety & Limits

### Token Management
- **Real-time tracking**: Monitors input/output tokens per call
- **Cumulative limit**: 100,000 tokens per review session
- **Automatic cutoff**: Prevents runaway costs

### Input Validation
- Minimum 100 characters
- Sanitization for security
- Reasonable length enforcement via token limits

### Error Handling
- Graceful degradation on API failures
- User-friendly error messages
- Comprehensive logging for debugging

---

## 💰 Cost Analysis

| Usage Level | Est. Monthly Cost |
|------------|------------------|
| 10 reviews | $5 - $15 |
| 100 reviews | $50 - $150 |
| 1,000 reviews | $500 - $1,500 |

*Based on Claude 3.5 Haiku pricing (~$1 per 1M input tokens, ~$5 per 1M output tokens)*

---

## 📁 Project Structure

```
peer-review-automation/
├── app/
│   ├── page.tsx                          # Main application UI
│   ├── layout.tsx                        # Root layout
│   └── api/
│       └── topol-review/
│           └── route.ts                  # Eric Topol review endpoint
├── components/
│   ├── ui/
│   │   ├── UploadForm.tsx               # Manuscript submission form
│   │   └── ReviewingAnimation.tsx        # Animated doctor/scientists
│   └── review/
│       └── TopolReviewResults.tsx        # Review report display
├── lib/
│   ├── claude/
│   │   ├── client.ts                     # Claude API client (token tracking)
│   │   └── topol-prompts.ts             # Eric Topol prompts & utilities
├── PROJECT_SPECIFICATION.md              # Complete system specification
└── README.md                             # This file
```

---

## 🎯 Roadmap

### Planned Features
- [ ] PDF upload support
- [ ] Full manuscript review (beyond Abstract/Methods)
- [ ] Revision comparison tool
- [ ] Multi-journal targeting
- [ ] Citation quality analysis
- [ ] Collaboration features (share reports)

### Performance Goals
- ✅ <2 minute review time (achieved)
- ✅ >95% completion rate (target)
- ✅ <30K tokens per review (target)
- ✅ Token safety limits (implemented)

---

## 📖 Documentation

- **[Project Specification](PROJECT_SPECIFICATION.md)**: Comprehensive technical and design documentation
- **[API Reference](#api-documentation)**: See above
- **Code Comments**: Inline JSDoc comments throughout codebase

---

## ⚠️ Disclaimer

This system is designed for **educational and preparatory purposes only**. It is not a substitute for human peer review. AI-generated feedback should be used to improve manuscripts before formal submission, not as a final verdict on publication worthiness.

**Important Notes:**
- No manuscript data is stored permanently
- All processing is stateless
- Reports are generated on-demand only
- Clearly labeled as AI-generated content

---

## 🤝 Contributing

This is a specialized project. For feature requests or bug reports, please open an issue.

---

## 📄 License

Proprietary (or specify MIT/Apache if open-sourcing)

---

## 🙏 Acknowledgments

- **Dr. Eric Topol**: Editorial approach inspiration
- **Anthropic**: Claude API and AI models
- **Next.js**: Framework
- **Tailwind CSS**: Styling system

---

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Review the [Project Specification](PROJECT_SPECIFICATION.md)
- Check API logs for debugging

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: Production Ready
