from typing import List
from src.config import settings

class LocalEmbeddingClient:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self._model = None
        self._fallback_vectorizer = None
        self._use_fallback = False

    @property
    def model(self):
        if self._model is None and not self._use_fallback:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                print(f"Notice: SentenceTransformer not available ({e}). Using Scikit-Learn TF-IDF fallback for embeddings.")
                self._use_fallback = True
        return self._model

    def _fallback_embed(self, text: str) -> List[float]:
        try:
            from sklearn.feature_extraction.text import HashingVectorizer
            if self._fallback_vectorizer is None:
                self._fallback_vectorizer = HashingVectorizer(n_features=384, alternate_sign=False)
            vec = self._fallback_vectorizer.transform([text]).toarray()[0]
            return vec.tolist()
        except Exception:
            return [0.0] * 384

    def get_embedding(self, text: str) -> List[float]:
        model = self.model
        if model is not None:
            try:
                emb = model.encode(text)
                return emb.tolist()
            except Exception as e:
                print(f"Error in model.encode: {e}")
        return self._fallback_embed(text)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        model = self.model
        if model is not None:
            try:
                embs = model.encode(texts)
                return embs.tolist()
            except Exception as e:
                print(f"Error in batch model.encode: {e}")
        return [self._fallback_embed(t) for t in texts]

embedding_client = LocalEmbeddingClient()
