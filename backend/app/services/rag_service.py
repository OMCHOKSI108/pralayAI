import logging
import os
import shutil
from pathlib import Path
from typing import List, Optional, Tuple

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger("pralayai.rag")
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.schemas.enhanced_chat_schema import CitationInfo


_embedding_model = None


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _embedding_model


def _get_chroma_client(user_id: str):
    chroma_path = os.path.join(settings.RAG_CHROMA_PATH, user_id)
    os.makedirs(chroma_path, exist_ok=True)
    return chromadb.PersistentClient(
        path=chroma_path,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    if overlap >= chunk_size:
        overlap = max(0, chunk_size // 4)
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start = end - overlap
        if start >= len(text):
            break
    return chunks


def index_document(document: Document, text: str) -> List[DocumentChunk]:
    model = _get_embedding_model()
    chunks = _chunk_text(text)
    chroma_client = _get_chroma_client(document.user_id)

    collection_name = f"docs_{document.user_id}"
    if collection_name not in [c.name for c in chroma_client.list_collections()]:
        collection = chroma_client.create_collection(collection_name)
    else:
        collection = chroma_client.get_collection(collection_name)

    doc_chunks = []
    ids = []
    embeddings = []
    metadatas = []

    for i, chunk_text in enumerate(chunks):
        chunk = DocumentChunk(
            document_id=document.id,
            user_id=document.user_id,
            chunk_index=i,
            content=chunk_text,
        )
        doc_chunks.append(chunk)

        chunk_id = f"{document.id}_{i}"
        ids.append(chunk_id)

        embedding = model.encode(chunk_text).tolist()
        embeddings.append(embedding)

        metadatas.append({
            "document_id": document.id,
            "user_id": document.user_id,
            "chunk_index": i,
            "filename": document.filename,
        })

    if ids:
        collection.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=[c.content for c in doc_chunks])

    logger.info("Document indexed: id=%s filename=%s user_id=%s chunks=%s",
                document.id, document.filename, document.user_id, len(doc_chunks))
    return doc_chunks


def search_similar(user_id: str, query: str, top_k: int = None) -> List[Tuple[str, str, float, str]]:
    if top_k is None:
        top_k = settings.RAG_TOP_K

    model = _get_embedding_model()
    chroma_client = _get_chroma_client(user_id)

    collection_name = f"docs_{user_id}"
    if collection_name not in [c.name for c in chroma_client.list_collections()]:
        logger.debug("No RAG collection yet: user_id=%s", user_id)
        return []

    collection = chroma_client.get_collection(collection_name)

    query_embedding = model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    hits = []
    if results["ids"] and results["ids"][0]:
        for i, doc_id in enumerate(results["ids"][0]):
            distance = results["distances"][0][i] if results["distances"] else 0
            score = 1.0 - distance
            if score >= settings.RAG_SCORE_THRESHOLD:
                metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                hits.append((
                    doc_id,
                    results["documents"][0][i],
                    score,
                    metadata.get("filename", "unknown"),
                ))

    return hits


def format_rag_context(hits: List[Tuple[str, str, float, str]]) -> str:
    if not hits:
        return ""

    lines = ["Relevant document context:"]
    for i, (doc_id, content, score, filename) in enumerate(hits, 1):
        lines.append(f"\n[{i}] From: {filename} (relevance: {score:.0%})")
        lines.append(f"    {content[:300]}")
    return "\n".join(lines)


def rag_answer(user_id: str, query: str) -> Tuple[str, List[CitationInfo]]:
    hits = search_similar(user_id, query)
    citations = []

    if not hits:
        logger.debug("RAG no results: user_id=%s query_len=%s", user_id, len(query))
        return "", citations

    context = format_rag_context(hits)
    for doc_id, content, score, filename in hits:
        citations.append(CitationInfo(
            title=filename,
            url=None,
            snippet=content[:200],
            relevance=score,
            source_type="document",
        ))

    logger.info("RAG results: user_id=%s hits=%s top_score=%.2f", user_id, len(hits), hits[0][2] if hits else 0)
    return context, citations
