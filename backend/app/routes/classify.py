from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.classifier import DocumentClassifier
from pydantic import BaseModel
from typing import Dict

router = APIRouter()
classifier = DocumentClassifier()

class ClassificationResult(BaseModel):
    predicted_category: str
    confidence: float
    accuracy_label: str
    all_scores: Dict[str, float]
    word_count: int
    filename: str

ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]

@router.post("/classify", response_model=ClassificationResult)
async def classify_document(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, DOCX, TXT"
        )

    file_bytes = await file.read()

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")

    try:
        result = classifier.classify(file_bytes, file.filename)
        return ClassificationResult(**result)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@router.get("/categories")
def get_categories():
    return {
        "categories": list(DocumentClassifier.CATEGORY_KEYWORDS.keys()),
        "description": "Supported document categories for classification"
    }
