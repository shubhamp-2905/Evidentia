from sentence_transformers import SentenceTransformer
from PIL import Image
from app.config import settings

class EmbeddingService:
    def __init__(self):
        self.text_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        # CLIP model for images. Utilizing sentence-transformers support.
        # "clip-ViT-B-32" is a valid model name in sentence-transformers
        self.image_model = SentenceTransformer(settings.IMAGE_EMBEDDING_MODEL)

    def encode_text(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.text_model.encode(texts)
        return embeddings.tolist()
    
    def encode_image(self, image_path: str) -> list[float]:
        image = Image.open(image_path)
        embedding = self.image_model.encode(image)
        return embedding.tolist()

# Global instance
embeddings_service = EmbeddingService()
