import os
import httpx
from typing import List
from src.config import settings

class LocalEmbeddingClient:
    """
    Unified Embedding Client supporting:
    1. HuggingFace Cloud Inference API (Zero RAM/CPU, Instant GPU embeddings)
    2. Local SentenceTransformer / Scikit-Learn TF-IDF Fallback
    """
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL or "BAAI/bge-small-en-v1.5"
        self._model = None
        self._fallback_vectorizer = None
        self._use_fallback = False

    def _get_hf_token(self) -> str:
        return (
            getattr(settings, "HUGGINGFACE_API_KEY", None) or 
            getattr(settings, "HF_TOKEN", None) or 
            os.getenv("HUGGINGFACE_API_KEY") or 
            os.getenv("HF_TOKEN") or 
            os.getenv("HUGGING_FACE_HUB_TOKEN") or 
            ""
        ).strip()

    def _hf_cloud_embed(self, texts: List[str]) -> List[List[float]]:
        hf_token = self._get_hf_token()
        if not hf_token or not texts:
            return []

        model_slug = "BAAI/bge-small-en-v1.5"
        endpoints = [
            f"https://router.huggingface.co/hf-inference/models/{model_slug}"
        ]
        
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        
        for url in endpoints:
            try:
                resp = httpx.post(
                    url, 
                    json={"inputs": texts, "options": {"wait_for_model": True}}, 
                    headers=headers, 
                    timeout=15.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    # Response format: [[f1, f2, ...], [f1, f2, ...]]
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], list) and len(data[0]) > 0 and isinstance(data[0][0], float):
                            return data
                        elif isinstance(data[0], float):
                            return [data]
                else:
                    print(f"[HuggingFace API Notice ({url})]: {resp.status_code} - {resp.text[:120]}")
            except Exception as e:
                print(f"[HuggingFace API Exception]: {e}")

        return []

    @property
    def model(self):
        if self._model is None and not self._use_fallback:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception as e:
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
        if self._get_hf_token():
            cloud_embs = self._hf_cloud_embed([text])
            if cloud_embs and len(cloud_embs) > 0:
                return cloud_embs[0]

        model = self.model
        if model is not None:
            try:
                return model.encode(text).tolist()
            except Exception:
                pass

        return self._fallback_embed(text)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self._get_hf_token():
            cloud_embs = self._hf_cloud_embed(texts)
            if cloud_embs and len(cloud_embs) == len(texts):
                print(f"[HuggingFace Cloud API] Generated {len(cloud_embs)} embeddings via Cloud GPU (0 RAM/CPU used).")
                return cloud_embs

        model = self.model
        if model is not None:
            try:
                return model.encode(texts).tolist()
            except Exception:
                pass

        return [self._fallback_embed(t) for t in texts]

embedding_client = LocalEmbeddingClient()
