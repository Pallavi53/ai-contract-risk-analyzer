# Testing Guide - AI Contract Risk Analyzer

## Backend Unit & API Testing (Jest)

To run Express API unit tests:
```cmd
cd backend
npm test
```

### Verified Test Cases:
- `GET /api/health`: Validates server responsiveness.
- `POST /api/auth/register`: Validates user registration and JWT generation.
- `POST /api/auth/login`: Validates user authentication.
- `GET /api/contracts`: Validates contract listing.
- `GET /api/org/metrics`: Validates risk metric computations.

---

## AI Service Testing (pytest)

To run Python AI engine unit tests:
```cmd
cd ai-service
pytest
```

### Verified Test Cases:
- Clause classification accuracy for Payment, Termination, and Liability clauses.
- Deterministic rule indicators for unlimited liability detection.
- Hybrid explainable risk score computation (0-100).
- RAG QA fallback for unsupported questions ("The contract does not contain sufficient information to answer this question.").
