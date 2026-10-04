import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# In-memory document-isolated vector index store
# Keyed by version_id to ensure complete document isolation (Section 18)
DOCUMENT_INDEXES = {}

def index_document_clauses(version_id: str, clauses: list):
    """
    Creates an isolated vector/embedding index for the specific contract version.
    Contract A's vectors NEVER mix with Contract B's vectors.
    """
    if not clauses:
        DOCUMENT_INDEXES[version_id] = None
        return

    corpus = [c["text"] for c in clauses]
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    DOCUMENT_INDEXES[version_id] = {
        "clauses": clauses,
        "vectorizer": vectorizer,
        "matrix": tfidf_matrix
    }
    print(f"[RAG Index] Successfully indexed {len(clauses)} clauses for document version: {version_id}")

def answer_contract_question(version_id: str, question: str):
    """
    Answers user questions strictly using the uploaded contract's indexed clauses.
    If no index or match is below confidence threshold, returns explicit unsupported message.
    """
    index_data = DOCUMENT_INDEXES.get(version_id)
    if not index_data or not index_data["clauses"]:
        return {
            "answer": "The uploaded contract does not contain sufficient information to answer this question.",
            "source": "None",
            "page_number": 0,
            "confidence": 0.0
        }

    vectorizer = index_data["vectorizer"]
    matrix = index_data["matrix"]
    clauses = index_data["clauses"]

    # Transform query
    q_vec = vectorizer.transform([question])
    sims = cosine_similarity(q_vec, matrix).flatten()

    best_idx = np.argmax(sims)
    best_sim = sims[best_idx]

    # Threshold for relevance
    if best_sim < 0.15:
        return {
            "answer": "The uploaded contract does not contain sufficient information to answer this question.",
            "source": "None",
            "page_number": 0,
            "confidence": float(best_sim)
        }

    matched_clause = clauses[best_idx]
    c_type = matched_clause["clause_type"]
    c_text = matched_clause["text"]
    c_page = matched_clause["page"]
    c_section = matched_clause.get("section", f"Clause {c_type}")

    # Generate answer directly from retrieved clause text
    answer = f"Based on Section '{c_section}' ({c_type}): {c_text}"

    return {
        "answer": answer,
        "source": f"{c_type} ({c_section})",
        "page_number": c_page,
        "confidence": float(best_sim)
    }
