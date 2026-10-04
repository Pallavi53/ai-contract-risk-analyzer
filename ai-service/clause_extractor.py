import re
import uuid

# Define patterns and keywords for the 19 required legal clause categories
CLAUSE_PATTERNS = {
    "Payment": [
        r"payment", r"fee", r"compensation", r"invoice", r"invoicing", r"late fee",
        r"billing", r"remittance", r"price", r"rate", r"consideration", r"amount payable", r"charges"
    ],
    "Term": [
        r"\bterm\b", r"duration", r"effective date", r"period of agreement", r"commencement"
    ],
    "Renewal": [
        r"renew", r"renewal", r"automatic renewal", r"auto-renew", r"extension of term"
    ],
    "Termination": [
        r"terminate", r"termination", r"cancel", r"cancellation", r"expiry", r"notice of termination"
    ],
    "Liability": [
        r"liability", r"limitation of liability", r"aggregate liability", r"consequential damages",
        r"cap on liability", r"maximum liability", r"liable"
    ],
    "Indemnification": [
        r"indemnify", r"indemnification", r"indemnity", r"hold harmless", r"defend"
    ],
    "Intellectual Property": [
        r"intellectual property", r"\bip\b", r"patent", r"copyright", r"trademark",
        r"ownership of work", r"work product", r"proprietary rights", r"license"
    ],
    "Confidentiality": [
        r"confidential", r"confidentiality", r"non-disclosure", r"proprietary information", r"trade secret"
    ],
    "Non-Compete": [
        r"non-compete", r"non compete", r"covenant not to compete", r"competitive business", r"restrictive covenant"
    ],
    "Non-Solicitation": [
        r"non-solicit", r"non solicitation", r"solicit employees", r"poach", r"solicitation"
    ],
    "Data Protection": [
        r"data protection", r"privacy", r"personal data", r"gdpr", r"data security", r"data processing"
    ],
    "Governing Law": [
        r"governing law", r"jurisdiction", r"applicable law", r"choice of law", r"governed by"
    ],
    "Dispute Resolution": [
        r"dispute", r"arbitration", r"mediation", r"litigation", r"court", r"venue"
    ],
    "Assignment": [
        r"assign", r"assignment", r"successor", r"transfer of agreement"
    ],
    "Warranty": [
        r"warranty", r"warranties", r"representation", r"disclaimer of warranty", r"as is"
    ],
    "Insurance": [
        r"insurance", r"policy", r"coverage", r"commercial general liability"
    ],
    "Audit Rights": [
        r"audit", r"inspection", r"inspect books", r"records"
    ],
    "Force Majeure": [
        r"force majeure", r"act of god", r"unforeseen events", r"disaster"
    ],
    "Change of Control": [
        r"change of control", r"acquisition", r"merger", r"sale of assets"
    ]
}

def extract_clauses_from_pages(pages):
    """
    Extracts actual clauses from page text.
    Segments document page text into sections/paragraphs and categorizes them.
    Only creates clause records when actual matching text exists.
    """
    clauses = []
    
    for page_obj in pages:
        page_num = page_obj["page"]
        text = page_obj["text"]
        if not text:
            continue
            
        # Split page text into paragraphs/sections
        paragraphs = re.split(r'\n\s*\n|\n(?=[0-9]+\.|\b[A-Z\s]{4,}\b|Section\s+[0-9]+)', text)
        
        for p in paragraphs:
            cleaned_p = p.strip()
            if len(cleaned_p) < 25:
                continue
                
            # Detect section heading if present
            section_match = re.match(r'^(Section\s+\d+(\.\d+)?|\d+\.[\d\.]*|[A-Z\s]{4,}:?)', cleaned_p)
            section_name = section_match.group(0).strip() if section_match else f"Page {page_num} Paragraph"
            
            # Match paragraph against clause categories
            matched_category = None
            highest_matches = 0
            
            p_lower = cleaned_p.lower()
            for category, patterns in CLAUSE_PATTERNS.items():
                match_count = sum(1 for pattern in patterns if re.search(pattern, p_lower))
                if match_count > highest_matches:
                    highest_matches = match_count
                    matched_category = category

            if matched_category and highest_matches > 0:
                clauses.append({
                    "id": f"clause_{len(clauses)+1:03d}_{uuid.uuid4().hex[:6]}",
                    "clause_type": matched_category,
                    "section": section_name,
                    "text": cleaned_p,
                    "page": page_num
                })

    print(f"Extracted {len(clauses)} clauses across {len(pages)} pages.")
    return clauses
