import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Tuple
from app.config import settings

class VectorStoreService:
    def __init__(self):
        self.index = None
        self.metadata = [] # List of dicts, index-aligned with FAISS
        self.dimension = 384 # Dimension for all-MiniLM-L6-v2
        
    def create_index(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        
    def load_index(self):
        index_path = settings.FAISS_INDEX_DIR / "index.faiss"
        meta_path = settings.FAISS_INDEX_DIR / "metadata.pkl"
        
        if os.path.exists(index_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(str(index_path))
            with open(meta_path, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.create_index()
            
    def save_index(self):
        if self.index:
            faiss.write_index(self.index, str(settings.FAISS_INDEX_DIR / "index.faiss"))
            with open(settings.FAISS_INDEX_DIR / "metadata.pkl", "wb") as f:
                pickle.dump(self.metadata, f)
                
    def add_texts(self, embeddings: List[List[float]], metas: List[Dict]):
        if self.index is None:
            self.create_index()
            
        if not embeddings:
            return
            
        vectors = np.array(embeddings).astype('float32')
        self.index.add(vectors)
        self.metadata.extend(metas)
        self.save_index()
        
    def search(self, query_embedding: List[float], k: int = 5) -> List[Tuple[Dict, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []
            
        vector = np.array([query_embedding]).astype('float32')
        distances, indices = self.index.search(vector, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.metadata):
                results.append((self.metadata[idx], float(distances[0][i])))
                
        return results

VectorStore = VectorStoreService()
