const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../backend/uploads/test_contracts');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Test Contract A (Balanced - Low Risk)
const contractA = `MASTER SERVICES AGREEMENT (BALANCED CONTRACT A)
1. PAYMENT TERMS: Customer shall pay all invoices within Net 30 days of receipt. No late fees or interest penalty shall apply if payment is remitted on time.
2. TERMINATION: Either party may terminate this Agreement for convenience upon 30 days prior written notice. If a breach occurs, the defaulting party shall have 30 days cure period to correct the default.
3. LIMITATION OF LIABILITY: Neither party shall be liable for indirect damages. Each party's aggregate liability under this Agreement shall be capped at total fees paid in the preceding 12 months.
4. INTELLECTUAL PROPERTY: Each party retains ownership of its pre-existing IP. Customer receives a non-exclusive license to use deliverables.
5. GOVERNING LAW: This agreement shall be governed by local state laws.
`;

// Test Contract B (Moderate Risk)
const contractB = `PROFESSIONAL SERVICES AGREEMENT (MODERATE RISK CONTRACT B)
1. PAYMENT TERMS: All payments are due Net 30 days. Overdue balances shall accrue late fee interest at 1.5% per month (18% APR).
2. RENEWAL: This agreement shall automatically renew for successive 1-year terms unless either party provides written notice of cancellation 60 days prior to expiration.
3. INDEMNIFICATION: Customer agrees to defend and indemnify Provider against third-party claims arising from Customer's misuse of services.
4. TERMINATION: Either party may terminate upon 30 days written notice.
5. GOVERNING LAW: Governed by the laws of Delaware.
`;

// Test Contract C (Critical High Risk)
const contractC = `SOFTWARE VENDOR AGREEMENT (CRITICAL HIGH RISK CONTRACT C)
1. FINANCIAL TERMS: Customer shall pay a late fee of 5% per month (60% APR) on any overdue invoice balance. Advance payments are non-refundable.
2. UNLIMITED LIABILITY: In no event shall Provider's liability be limited. Customer agrees that Provider shall have unlimited liability for uncapped damages and Customer agrees to hold harmless Provider against any and all third-party claims.
3. UNILATERAL TERMINATION: Provider may terminate this Agreement immediately at any time without cause and without notice or opportunity to cure breaches.
4. INTELLECTUAL PROPERTY ASSIGNMENT: Customer hereby assigns all rights, title, interest, and moral rights in all work product as work for hire to Provider.
5. RESTRICTIVE COVENANTS: Customer and its employees shall not engage in any competing business for a period of 24 months post-termination.
6. UNILATERAL MODIFICATION & UNRESTRICTED AUDIT: Provider retains the unilateral right to modify contract terms at any time without consent. Provider retains unrestricted audit rights to inspect Customer books at any time without prior notice.
7. GOVERNING LAW: Governed exclusively by foreign jurisdiction venue outside local territory.
`;

fs.writeFileSync(path.join(dir, 'contract_a_balanced.txt'), contractA);
fs.writeFileSync(path.join(dir, 'contract_b_moderate.txt'), contractB);
fs.writeFileSync(path.join(dir, 'contract_c_critical.txt'), contractC);

// Copy text files as .pdf for upload testing
fs.writeFileSync(path.join(dir, 'contract_a_balanced.pdf'), contractA);
fs.writeFileSync(path.join(dir, 'contract_b_moderate.pdf'), contractB);
fs.writeFileSync(path.join(dir, 'contract_c_critical.pdf'), contractC);

console.log('Successfully generated Test Contracts A, B, and C!');
