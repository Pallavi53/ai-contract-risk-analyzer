from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys

from extractor import extract_pdf_pages
from clause_extractor import extract_clauses_from_pages
from risk_detector import detect_risks_in_clauses
from scoring_engine import calculate_deterministic_score
from rag_engine import index_document_clauses, answer_contract_question
from comparator import compare_contract_versions
from ollama_client import check_ollama_status, generate_summary_with_ollama

app = FastAPI(title="AI Contract Risk Analyzer - AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    version_id: str
    question: str

class CompareRequest(BaseModel):
    v1_clauses: List[dict]
    v2_clauses: List[dict]

@app.get("/")
@app.get("/health")
def health_check():
    ollama_info = check_ollama_status()
    return {
        "status": "online",
        "service": "AI Contract Risk Analyzer FastAPI Service",
        "ollama": ollama_info
    }

@app.post("/ai/extract")
async def extract_pdf_endpoint(
    file: UploadFile = File(...),
    document_id: str = Form("doc_unknown")
):
    try:
        contents = await file.read()
        extracted = extract_pdf_pages(contents, filename=file.filename, document_id=document_id)
        if extracted["total_text_length"] == 0:
            raise HTTPException(status_code=400, detail="Unable to extract readable text from this document.")
        return extracted
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction error: {str(e)}")

@app.post("/ai/clauses")
async def extract_clauses_endpoint(pages: List[dict]):
    try:
        clauses = extract_clauses_from_pages(pages)
        return {"clauses": clauses, "clause_count": len(clauses)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clause extraction error: {str(e)}")

@app.post("/ai/analyze")
async def analyze_contract_endpoint(
    file: UploadFile = File(...),
    document_id: str = Form("contract_unknown"),
    version_id: str = Form("version_unknown")
):
    print(f"\n[AI-SERVICE] Processing analysis for document_id={document_id}, version_id={version_id}")
    contents = await file.read()
    
    # 1. Text Extraction & OCR
    extracted = extract_pdf_pages(contents, filename=file.filename, document_id=document_id)
    if extracted["total_text_length"] == 0:
        raise HTTPException(status_code=400, detail="Unable to extract readable text from this document.")
        
    full_text = extracted["full_text"]
    pages = extracted["pages"]

    # 2. Clause Extraction
    clauses = extract_clauses_from_pages(pages)

    # 3. Risk Detection & Evidence Validation
    risks = detect_risks_in_clauses(clauses, full_text)

    # 4. Deterministic Risk Scoring
    scoring_result = calculate_deterministic_score(risks)

    # 5. RAG Indexing for Document-Isolated Q&A
    index_document_clauses(version_id, clauses)

    # 6. Document-Specific Summary Generation
    if risks:
        top_risk_categories = list(set([r["category"] for r in risks[:3]]))
        risk_desc = ", ".join(top_risk_categories)
    else:
        risk_desc = "no major standard legal risks"
        
    summary = generate_summary_with_ollama(file.filename, full_text, risk_desc)

    # Final Debug Output per Section 36
    print("==================================================")
    print(f"DOCUMENT ID: {document_id}")
    print(f"VERSION ID: {version_id}")
    print(f"FILENAME: {file.filename}")
    print(f"EXTRACTED TEXT LENGTH: {extracted['total_text_length']}")
    print(f"CLAUSE COUNT: {len(clauses)}")
    print(f"RISK COUNT: {len(risks)}")
    print(f"FINAL SCORE: {scoring_result['overall_score']} ({scoring_result['risk_level']})")
    print("==================================================")
    sys.stdout.flush()

    return {
        "document_id": document_id,
        "version_id": version_id,
        "filename": file.filename,
        "total_pages": extracted["total_pages"],
        "text_length": extracted["total_text_length"],
        "used_ocr": extracted["used_ocr"],
        "clauses": clauses,
        "risks": risks,
        "overall_score": scoring_result["overall_score"],
        "risk_level": scoring_result["risk_level"],
        "breakdown": scoring_result["breakdown"],
        "summary": summary
    }

@app.post("/ai/chat")
async def chat_endpoint(req: QuestionRequest):
    res = answer_contract_question(req.version_id, req.question)
    return res

@app.post("/ai/compare")
async def compare_endpoint(req: CompareRequest):
    comparisons = compare_contract_versions(req.v1_clauses, req.v2_clauses)
    return {"comparisons": comparisons}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
