# Database Documentation - AI Contract Risk Analyzer

## Schema Specifications

1. **organizations**: Multi-tenancy organization records.
2. **users**: System users with role-based access (`ADMIN`, `REVIEWER`, `USER`). Passwords hashed using `bcryptjs`.
3. **contracts**: Uploaded contract metadata, status tracking (`UPLOADING`, `PROCESSING`, `COMPLETED`, `FAILED`), SHA-256 hashes, and overall summaries.
4. **contract_versions**: Version history tracking contract file revisions.
5. **clauses**: Extracted 18 clause types with text snippets, page numbers, and confidence ratings.
6. **risks**: Granular risk findings (`risk_type`, `severity`, `score`, `reason`, `evidence`, `page`, `clause_type`, `confidence`).
7. **analyses**: Historical evaluation execution metrics and JSON output reports.
8. **embeddings**: Chunk embeddings stored using `pgvector` (`vector(384)`). Indexed with HNSW cosine similarity.
9. **audit_logs**: Immutable audit log of all security and data access actions.

Dual SQL scripts provided:
- `database/schema.sql` (PostgreSQL + pgvector)
- `database/schema_mysql.sql` (MySQL relational fallback)
