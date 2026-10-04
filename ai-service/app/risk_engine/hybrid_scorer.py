CATEGORY_CAPS = {
    "Financial Exposure": 25,
    "Termination": 15,
    "Liability": 20,
    "Intellectual Property": 10,
    "Restrictive Covenants": 10,
    "Data Protection": 10,
    "Unusual Terms": 10
}

def compute_deterministic_score(findings, clauses=None):
    """
    Computes a deterministic, explainable contract risk score (0-100)
    strictly from actual detected risk findings in the uploaded document.
    """
    category_scores = {
        "Financial Exposure": 0,
        "Termination": 0,
        "Liability": 0,
        "Intellectual Property": 0,
        "Restrictive Covenants": 0,
        "Data Protection": 0,
        "Unusual Terms": 0
    }

    # Accumulate category scores based on actual detected findings
    for f in findings:
        cat = f.get("category", "Unusual Terms")
        contrib = f.get("contribution", 5)
        if cat in category_scores:
            category_scores[cat] += contrib

    # Check for missing essential protective clauses (e.g. missing limitation of liability cap)
    extracted_types = {c.get("clause_type") for c in (clauses or [])}
    if "Limitation of Liability" not in extracted_types and clauses:
        category_scores["Liability"] = min(20, category_scores["Liability"] + 10)
        findings.append({
            "category": "Liability",
            "risk_type": "Missing Liability Protection",
            "clause_type": "Limitation of Liability",
            "severity": "HIGH",
            "contribution": 10,
            "reason": "Missing Limitation of Liability clause. Absence of liability caps exposes organization to unlimited damages.",
            "evidence": "Entire Document - No Limitation of Liability clause found in uploaded text.",
            "page": 1,
            "recommendation": "Insert a clear Limitation of Liability section with an explicit dollar cap.",
            "confidence": 0.90
        })

    # Apply category caps
    capped_category_breakdown = {}
    total_score = 0

    for cat, cap in CATEGORY_CAPS.items():
        capped_val = min(cap, category_scores[cat])
        capped_category_breakdown[cat] = {
            "score": capped_val,
            "max": cap
        }
        total_score += capped_val

    # Map overall risk level
    # 0-29: Low, 30-59: Moderate, 60-79: High, 80-100: Critical
    if total_score >= 80:
        risk_level = "Critical"
    elif total_score >= 60:
        risk_level = "High"
    elif total_score >= 30:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # Assign risk_score (0-100) to each finding for UI display
    formatted_findings = []
    for f in findings:
        formatted_findings.append({
            "risk_type": f["risk_type"],
            "severity": f["severity"],
            "score": f.get("contribution", 5) * 8, # Normalized finding score
            "reason": f["reason"],
            "evidence": f["evidence"],
            "page": f["page"],
            "clause_type": f["clause_type"],
            "recommendation": f.get("recommendation", "Review clause terms."),
            "confidence": float(f["confidence"])
        })

    return {
        "overall_score": total_score,
        "risk_level": risk_level,
        "category_breakdown": capped_category_breakdown,
        "findings": formatted_findings
    }
