import os
from typing import List, Dict, Any, Optional
from src.config import settings

class VectorService:
    """
    Pinecone Cloud Vector Database Service for storing and querying job embeddings.
    """
    def __init__(self):
        self.api_key = settings.PINECONE_API_KEY or os.getenv("PINECONE_API_KEY")
        self.index_name = settings.PINECONE_INDEX_NAME or os.getenv("PINECONE_INDEX_NAME") or "jobhunt"
        self._index = None
        self._initialized = False

    def _get_index(self):
        if self._initialized:
            return self._index
            
        if not self.api_key:
            print("Pinecone Notice: PINECONE_API_KEY not configured. Falling back to local vector search.")
            self._initialized = True
            return None

        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=self.api_key)
            existing_indexes = [idx.name for idx in pc.list_indexes()]
            
            if self.index_name in existing_indexes:
                self._index = pc.Index(self.index_name)
                print(f"Connected to Pinecone index: '{self.index_name}' successfully.")
            else:
                print(f"Pinecone Notice: Index '{self.index_name}' not found in {existing_indexes}.")
                self._index = None
        except Exception as e:
            print(f"Pinecone connection notice: {e}")
            self._index = None
            
        self._initialized = True
        return self._index

    def upsert_job_vectors(self, search_id: str, jobs: List[Dict[str, Any]]) -> bool:
        """
        Upsert job vectors and metadata to Pinecone.
        """
        index = self._get_index()
        if not index:
            return False

        try:
            vectors = []
            for j in jobs:
                emb = j.get("embedding")
                job_id = str(j.get("id") or "")
                if not emb or not job_id:
                    continue
                    
                metadata = {
                    "search_id": search_id,
                    "title": str(j.get("title", ""))[:100],
                    "company": str(j.get("company", ""))[:100],
                    "location": str(j.get("location", ""))[:100],
                    "match_score": float(j.get("match_score", 0.0)),
                    "posted_date": str(j.get("posted_date", "")),
                    "url": str(j.get("url", ""))[:250]
                }
                vectors.append({
                    "id": job_id,
                    "values": emb,
                    "metadata": metadata
                })

            if vectors:
                # Upsert in batches of 100
                for i in range(0, len(vectors), 100):
                    batch = vectors[i:i+100]
                    index.upsert(vectors=batch)
                print(f"Successfully upserted {len(vectors)} job vectors to Pinecone index '{self.index_name}'.")
                return True
        except Exception as e:
            print(f"Pinecone upsert error: {e}")
            return False

    def query_similar_jobs(self, query_embedding: List[float], search_id: Optional[str] = None, top_k: int = 25) -> List[Dict[str, Any]]:
        """
        Query Pinecone index for top matching jobs.
        """
        index = self._get_index()
        if not index:
            return []

        try:
            filter_dict = {"search_id": {"$eq": search_id}} if search_id else None
            results = index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            matches = []
            for match in results.get("matches", []):
                meta = match.get("metadata", {})
                matches.append({
                    "id": match.get("id"),
                    "score": match.get("score"),
                    "title": meta.get("title"),
                    "company": meta.get("company"),
                    "location": meta.get("location"),
                    "match_score": meta.get("match_score"),
                    "posted_date": meta.get("posted_date"),
                    "url": meta.get("url")
                })
            return matches
        except Exception as e:
            print(f"Pinecone query error: {e}")
            return []

vector_service = VectorService()
