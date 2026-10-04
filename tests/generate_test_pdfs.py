import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_pdf(filename, title, content_paragraphs):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'ContractTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        spaceAfter=14
    )
    
    body_style = ParagraphStyle(
        'ContractBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=15,
        spaceAfter=10
    )
    
    story = [Paragraph(title, title_style), Spacer(1, 12)]
    
    for p in content_paragraphs:
        story.append(Paragraph(p, body_style))
        story.append(Spacer(1, 8))
        
    doc.build(story)
    print(f"Generated PDF contract: {filename}")

def generate_all_test_contracts():
    out_dir = r"C:\Users\NEELI PALLAVI\.gemini\antigravity\scratch\AI-Contract-Risk-Analyzer\tests"
    
    # TEST 1: Balanced Service Agreement
    test1_paragraphs = [
        "Section 1. Payment Terms. Customer agrees to pay Provider reasonable monthly service fees of INR 50,000 within 30 days of receiving a valid invoice.",
        "Section 2. Term and Termination. This Agreement shall commence on the Effective Date and remain in effect for a period of one year. Either party may terminate this agreement upon 30 days prior written notice.",
        "Section 3. Limitation of Liability. Neither party shall be liable for indirect or consequential damages. Each party's aggregate liability under this agreement shall be capped at the total fees paid under the contract.",
        "Section 4. Confidentiality. Both parties agree to maintain mutual confidentiality for a period of 2 years following termination.",
        "Section 5. Governing Law. This agreement shall be governed by and construed in accordance with the laws of India."
    ]
    create_pdf(os.path.join(out_dir, "test1_balanced.pdf"), "BALANCED SERVICE AGREEMENT", test1_paragraphs)

    # TEST 2: Risky Service Agreement
    test2_paragraphs = [
        "Section 1. Payment and Late Charges. Customer shall pay Provider monthly fees of INR 1,50,000. Customer shall pay a late fee of 5% per month on all overdue amounts.",
        "Section 2. Automatic Renewal and Termination. This Agreement shall automatically renew for successive 2-year periods unless Customer provides written notice of non-renewal not less than 90 days prior to the end of the term. Provider may terminate at any time for convenience.",
        "Section 3. Limitation of Liability. In no event shall Provider's aggregate liability exceed INR 1,00,000 under any circumstances, while Customer remains subject to standard liabilities.",
        "Section 4. Indemnification. Customer agrees to defend, indemnify, and hold harmless Provider against broad third-party claims.",
        "Section 5. Non-Compete. Customer agrees not to engage in any competitive business activity for a restricted period of 12 months following termination."
    ]
    create_pdf(os.path.join(out_dir, "test2_risky.pdf"), "RISKY SERVICE AGREEMENT", test2_paragraphs)

    # TEST 3: Severely Risky Agreement
    test3_paragraphs = [
        "Section 1. Financial Penalties & Escalation. Customer shall pay Provider monthly fees of INR 5,00,000. Customer shall pay a late fee of 5% per month on overdue invoices and an early termination penalty equal to all remaining contract fees for the full term.",
        "Section 2. Automatic Renewal & Irrevocable Term. This Agreement shall automatically renew for additional 3-year terms. Customer must provide written notice of not less than 120 days. Provider may terminate at its sole discretion at any time.",
        "Section 3. Uncapped Liability & Low Liability Cap. In no event shall Provider's total liability exceed INR 50,000. Customer bears unlimited liability for any breach, damages, or indirect losses.",
        "Section 4. Broad Indemnification & IP Transfer. Customer shall indemnify and hold harmless Provider from all legal fees and claims. Customer hereby assigns all right, title and interest in pre-existing IP and derivative work product exclusively to Provider.",
        "Section 5. Extreme Restrictive Covenant & Unrestricted Audit. Customer agrees to a strict non-compete for 24 months post-termination. Provider reserves unrestricted audit rights to inspect Customer systems without prior notice.",
        "Section 6. Data Processing. Provider retains broad data rights to commercialize and process all Customer data for any purpose."
    ]
    create_pdf(os.path.join(out_dir, "test3_severely_risky.pdf"), "SEVERELY RISKY AGREEMENT", test3_paragraphs)

if __name__ == "__main__":
    generate_all_test_contracts()
