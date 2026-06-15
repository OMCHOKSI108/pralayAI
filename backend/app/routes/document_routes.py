import os
import shutil
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.document import Document as DocumentModel
from app.models.document_chunk import DocumentChunk
from app.models.user import User
from app.schemas.document_schema import DocumentResponse, DocumentListResponse
from app.services.auth_dependency import get_current_user
from app.services.rag_service import index_document

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".md", ".csv", ".json", ".docx"}
UPLOAD_DIR = Path(settings.UPLOAD_DIR)


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext} not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit",
        )

    user_upload_dir = UPLOAD_DIR / current_user.id
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    file_path = user_upload_dir / safe_filename

    with open(file_path, "wb") as f:
        f.write(content)

    text = content.decode("utf-8", errors="replace")

    document = DocumentModel(
        user_id=current_user.id,
        filename=file.filename or "unknown",
        file_type=ext,
        file_size=len(content),
        storage_path=str(file_path),
        status="processing",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        chunks = index_document(document, text)
        for chunk in chunks:
            db.add(chunk)
        document.status = "indexed"
        db.commit()
        db.refresh(document)
    except Exception as e:
        document.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        created_at=document.created_at,
    )


@router.get("", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(DocumentModel)
        .filter(DocumentModel.user_id == current_user.id)
        .order_by(DocumentModel.created_at.desc())
        .all()
    )
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=len(docs),
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = (
        db.query(DocumentModel)
        .filter(
            DocumentModel.id == document_id,
            DocumentModel.user_id == current_user.id,
        )
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.storage_path):
        os.remove(doc.storage_path)

    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).delete()
    db.delete(doc)
    db.commit()

    return {"status": "deleted", "document_id": document_id}
