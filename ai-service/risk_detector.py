import re
import uuid

def detect_risks_in_clauses(clauses, full_document_text: str):
    """
    Analyzes actual clause text to detect contractual risks across categories.
    Validates evidence against the full document text to guarantee ZERO fabricated evidence.
    """
    risks = []
    
    for clause in clauses:
        clause_text = clause["text"]
        clause_type = clause["clause_type"]
        page_num = clause["page"]
        clause_id = clause["id"]
        c_lower = clause_text.lower()
        
        # 1. FINANCIAL RISKS
        if clause_type in ["Payment", "Term"]:
            # High late payment fee (> 2% per month or 15% per annum)
            late_fee_match = re.search(r'(late\s+(?:fee|charge|interest)|penalty|interest\s+on\s+late)[^.]{0,100}?\b([2-9]|\d{2})%\s*(per\s*month|monthly|\/month)', c_lower)
            if late_fee_match or re.search(r'5%\s*per\s*month', c_lower) or re.search(r'interest\s+of\s+([2-9]|\d{2})%\s*per\s*month', c_lower):
                evidence = extract_evidence_sentence(clause_text, ["late fee", "interest", "penalty", "per month"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "High Late Payment Charge",
                    "category": "FINANCIAL",
                    "severity": "HIGH",
                    "score_contribution": 15,
                    "reason": "The contract imposes an exorbitant late payment penalty rate (e.g. >= 2% per month) which creates severe financial liability.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.98
                })

            # Uncapped price escalation / large financial penalties
            if re.search(r'(price|fee)\s+escalation|increase\s+at\s+any\s+time|penalty\s+of\s+₹?\d+|penalty\s+of\s+\$?\d+', c_lower):
                evidence = extract_evidence_sentence(clause_text, ["escalation", "increase", "penalty"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Severe Financial Penalty / Escalation",
                    "category": "FINANCIAL",
                    "severity": "HIGH",
                    "score_contribution": 12,
                    "reason": "The contract contains financial penalty or price escalation terms without clear capping.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.95
                })

        # 2. TERMINATION RISKS
        if clause_type == "Termination":
            # Long notice period (> 60 days) or difficult notice
            if re.search(r'(90|120|180|6\s*months)\s*days?\s*notice', c_lower) or re.search(r'written\s+notice\s+of\s+not\s+less\s+than\s+(90|120|6\s*months)', c_lower):
                evidence = extract_evidence_sentence(clause_text, ["notice", "days", "written notice"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Excessively Long Termination Notice Period",
                    "category": "TERMINATION",
                    "severity": "MODERATE",
                    "score_contribution": 8,
                    "reason": "The contract requires an unusually long notice period (90+ days) to terminate, restricting flexibility.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.95
                })

            # One-sided termination for convenience or penalty
            if ("company may terminate" in c_lower or "provider may terminate" in c_lower or "sole discretion" in c_lower) and "customer may not" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["terminate", "discretion", "sole"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "One-Sided Termination Right",
                    "category": "TERMINATION",
                    "severity": "HIGH",
                    "score_contribution": 12,
                    "reason": "Termination rights are heavily skewed in favor of one party, allowing immediate cancellation while binding the counterparty.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.96
                })
            elif "early termination fee" in c_lower or "termination penalty" in c_lower or "pay all remaining fees" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["termination fee", "remaining fees", "penalty"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Early Termination Penalty",
                    "category": "TERMINATION",
                    "severity": "HIGH",
                    "score_contribution": 10,
                    "reason": "Early termination triggers heavy financial penalties or requires paying the remainder of the contract value.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.95
                })

        # 3. RENEWAL RISKS
        if clause_type in ["Renewal", "Term"]:
            if "automatically renew" in c_lower or "auto-renew" in c_lower or "automatic renewal" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["automatically renew", "auto-renew", "renewal"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Automatic Contract Renewal",
                    "category": "RENEWAL",
                    "severity": "MODERATE",
                    "score_contribution": 8,
                    "reason": "The agreement automatically renews unless non-renewal notice is served within a specific timeframe.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.97
                })

        # 4. LIABILITY RISKS
        if clause_type == "Liability":
            # Very low liability cap for provider / company
            if re.search(r'exceed\s*(?:inr|\$|rs\.?)\s*[0-9,]+', c_lower) or re.search(r'capped\s+at\s+the\s+fees\s+paid\s+in\s+the\s+preceding\s+1\s+month', c_lower) or "liability exceed ₹1,00,000" in c_lower or "liability exceed $1,000" in c_lower or "liability exceed" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["exceed", "liability", "capped", "maximum"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Low Liability Cap / Restrictive Recovery",
                    "category": "LIABILITY",
                    "severity": "HIGH",
                    "score_contribution": 15,
                    "reason": "Liability limitation severely caps potential monetary recovery against the provider.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.96
                })
            
            # Unlimited liability for customer / buyer
            if "unlimited liability" in c_lower or ("shall not apply to customer" in c_lower and "unlimited" in c_lower) or "no cap" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["unlimited", "liability", "cap"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Uncapped Liability Exposure",
                    "category": "LIABILITY",
                    "severity": "CRITICAL",
                    "score_contribution": 20,
                    "reason": "One party bears uncapped financial exposure for damages, breaches, or claims.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.98
                })

        # 5. INDEMNIFICATION RISKS
        if clause_type == "Indemnification":
            if "indemnify" in c_lower or "hold harmless" in c_lower:
                if "one-sided" in c_lower or "customer shall indemnify" in c_lower or "broad" in c_lower or "any and all claims" in c_lower:
                    evidence = extract_evidence_sentence(clause_text, ["indemnify", "hold harmless", "claims"])
                    risks.append({
                        "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                        "clause_id": clause_id,
                        "risk_type": "Broad / One-Sided Indemnification",
                        "category": "INDEMNIFICATION",
                        "severity": "HIGH",
                        "score_contribution": 12,
                        "reason": "Requires broad indemnification covering all third-party claims, legal fees, and liabilities.",
                        "evidence": evidence,
                        "page_number": page_num,
                        "confidence": 0.94
                    })

        # 6. INTELLECTUAL PROPERTY RISKS
        if clause_type == "Intellectual Property":
            if "all right, title and interest" in c_lower or "exclusive property of company" in c_lower or "assigns all ip" in c_lower or "ownership transfer" in c_lower or "pre-existing ip" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["property", "title", "interest", "ownership", "assign"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "One-Sided Intellectual Property Ownership Transfer",
                    "category": "INTELLECTUAL PROPERTY",
                    "severity": "HIGH",
                    "score_contribution": 10,
                    "reason": "Transfers full ownership of created work product, derivatives, or background IP without shared licensing rights.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.95
                })

        # 7. RESTRICTIVE COVENANTS
        if clause_type in ["Non-Compete", "Non-Solicitation"]:
            if "non-compete" in c_lower or "not compete" in c_lower or "solicit" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["compete", "solicit", "restricted", "period"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Restrictive Non-Compete / Non-Solicitation Covenant",
                    "category": "RESTRICTIVE COVENANTS",
                    "severity": "HIGH",
                    "score_contribution": 10,
                    "reason": "Restricts post-termination business activities, client solicitation, or hiring for an extended duration.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.96
                })

        # 8. DATA PROTECTION RISKS
        if clause_type == "Data Protection":
            if "unrestricted" in c_lower or "broad data rights" in c_lower or "use customer data for any purpose" in c_lower or "sell data" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["data", "rights", "purpose", "processing"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Broad Data Usage Rights",
                    "category": "DATA PROTECTION",
                    "severity": "MODERATE",
                    "score_contribution": 7,
                    "reason": "Grants the provider overly broad rights to commercialize or process customer data.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.93
                })

        # 9. AUDIT & ASSIGNMENT (OTHER RISKS)
        if clause_type in ["Audit Rights", "Assignment", "Governing Law"]:
            if "unrestricted audit" in c_lower or "without prior notice" in c_lower or "freely assign" in c_lower:
                evidence = extract_evidence_sentence(clause_text, ["audit", "assign", "notice", "freely"])
                risks.append({
                    "id": f"risk_{len(risks)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_id": clause_id,
                    "risk_type": "Unrestricted Audit / One-Sided Assignment",
                    "category": "OTHER",
                    "severity": "MODERATE",
                    "score_contribution": 6,
                    "reason": "Grants unrestricted inspection or transfer rights without requiring mutual consent or advance notice.",
                    "evidence": evidence,
                    "page_number": page_num,
                    "confidence": 0.92
                })

    # STRICT EVIDENCE VALIDATION REQUIREMENT (SECTION 15)
    # Filter out any risk whose evidence cannot be found in the actual full document text!
    validated_risks = []
    for r in risks:
        ev = r["evidence"].strip()
        if ev and (ev in full_document_text or is_fuzzy_substring(ev, full_document_text)):
            validated_risks.append(r)
        else:
            print(f"[Evidence Validation Warning] Filtered risk '{r['risk_type']}' because evidence was not found in document text.")

    print(f"Detected and validated {len(validated_risks)} contractual risks.")
    return validated_risks

def extract_evidence_sentence(text: str, keywords: list) -> str:
    """Extracts the exact sentence from text containing the keyword."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    for s in sentences:
        s_clean = s.strip()
        s_lower = s_clean.lower()
        if any(kw in s_lower for kw in keywords):
            return s_clean
    return text[:200].strip()

def is_fuzzy_substring(quote: str, text: str) -> bool:
    """Checks substring match ignoring whitespace/newlines."""
    norm_quote = re.sub(r'\s+', ' ', quote).strip().lower()
    norm_text = re.sub(r'\s+', ' ', text).strip().lower()
    return norm_quote in norm_text
