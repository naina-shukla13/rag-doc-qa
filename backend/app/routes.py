import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Tuple
from app.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, fake_users_db
)
from app.rag import process_pdf, get_answer
from app.config import UPLOAD_DIR, VECTORSTORE_DIR
router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

class QuestionRequest(BaseModel):
    doc_id: str
    question: str
    chat_history: List[Tuple[str, str]] = []

@router.post("/auth/register")
def register(req: RegisterRequest):
    if req.email in fake_users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    fake_users_db[req.email] = hash_password(req.password)
    return {"message": "Registered successfully"}

@router.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form.username)
    if not user or not verify_password(form.password, user):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(VECTORSTORE_DIR, exist_ok=True)

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    pages, chunks = process_pdf(file_path, doc_id)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "pages": pages,
        "chunks": chunks,
        "message": "PDF processed successfully"
    }

@router.post("/ask")
def ask_question(
    req: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        answer, sources = get_answer(req.doc_id, req.question, req.chat_history)
        return {
            "answer": answer,
            "sources": sources,
            "question": req.question
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")