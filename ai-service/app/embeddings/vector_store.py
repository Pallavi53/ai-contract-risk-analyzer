import logging
import numpy as np

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.in_memory_store = {}

    def store_embeddings(self, contract_id: str, chunks_with_embeddings):
        """
        Stores chunks and vectors into pgvector or memory store.
        """
        self.in_memory_store[contract_id] = chunks_with_embeddings
        logger.info(f"Stored {len(chunks_with_embeddings)} chunk embeddings for contract '{contract_id}'.")

    def search_similar_chunks(self, contract_id: str, query_embedding, top_k=3):
        """
        Performs cosine similarity search against contract embeddings.
        """
        chunks = self.in_memory_store.get(contract_id, [])
        if not chunks:
            return []

        query_vec = np.array(query_embedding)
        scored_chunks = []

        for item in chunks:
            item_vec = np.array(item["embedding"])
            # Cosine similarity
            similarity = np.dot(query_vec, item_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(item_vec) + 1e-9)
            scored_chunks.append({
                "chunk_text": item["chunk_text"],
                "page_number": item["page_number"],
                "section_title": item.get("section_title", "Section"),
                "similarity": float(similarity)
            })

        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_chunks[:top_k]

vector_store_instance = VectorStore()
