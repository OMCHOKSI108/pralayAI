from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.memory_schema import (
    MemoryCreate,
    MemoryListResponse,
    MemoryResponse,
    MemoryToggleRequest,
    MemoryUpdate,
)
from app.services.auth_dependency import get_current_user
from app.services.memory_service import (
    clear_user_memories,
    create_memory,
    delete_memory,
    get_relevant_memories,
    get_user_memories,
    update_memory,
)

router = APIRouter(prefix="/api/memory", tags=["Memory"])


@router.get("", response_model=MemoryListResponse)
def list_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memories = get_user_memories(db, current_user.id)
    return MemoryListResponse(
        memories=[MemoryResponse.model_validate(m) for m in memories],
        total=len(memories),
    )


@router.post("", response_model=MemoryResponse)
def add_memory(
    request: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = create_memory(
        db, current_user.id, request.key, request.value,
        type=request.type,
        conversation_id=request.conversation_id,
        source=request.source,
    )
    return MemoryResponse.model_validate(memory)


@router.put("/{memory_id}", response_model=MemoryResponse)
def edit_memory(
    memory_id: str,
    request: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = update_memory(
        db, memory_id, current_user.id,
        key=request.key, value=request.value, confidence=request.confidence,
    )
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return MemoryResponse.model_validate(memory)


@router.delete("/{memory_id}")
def remove_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not delete_memory(db, memory_id, current_user.id):
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"status": "deleted", "memory_id": memory_id}


@router.delete("")
def clear_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = clear_user_memories(db, current_user.id)
    return {"status": "cleared", "count": count}


@router.get("/search")
def search_memories(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memories = get_relevant_memories(db, current_user.id, q)
    return MemoryListResponse(
        memories=[MemoryResponse.model_validate(m) for m in memories],
        total=len(memories),
    )
