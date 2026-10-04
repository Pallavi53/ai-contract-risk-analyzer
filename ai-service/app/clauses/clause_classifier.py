import re

CLAUSE_PATTERNS = {
    "Payment": [r'\b(payment|invoice|fee|price|compensation|billing|net\s+\d+|remittance|currency|overdue|late\s+charge|interest)\b'],
    "Termination": [r'\b(terminat|cancel|expire|cure\s+period|default|breach|written\s+notice|termination\s+for\s+convenience)\b'],
    "Renewal": [r'\b(renew|extension|auto-renew|automatic\s+renewal|successive\s+term|expiration)\b'],
    "Confidentiality": [r'\b(confidential|secret|proprietary|non-disclosure|trade\s+secret|disclose|protected\s+information)\b'],
    "Indemnification": [r'\b(indemnif|hold\s+harmless|defend|losses|damages|third-party\s+claim)\b'],
    "Limitation of Liability": [r'\b(limitation\s+of\s+liability|aggregate\s+liability|consequential\s+damages|indirect\s+damages|punitive|cap\s+on\s+liability|maximum\s+liability)\b'],
    "Intellectual Property": [r'\b(intellectual\s+property|patent|copyright|trademark|work\s+for\link|ownership|license|moral\s+rights|inventions)\b'],
    "Data Protection": [r'\b(data\s+protection|privacy|gdpr|personal\s+data|security\s+breach|data\s+subject)\b'],
    "Non-Compete": [r'\b(non-compete|competitive\s+activity|restrictive\s+covenant|engage\s+in\s+business|competing\s+entity)\b'],
    "Non-Solicitation": [r'\b(non-solicit|solicit\s+employees|poach|hire\s+personnel)\b'],
    "Governing Law": [r'\b(governing\s+law|jurisdiction|venue|laws\s+of|choice\s+of\s+law|state\s+of)\b'],
    "Dispute Resolution": [r'\b(dispute|arbitration|mediation|litigation|tribunal|court|settlement)\b'],
    "Warranty": [r'\b(warrant|guarantee|as\s+is|merchantability|fitness\s+for\s+particular\s+purpose|disclaimer\s+of\s+warranties)\b'],
    "Insurance": [r'\b(insurance|policy|commercial\s+general\s+liability|coverage|workers\s+compensation)\b'],
    "Audit Rights": [r'\b(audit|inspect|inspection|records|examine\s+books|compliance\s+verification)\b'],
    "Assignment": [r'\b(assign|transfer|successor|sub-contract|delegat)\b'],
    "Force Majeure": [r'\b(force\s+majeure|act\s+of\s+god|war|pandemic|epidemic|strike|unforeseeable)\b'],
    "Change of Control": [r'\b(change\s+of\s+control|merger|acquisition|reorganization|sale\s+of\s+assets)\b']
}

def classify_clause(text: str):
    """
    Classifies contract clause text into one of the 18 clause types.
    Returns (clause_type, confidence).
    """
    lowered = text.lower()
    matches = {}

    for clause_type, regexes in CLAUSE_PATTERNS.items():
        score = 0
        for regex in regexes:
            found = re.findall(regex, lowered, re.IGNORECASE)
            score += len(found)
        if score > 0:
            matches[clause_type] = score

    if not matches:
        return "General Provision", 0.50

    sorted_matches = sorted(matches.items(), key=lambda x: x[1], reverse=True)
    top_clause, top_score = sorted_matches[0]
    
    confidence = min(0.98, 0.60 + (top_score * 0.10))
    return top_clause, round(confidence, 2)

def extract_all_clauses(chunks):
    """
    Extracts and categorizes clauses across all chunks.
    """
    extracted_clauses = []
    
    for chunk in chunks:
        clause_type, confidence = classify_clause(chunk["chunk_text"])
        if clause_type != "General Provision" or len(chunk["chunk_text"]) > 100:
            extracted_clauses.append({
                "clause_type": clause_type,
                "section_title": chunk.get("section_title", "Section"),
                "clause_text": chunk["chunk_text"],
                "page_number": chunk.get("page_number", 1),
                "confidence": confidence
            })
            
    return extracted_clauses
