# System Architecture - AI Contract Risk Analyzer

## High-Level Architecture Diagram

```
+-----------------------------------------------------------------------+
|                           REACT FRONTEND                              |
|                       (Vite + Tailwind + Recharts)                    |
+-----------------------------------+-----------------------------------+
                                    | REST APIs (JWT Auth)
                                    v
+-----------------------------------------------------------------------+
|                       NODE.JS EXPRESS MAIN BACKEND                    |
|             (Auth, RBAC, File Uploads, Hash Check, Audits)            |
+-----------------+---------------------------------+-------------------+
                  |                                 | Internal REST
                  v                                 v
+-----------------------------------+   +-------------------------------+
|      POSTGRESQL + PGVECTOR        |   |    FASTAPI PYTHON AI ENGINE   |
|   (Relational Data & Vectors)     |   | (PyMuPDF, SentenceTransformer)|
+-----------------------------------+   +---------------+---------------+
                                                        |
                                           +------------+------------+
                                           v                         v
                                +-------------------+     +-------------------+
                                | PyMuPDF / Tesseract|     | Ollama / Llama 3  |
                                | OCR Extraction    |     | Hybrid Risk Scorer|
                                +-------------------+     +-------------------+
```

## Data Flow & Processing Lifecycle

1. **Upload & Digest**: User uploads PDF/DOCX via React drag-and-drop. Express computes SHA-256 hash to detect duplicates and stores metadata in PostgreSQL.
2. **Document Parsing**: FastAPI AI service parses document pages using PyMuPDF (or pytesseract OCR for scanned documents).
3. **Clause Categorization**: NLP regex patterns map paragraphs into 18 clause types.
4. **Vector Embedding**: SentenceTransformers (`all-MiniLM-L6-v2`) converts chunks into 384-dimensional vectors stored in `pgvector`.
5. **Hybrid Risk Evaluation**: Rule-based indicators evaluate unlimited liability, short renewal windows, and aggressive late fees. Combined with Llama 3 reasoning to output explainable risk scores (0–100).
6. **RAG Contract Chat**: Semantic similarity retrieval returns top chunk contexts with exact page citations.
