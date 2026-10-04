def calculate_deterministic_score(risks: list):
    """
    Calculates a transparent, deterministic risk score from actual detected risks.
    Enforces category caps and maps total score to risk levels.
    """
    # Category point totals
    category_scores = {
        "FINANCIAL": 0,
        "TERMINATION": 0,
        "LIABILITY": 0,           # Includes Liability & Indemnification
        "INDEMNIFICATION": 0,
        "INTELLECTUAL PROPERTY": 0,
        "RESTRICTIVE COVENANTS": 0,
        "DATA PROTECTION": 0,
        "OTHER": 0
    }
    
    # Category caps as specified in Section 11 & 13
    CATEGORY_CAPS = {
        "FINANCIAL": 25,
        "TERMINATION": 15,
        "LIABILITY_COMBINED": 20, # Liability + Indemnification combined capped at 20
        "INTELLECTUAL PROPERTY": 10,
        "RESTRICTIVE COVENANTS": 10,
        "DATA PROTECTION": 10,
        "OTHER": 10
    }

    for risk in risks:
        cat = risk.get("category", "OTHER").upper()
        pts = risk.get("score_contribution", 5)
        if cat in category_scores:
            category_scores[cat] += pts
        else:
            category_scores["OTHER"] += pts

    # Apply category caps
    financial_capped = min(category_scores["FINANCIAL"], CATEGORY_CAPS["FINANCIAL"])
    termination_capped = min(category_scores["TERMINATION"], CATEGORY_CAPS["TERMINATION"])
    
    liability_combined_raw = category_scores["LIABILITY"] + category_scores["INDEMNIFICATION"]
    liability_capped = min(liability_combined_raw, CATEGORY_CAPS["LIABILITY_COMBINED"])
    
    ip_capped = min(category_scores["INTELLECTUAL PROPERTY"], CATEGORY_CAPS["INTELLECTUAL PROPERTY"])
    restrictions_capped = min(category_scores["RESTRICTIVE COVENANTS"], CATEGORY_CAPS["RESTRICTIVE COVENANTS"])
    data_capped = min(category_scores["DATA PROTECTION"], CATEGORY_CAPS["DATA PROTECTION"])
    other_capped = min(category_scores["OTHER"], CATEGORY_CAPS["OTHER"])

    overall_score = (
        financial_capped +
        termination_capped +
        liability_capped +
        ip_capped +
        restrictions_capped +
        data_capped +
        other_capped
    )

    # Ensure max 100
    overall_score = min(overall_score, 100)

    # Determine risk level based on Section 12
    if overall_score <= 29:
        risk_level = "LOW"
    elif overall_score <= 59:
        risk_level = "MODERATE"
    elif overall_score <= 79:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    breakdown = {
        "financial_score": financial_capped,
        "termination_score": termination_capped,
        "liability_score": liability_capped,
        "ip_score": ip_capped,
        "restrictions_score": restrictions_capped,
        "data_score": data_capped,
        "other_score": other_capped,
        "max_financial": 25,
        "max_termination": 15,
        "max_liability": 20,
        "max_ip": 10,
        "max_restrictions": 10,
        "max_data": 10,
        "max_other": 10
    }

    print("==================================================")
    print(f"RISK CONTRIBUTIONS:")
    print(f"Financial: {financial_capped}/25")
    print(f"Termination: {termination_capped}/15")
    print(f"Liability: {liability_capped}/20")
    print(f"IP: {ip_capped}/10")
    print(f"Restrictions: {restrictions_capped}/10")
    print(f"Data: {data_capped}/10")
    print(f"Other: {other_capped}/10")
    print(f"FINAL SCORE: {overall_score} / 100 ({risk_level})")
    print("==================================================")

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "breakdown": breakdown
    }
