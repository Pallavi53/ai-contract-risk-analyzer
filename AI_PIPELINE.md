# AI Pipeline Architecture - AI Contract Risk Analyzer

## Pipeline Workflow

```
PDF/DOCX Document
      ↓
PyMuPDF (Text) / Tesseract (OCR)
      ↓
Chunker (Page & Section Boundaries)
      ↓
Clause Classifier (18 Legal Categories)
      ↓
Embedder (SentenceTransformers all-MiniLM-L6-v2)
      ↓
pgvector Semantic Index
      ↓
Hybrid Risk Engine (Deterministic Rules + Llama 3 Reasoning)
      ↓
Explainable Score (0-100) & Structured JSON Finding Output
```

## Explainable Risk Scoring Heuristic

Base Score Calculation:
- **CRITICAL Risk**: +30 Points
- **HIGH Risk**: +20 Points
- **MEDIUM Risk**: +10 Points
- **LOW Risk**: +5 Points
- **Missing Protective Clause**: +15 Points (Missing Liability Cap, Missing Governing Law)

Score capped at 100. Clearly flagged as a project-defined heuristic rather than a legal standard.
