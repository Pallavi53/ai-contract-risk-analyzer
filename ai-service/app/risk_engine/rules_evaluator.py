import re

RULE_INDICATORS = [
    # 1. Payment / Financial Exposure (Category Cap: 25)
    {
        "category": "Financial Exposure",
        "risk_type": "Payment / Financial Exposure",
        "clause_type": "Payment",
        "severity": "HIGH",
        "contribution": 12,
        "pattern": r'\b(late\s+fee\s+of\s+5%|5%\s+per\s+month|5%\s+monthly|60%\s+annual)\b',
        "concern": "The contract imposes an exorbitant 5% monthly late payment fee (60% APR).",
        "recommendation": "Review and negotiate late payment interest to standard commercial rates (e.g. 1.5% monthly or 18% APR).",
        "confidence": 0.95
    },
    {
        "category": "Financial Exposure",
        "risk_type": "Payment / Financial Exposure",
        "clause_type": "Payment",
        "severity": "MEDIUM",
        "contribution": 8,
        "pattern": r'\b(late\s+fee|interest.*1\.5%|18%|penalty|compound\s+interest|overdue.*accrue)\b',
        "concern": "Late payment interest penalty of 1.5% per month (18% APR) accrues on overdue balances.",
        "recommendation": "Ensure payment terms allow adequate processing time (Net 30) before late fees accrue.",
        "confidence": 0.90
    },
    {
        "category": "Financial Exposure",
        "risk_type": "Payment / Financial Exposure",
        "clause_type": "Payment",
        "severity": "MEDIUM",
        "contribution": 7,
        "pattern": r'\b(non-refundable|upfront\s+deposit|advance\s+payment\s+shall\s+not\s+be\s+returned)\b',
        "concern": "Non-refundable advance fee structure prevents recovery of funds upon early termination.",
        "recommendation": "Request pro-rata refund terms in the event of default or early cancellation.",
        "confidence": 0.85
    },

    # 2. Termination Restrictions (Category Cap: 15)
    {
        "category": "Termination",
        "risk_type": "Termination Restrictions",
        "clause_type": "Termination",
        "severity": "HIGH",
        "contribution": 10,
        "pattern": r'\b(without\s+cause|immediate\s+termination|terminate\s+at\s+any\s+time\s+without|without\s+notice)\b',
        "concern": "Unilateral immediate termination rights without prior notice or cause.",
        "recommendation": "Require at least 30 days prior written notice for convenience termination.",
        "confidence": 0.92
    },
    {
        "category": "Termination",
        "risk_type": "Termination Restrictions",
        "clause_type": "Termination",
        "severity": "HIGH",
        "contribution": 5,
        "pattern": r'\b(no\s+cure\s+period|without\s+opportunity\s+to\s+cure|immediate\s+cancellation\s+upon\s+breach)\b',
        "concern": "Lack of cure period prevents correcting minor technical breaches before contract cancellation.",
        "recommendation": "Incorporate a standard 14 to 30 day written notice cure period for curable breaches.",
        "confidence": 0.88
    },
    {
        "category": "Termination",
        "risk_type": "Automatic Renewal",
        "clause_type": "Renewal",
        "severity": "HIGH",
        "contribution": 8,
        "pattern": r'\b(automatic.*renew|auto-renew|renew.*unless.*(?:60|90|120)\s+days)\b',
        "concern": "Strict automatic renewal window requires 60+ days prior notice to prevent unwanted annual extension.",
        "recommendation": "Calendar renewal notice deadlines immediately upon contract execution.",
        "confidence": 0.90
    },

    # 3. Liability / Indemnification (Category Cap: 20)
    {
        "category": "Liability",
        "risk_type": "Limitation of Liability",
        "clause_type": "Limitation of Liability",
        "severity": "CRITICAL",
        "contribution": 15,
        "pattern": r'\b(unlimited\s+liability|no\s+limitation|liability\s+shall\s+not\s+be\s+limited|without\s+limitation|uncapped\s+liability)\b',
        "concern": "Unlimited liability clause exposes your organization to uncapped financial damages.",
        "recommendation": "Insert a mutual liability cap equal to fees paid in the preceding 12 months.",
        "confidence": 0.96
    },
    {
        "category": "Liability",
        "risk_type": "Indemnification",
        "clause_type": "Indemnification",
        "severity": "HIGH",
        "contribution": 5,
        "pattern": r'\b(indemnif.*against\s+any\s+and\s+all|hold\s+harmless.*third-party|sole\s+cost\s+and\s+expense)\b',
        "concern": "Broad-form indemnification clause requiring full defense and reimbursement of third-party claims.",
        "recommendation": "Limit indemnification obligations strictly to direct losses resulting from gross negligence.",
        "confidence": 0.90
    },

    # 4. Intellectual Property / Ownership (Category Cap: 10)
    {
        "category": "Intellectual Property",
        "risk_type": "Intellectual Property Ownership",
        "clause_type": "Intellectual Property",
        "severity": "HIGH",
        "contribution": 10,
        "pattern": r'\b(work\s+for\s+hire|assigns?\s+all\s+rights|sole\s+property|transfer.*intellectual\s+property|moral\s+rights)\b',
        "concern": "Full intellectual property assignment transferring work product ownership entirely to counterparty.",
        "recommendation": "Retain ownership of pre-existing IP and grant a non-exclusive license instead of full assignment.",
        "confidence": 0.91
    },

    # 5. Restrictive Covenants (Category Cap: 10)
    {
        "category": "Restrictive Covenants",
        "risk_type": "Non-Compete Restriction",
        "clause_type": "Non-Compete",
        "severity": "HIGH",
        "contribution": 8,
        "pattern": r'\b(non-compete|competing\s+business|shall\s+not\s+engage|restriction.*(?:12|24|36)\s+months)\b',
        "concern": "Post-termination non-compete clause restricting commercial operations for up to 24 months.",
        "recommendation": "Narrow geographic and scope restrictions, or strike post-termination non-compete entirely.",
        "confidence": 0.89
    },
    {
        "category": "Restrictive Covenants",
        "risk_type": "Non-Solicitation",
        "clause_type": "Non-Solicitation",
        "severity": "MEDIUM",
        "contribution": 5,
        "pattern": r'\b(non-solicit|solicit\s+employees|poach|hire\s+personnel)\b',
        "concern": "Non-solicitation provision restricting recruitment of counterparty personnel.",
        "recommendation": "Ensure non-solicit excludes general public job postings and unprompted applicants.",
        "confidence": 0.85
    },

    # 6. Data Protection & Compliance (Category Cap: 10)
    {
        "category": "Data Protection",
        "risk_type": "Governing Law & Venue",
        "clause_type": "Governing Law",
        "severity": "MEDIUM",
        "contribution": 5,
        "pattern": r'\b(foreign\s+jurisdiction|exclusive\s+venue.*outside|arbitration\s+in|laws\s+of\s+delaware|laws\s+of\s+california)\b',
        "concern": "Exclusive governing law and venue designated in distant jurisdiction.",
        "recommendation": "Negotiate local governing law or neutral arbitration venue.",
        "confidence": 0.82
    },

    # 7. Unusual / One-sided Terms (Category Cap: 10)
    {
        "category": "Unusual Terms",
        "risk_type": "Unilateral Modification",
        "clause_type": "Unusual Clause",
        "severity": "HIGH",
        "contribution": 5,
        "pattern": r'\b(modify\s+at\s+any\s+time|sole\s+discretion|unilateral|without\s+consent)\b',
        "concern": "Counterparty retains unilateral right to modify contract terms without prior consent.",
        "recommendation": "Require mutual written agreement signed by authorized representatives for all contract amendments.",
        "confidence": 0.88
    },
    {
        "category": "Unusual Terms",
        "risk_type": "Unrestricted Audit Rights",
        "clause_type": "Audit Rights",
        "severity": "MEDIUM",
        "contribution": 5,
        "pattern": r'\b(audit.*at\s+any\s+time|unrestricted\s+access|inspect.*books|examine.*records)\b',
        "concern": "Unrestricted audit rights allowing unannounced inspections of business records.",
        "recommendation": "Limit audits to once per calendar year with at least 15 business days prior written notice.",
        "confidence": 0.84
    }
]

def evaluate_rules_on_pages(pages_data):
    """
    Evaluates rule indicators page-by-page directly on actual document text.
    Extracts exact evidence sentence and exact page number.
    Returns list of risk finding dictionaries.
    """
    findings = []
    seen_evidence = set()

    for p_info in pages_data:
        page_num = p_info.get("page", 1)
        text = p_info.get("text", "")
        if not text:
            continue

        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]

        for rule in RULE_INDICATORS:
            for sentence in sentences:
                if re.search(rule["pattern"], sentence, re.IGNORECASE):
                    # Clean evidence snippet
                    snippet = sentence[:220]
                    if snippet not in seen_evidence:
                        seen_evidence.add(snippet)
                        findings.append({
                            "category": rule["category"],
                            "risk_type": rule["risk_type"],
                            "clause_type": rule["clause_type"],
                            "severity": rule["severity"],
                            "contribution": rule["contribution"],
                            "reason": rule["concern"],
                            "evidence": snippet,
                            "page": page_num,
                            "recommendation": rule["recommendation"],
                            "confidence": rule["confidence"]
                        })

    return findings
