import os
import httpx
from typing import List
from src.config import settings

class LocalEmbeddingClient:
    """
    Zero-Memory Cloud Embedding Client:
    1. Primary: HuggingFace Serverless Inference API (0 MB RAM, GPU accelerated)
    2. Fallback: Ultra-lightweight normalized HashingVectorizer (< 2 MB RAM)
    """
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL or "BAAI/bge-small-en-v1.5"
        self._fallback_vectorizer = None

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

        model_slug = self.model_name if (self.model_name and "/" in self.model_name) else "BAAI/bge-small-en-v1.5"
        endpoints = [
            f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_slug}",
            f"https://router.huggingface.co/hf-inference/models/{model_slug}",
            "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
        ]
        
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json",
            "x-use-cache": "true"
        }
        
        for url in endpoints:
            try:
                resp = httpx.post(
                    url, 
                    json={"inputs": texts, "options": {"wait_for_model": False}}, 
                    headers=headers, 
                    timeout=7.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    # Response format: [[f1, f2, ...], [f1, f2, ...]]
                    if isinstance(data, list) and len(data) > 0:
                        if isinstance(data[0], list) and len(data[0]) > 0 and isinstance(data[0][0], (float, int)):
                            return data
                        elif isinstance(data[0], (float, int)):
                            return [data]
            except Exception:
                pass

        return []

    def _fallback_embed(self, text: str) -> List[float]:
        """
        Pure Python deterministic 384-dimensional normalized vector (0 MB RAM, no sklearn/scipy needed).
        """
        import hashlib
        import math
        
        if not text or not str(text).strip():
            return [0.0] * 384
            
        words = str(text).lower().split()
        vec = [0.0] * 384
        for w in words:
            h = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16)
            idx = h % 384
            sign = 1.0 if (h // 384) % 2 == 0 else -1.0
            vec[idx] += sign
            
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
            
        return vec

    def get_embedding(self, text: str) -> List[float]:
        if self._get_hf_token():
            cloud_embs = self._hf_cloud_embed([text])
            if cloud_embs and len(cloud_embs) > 0:
                return cloud_embs[0]

        return self._fallback_embed(text)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self._get_hf_token():
            cloud_embs = self._hf_cloud_embed(texts)
            if cloud_embs and len(cloud_embs) == len(texts):
                print(f"[HuggingFace Cloud API] Generated {len(cloud_embs)} embeddings via Cloud GPU (0 RAM used).")
                return cloud_embs

        return [self._fallback_embed(t) for t in texts]

embedding_client = LocalEmbeddingClient()
