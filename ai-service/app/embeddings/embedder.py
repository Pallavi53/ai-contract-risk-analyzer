import logging
import numpy as np

logger = logging.getLogger(__name__)

class SentenceEmbedder:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded sentence-transformers model '{self.model_name}' successfully.")
        except Exception as e:
            logger.warning(f"Failed to load sentence-transformers ({str(e)}). Using deterministic 384-dim pseudo-embedder.")

    def encode(self, texts):
        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True)
                return embeddings.tolist()
            except Exception as e:
                logger.warning(f"Encode failed ({str(e)}). Generating fallback embeddings.")

        # Fallback 384-dimensional normalized random vectors for offline execution
        results = []
        for text in texts:
            seed = sum(ord(c) for c in text[:50]) % 10000
            np.random.seed(seed)
            vec = np.random.randn(384)
            norm = np.linalg.norm(vec)
            normalized_vec = (vec / norm).tolist()
            results.append(normalized_vec)
        return results

embedder_instance = SentenceEmbedder()
