from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import classify
from app.services.classifier import DocumentClassifier
import uvicorn

app = FastAPI(
    title="Smart Document Classification API",
    description="AI-powered document classifier using BERT embeddings and CNN",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classify.router, prefix="/api/v1", tags=["classification"])

@app.get("/")
def root():
    return {"message": "Smart Document Classification API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
