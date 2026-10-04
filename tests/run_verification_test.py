import os
import sys
import json
import requests

# Add ai-service folder to path for direct Python pipeline testing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../ai-service')))

from extractor import extract_pdf_pages
from clause_extractor import extract_clauses_from_pages
from risk_detector import detect_risks_in_clauses
from scoring_engine import calculate_deterministic_score
from rag_engine import index_document_clauses, answer_contract_question
from comparator import compare_contract_versions

def run_contract_pipeline(pdf_path, doc_id, version_id):
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
        
    filename = os.path.basename(pdf_path)
    extracted = extract_pdf_pages(pdf_bytes, filename=filename, document_id=doc_id)
    clauses = extract_clauses_from_pages(extracted["pages"])
    risks = detect_risks_in_clauses(clauses, extracted["full_text"])
    score_result = calculate_deterministic_score(risks)
    
    # Index for RAG
    index_document_clauses(version_id, clauses)
    
    return {
        "doc_id": doc_id,
        "version_id": version_id,
        "filename": filename,
        "text_length": extracted["total_text_length"],
        "clause_count": len(clauses),
        "risk_count": len(risks),
        "overall_score": score_result["overall_score"],
        "risk_level": score_result["risk_level"],
        "breakdown": score_result["breakdown"],
        "risks": risks,
        "clauses": clauses
    }

def main():
    print("\n==================================================")
    print("RUNNING CRITICAL VERIFICATION TEST (SECTIONS 28 & 29)")
    print("==================================================")

    tests_dir = r"C:\Users\NEELI PALLAVI\.gemini\antigravity\scratch\AI-Contract-Risk-Analyzer\tests"
    t1_path = os.path.join(tests_dir, "test1_balanced.pdf")
    t2_path = os.path.join(tests_dir, "test2_risky.pdf")
    t3_path = os.path.join(tests_dir, "test3_severely_risky.pdf")

    # TEST 1: BALANCED
    r1 = run_contract_pipeline(t1_path, "contract_001", "version_001")
    print(f"\n[TEST 1 BALANCED] Score: {r1['overall_score']} / 100 ({r1['risk_level']}) | Risks: {r1['risk_count']}")

    # TEST 2: RISKY
    r2 = run_contract_pipeline(t2_path, "contract_002", "version_002")
    print(f"\n[TEST 2 RISKY] Score: {r2['overall_score']} / 100 ({r2['risk_level']}) | Risks: {r2['risk_count']}")

    # TEST 3: SEVERELY RISKY
    r3 = run_contract_pipeline(t3_path, "contract_003", "version_003")
    print(f"\n[TEST 3 SEVERELY RISKY] Score: {r3['overall_score']} / 100 ({r3['risk_level']}) | Risks: {r3['risk_count']}")

    print("\n--------------------------------------------------")
    print("DIFFERENT DOCUMENTS TEST VERIFICATION (SECTION 28):")
    print(f"Score 1 ({r1['overall_score']}) != Score 2 ({r2['overall_score']}) != Score 3 ({r3['overall_score']})")
    
    diff_scores = (r1['overall_score'] != r2['overall_score']) and (r2['overall_score'] != r3['overall_score'])
    print(f"Different Scores Result: {'PASS' if diff_scores else 'FAIL'}")

    # TEST 1 RE-RUN: SAME DOCUMENT CONSISTENCY (SECTION 29)
    r1_again = run_contract_pipeline(t1_path, "contract_004", "version_004")
    print(f"\n[TEST 1 AGAIN] Score: {r1_again['overall_score']} / 100 ({r1_again['risk_level']})")
    same_score = (r1['overall_score'] == r1_again['overall_score'])
    print(f"Same Document Deterministic Score Result: {'PASS' if same_score else 'FAIL'}")

    # RAG ISOLATION TEST (SECTION 18)
    q1 = answer_contract_question("version_001", "What is the liability cap?")
    q3 = answer_contract_question("version_003", "What is the liability cap?")
    print("\n--------------------------------------------------")
    print("RAG DOCUMENT ISOLATION VERIFICATION (SECTION 18):")
    print(f"Doc 1 RAG Answer: {q1['answer'][:120]}...")
    print(f"Doc 3 RAG Answer: {q3['answer'][:120]}...")

    # VERSION COMPARISON TEST (SECTION 19)
    comp = compare_contract_versions(r1["clauses"], r3["clauses"])
    print("\n--------------------------------------------------")
    print("VERSION COMPARISON VERIFICATION (SECTION 19):")
    print(f"Found {len(comp)} changed clauses between V1 and V3.")
    for c in comp[:2]:
        print(f"- Clause: {c['clause']} | Change: {c['change']} | Risk Impact: {c['risk_impact']}")

    all_passed = diff_scores and same_score and len(comp) > 0
    print("\n==================================================")
    print(f"FINAL VERIFICATION TEST SUITE RESULT: {'ALL TESTS PASSED!' if all_passed else 'SOME TESTS FAILED!'}")
    print("==================================================")

if __name__ == "__main__":
    main()
