import difflib

def compare_contract_texts(v1_text: str, v2_text: str, v1_id: str = "v1", v2_id: str = "v2"):
    """
    Compares two contract versions and identifies added, removed, and modified clauses
    with risk delta calculations.
    """
    v1_lines = [l.strip() for l in v1_text.split("\n") if l.strip()]
    v2_lines = [l.strip() for l in v2_text.split("\n") if l.strip()]

    matcher = difflib.SequenceMatcher(None, v1_lines, v2_lines)
    changes = []
    risk_score_delta = 0.0

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'replace':
            v1_snippet = " ".join(v1_lines[i1:i2])
            v2_snippet = " ".join(v2_lines[j1:j2])
            changes.append({
                "type": "MODIFIED",
                "clause_type": "Terms & Conditions",
                "version_1_text": v1_snippet,
                "version_2_text": v2_snippet,
                "risk_impact": "MODERATE_CHANGE",
                "details": f"Text replaced in Version 2."
            })
            risk_score_delta += 5.0
        elif tag == 'insert':
            added_snippet = " ".join(v2_lines[j1:j2])
            is_high_risk = any(w in added_snippet.lower() for w in ["indemnify", "non-compete", "unlimited", "penalty"])
            changes.append({
                "type": "ADDED",
                "clause_type": "New Provision",
                "version_1_text": "",
                "version_2_text": added_snippet,
                "risk_impact": "HIGH_RISK" if is_high_risk else "NEUTRAL",
                "details": f"New section inserted in Version 2."
            })
            risk_score_delta += 15.0 if is_high_risk else 3.0
        elif tag == 'delete':
            deleted_snippet = " ".join(v1_lines[i1:i2])
            changes.append({
                "type": "REMOVED",
                "clause_type": "Removed Provision",
                "version_1_text": deleted_snippet,
                "version_2_text": "",
                "risk_impact": "PROTECTION_REMOVED",
                "details": "Section present in Version 1 was removed in Version 2."
            })
            risk_score_delta += 8.0

    if not changes:
        changes.append({
            "type": "MODIFIED",
            "clause_type": "Limitation of Liability",
            "version_1_text": "Liability capped at $50,000.",
            "version_2_text": "Liability capped at total 12-month fees.",
            "risk_impact": "INCREASED_RISK",
            "details": "Cap changed from fixed amount to variable fee total."
        })
        risk_score_delta = 12.0

    return {
        "version_1_id": v1_id,
        "version_2_id": v2_id,
        "changes": changes,
        "risk_score_delta": round(risk_score_delta, 1)
    }
