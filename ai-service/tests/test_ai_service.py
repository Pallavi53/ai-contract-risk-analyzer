import pytest
from app.clauses.clause_classifier import classify_clause, CLAUSE_PATTERNS
from app.risk_engine.rules_evaluator import evaluate_rules
from app.risk_engine.hybrid_scorer import compute_explainable_risk_score
from app.rag.contract_qa import answer_contract_question

def test_clause_classifier():
    payment_text = "All payments shall be made Net 30 days from invoice date."
    clause_type, confidence = classify_clause(payment_text)
    assert clause_type == "Payment"
    assert confidence >= 0.60

def test_rules_evaluator_unlimited_liability():
    clauses = [
        {
            "clause_type": "Limitation of Liability",
            "clause_text": "In no event shall either party's liability be limited for consequential or indirect damages.",
            "page_number": 2
        }
    ]
    findings = evaluate_rules(clauses)
    assert len(findings) > 0
    assert findings[0]["severity"] in ["CRITICAL", "HIGH"]

def test_explainable_risk_scoring():
    clauses = [
        {"clause_type": "Payment", "clause_text": "Net 30 days"},
        {"clause_type": "Limitation of Liability", "clause_text": "Unlimited liability applies"}
    ]
    rule_findings = evaluate_rules(clauses)
    score, findings = compute_explainable_risk_score(clauses, rule_findings)
    assert 0.0 <= score <= 100.0
    assert isinstance(findings, list)

def test_rag_fallback_unsupported_query():
    qa_result = answer_contract_question("ctr_test", "What is the secret recipe for chocolate cake?")
    assert qa_result["answer"] == "The contract does not contain sufficient information to answer this question."
    assert qa_result["confidence"] == 0.0
