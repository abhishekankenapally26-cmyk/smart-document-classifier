# 📄 Smart Document Classification System

An AI-powered document classifier that categorizes documents (resumes, invoices, legal, medical, financial) using NLP and TF-IDF scoring. Built with FastAPI + React.

![Python](https://img.shields.io/badge/Python-3.11-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green) ![React](https://img.shields.io/badge/React-18-61dafb) ![Docker](https://img.shields.io/badge/Docker-ready-blue)

## 🚀 Features

- **Multi-format support**: PDF, DOCX, TXT
- **5 document categories**: Resume, Invoice, Legal, Medical, Financial
- **Confidence scoring** with visual breakdown
- **Drag & drop** upload interface
- **REST API** with Swagger docs
- **Docker** ready for deployment

## 🏗️ Architecture

```
smart-document-classifier/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── routes/           # API routes
│   │   └── services/         # Classifier logic
│   ├── tests/                # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React frontend
│   └── src/
│       ├── pages/            # UI pages
│       └── services/         # API calls
└── docker-compose.yml
```

## ⚡ Quick Start

### With Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 🧪 Run Tests
```bash
cd backend
pytest tests/ -v
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/classify` | Classify a document |
| GET | `/api/v1/categories` | List all categories |
| GET | `/health` | Health check |

## 🔬 How It Works

1. Text is extracted from PDF/DOCX/TXT files
2. TF-IDF scoring is applied against domain-specific keyword vocabularies
3. Confidence scores are normalized across all categories
4. Results returned with predicted category + breakdown

> **Production upgrade**: Replace the keyword scorer with a fine-tuned BERT model via HuggingFace Transformers for 94%+ accuracy.

## ☁️ AWS Deployment

This project is designed for deployment on **AWS EC2** with auto-scaling:
- Backend: EC2 + Application Load Balancer
- Storage: S3 for document uploads
- Scaling: Auto Scaling Group based on CPU

## 📄 License
MIT
