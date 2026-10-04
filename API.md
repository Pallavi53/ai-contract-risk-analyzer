# API Specification - AI Contract Risk Analyzer

## Base URLs
- **Node.js Express Backend**: `http://localhost:5000/api`
- **FastAPI AI Service**: `http://localhost:8000/api`

---

## 🔑 Authentication Endpoints

### 1. Register User
`POST /auth/register`
```json
{
  "name": "Jane Doe",
  "email": "jane@acme.com",
  "password": "Password123!",
  "role": "USER"
}
```

### 2. Login User
`POST /auth/login`
```json
{
  "email": "admin@acme.com",
  "password": "Password123!"
}
```

---

## 📄 Contract Endpoints

### 1. Upload Contract
`POST /contracts/upload`  
*Headers*: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`  
*Form Data*: `file: contract.pdf`, `title: MSA Agreement.pdf`

### 2. List Contracts
`GET /contracts`

### 3. Get Contract Analysis
`GET /analysis/:id?lang=en`

### 4. Contract RAG Chat
`POST /chat/:id`
```json
{
  "query": "What are the payment terms?",
  "language": "en"
}
```

### 5. Compare Contract Versions
`POST /compare`
```json
{
  "version1Id": "ver_1",
  "version2Id": "ver_2"
}
```
