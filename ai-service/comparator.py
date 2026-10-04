import re

def compare_contract_versions(v1_clauses: list, v2_clauses: list):
    """
    Compares two contract versions clause-by-clause and analyzes changes and risk impacts.
    Extracts actual text values from V1 and V2 without hardcoding.
    """
    v1_map = {}
    for c in v1_clauses:
        ctype = c["clause_type"]
        if ctype not in v1_map:
            v1_map[ctype] = c["text"]
        else:
            v1_map[ctype] += " " + c["text"]

    v2_map = {}
    for c in v2_clauses:
        ctype = c["clause_type"]
        if ctype not in v2_map:
            v2_map[ctype] = c["text"]
        else:
            v2_map[ctype] += " " + c["text"]

    all_categories = sorted(list(set(list(v1_map.keys()) + list(v2_map.keys()))))
    comparisons = []

    for cat in all_categories:
        v1_text = v1_map.get(cat, "Not present in Version 1")
        v2_text = v2_map.get(cat, "Not present in Version 2")

        if v1_text == v2_text:
            continue  # No change

        change_desc, risk_impact = analyze_clause_diff(cat, v1_text, v2_text)

        comparisons.append({
            "clause": cat,
            "version_1": v1_text[:250] + ("..." if len(v1_text) > 250 else ""),
            "version_2": v2_text[:250] + ("..." if len(v2_text) > 250 else ""),
            "change": change_desc,
            "risk_impact": risk_impact
        })

    return comparisons

def analyze_clause_diff(category: str, v1_text: str, v2_text: str) -> tuple:
    """Analyzes differences between V1 and V2 text to describe change and risk impact."""
    v1_low = v1_text.lower()
    v2_low = v2_text.lower()

    if v1_text == "Not present in Version 1":
        return f"New {category} clause added in Version 2.", f"Introduced new obligations under {category}."
    
    if v2_text == "Not present in Version 2":
        return f"{category} clause removed in Version 2.", f"Loss of explicit protections or terms under {category}."

    if category == "Payment":
        # Check numbers/currency
        v1_nums = re.findall(r'(?:₹|\$|usd|inr|rs\.?)\s*[\d,]+', v1_low)
        v2_nums = re.findall(r'(?:₹|\$|usd|inr|rs\.?)\s*[\d,]+', v2_low)
        if v1_nums and v2_nums and v1_nums != v2_nums:
            return f"Payment amount changed from {v1_nums[0]} to {v2_nums[0]}.", "Higher financial obligation." if v2_nums[0] > v1_nums[0] else "Reduced financial obligation."
        if "late fee" in v2_low and "late fee" not in v1_low:
            return "Late fee penalty added in Version 2.", "Increased financial risk on late payments."

    if category == "Termination":
        if "notice" in v1_low and "notice" in v2_low:
            v1_days = re.findall(r'\d+\s*days', v1_low)
            v2_days = re.findall(r'\d+\s*days', v2_low)
            if v1_days and v2_days and v1_days != v2_days:
                return f"Notice period changed from {v1_days[0]} to {v2_days[0]}.", "Reduced termination flexibility." if v2_days[0] > v1_days[0] else "Faster termination available."

    if category == "Liability":
        if "cap" in v2_low or "exceed" in v2_low:
            return "Liability terms modified.", "Potential change in aggregate liability limit."

    return f"Terms updated in {category} clause.", f"Modified contractual terms under {category}."
