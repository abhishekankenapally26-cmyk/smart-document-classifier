import re
import io
import math
from collections import Counter
from typing import Optional
import PyPDF2
import docx


class DocumentClassifier:
    """
    Document classifier using TF-IDF style keyword matching with
    domain-specific vocabularies. In production, replace with a fine-tuned
    BERT model (e.g., via HuggingFace Transformers).
    """

    CATEGORY_KEYWORDS = {
        "resume": [
            "experience", "education", "skills", "objective", "summary",
            "work history", "employment", "references", "bachelor", "master",
            "university", "college", "gpa", "internship", "volunteer",
            "linkedin", "github", "portfolio", "certification", "award",
            "accomplishment", "proficient", "fluent", "objective", "career"
        ],
        "invoice": [
            "invoice", "bill", "amount due", "payment", "total", "subtotal",
            "tax", "discount", "quantity", "unit price", "item", "description",
            "purchase order", "po number", "due date", "net 30", "net 60",
            "billing address", "shipping address", "receipt", "charge",
            "vendor", "customer", "account number", "transaction"
        ],
        "legal": [
            "agreement", "contract", "terms", "conditions", "party", "parties",
            "whereas", "hereinafter", "obligation", "liability", "indemnify",
            "jurisdiction", "governing law", "arbitration", "confidential",
            "intellectual property", "warranty", "termination", "breach",
            "remedy", "clause", "provision", "hereby", "thereof", "hereunder",
            "plaintiff", "defendant", "court", "statute", "regulation"
        ],
        "medical": [
            "patient", "diagnosis", "treatment", "prescription", "medication",
            "dosage", "symptom", "clinical", "physician", "hospital", "surgery",
            "lab results", "blood pressure", "heart rate", "chronic", "acute",
            "referral", "specialist", "insurance", "icd", "cpt", "radiology",
            "pathology", "prognosis", "therapy", "discharge"
        ],
        "financial": [
            "balance sheet", "income statement", "revenue", "expense", "profit",
            "loss", "cash flow", "asset", "liability", "equity", "dividend",
            "earnings", "fiscal", "quarter", "annual report", "audit",
            "depreciation", "amortization", "forecast", "budget", "ledger",
            "journal entry", "debit", "credit", "reconciliation", "portfolio"
        ],
    }

    def __init__(self):
        self.categories = list(self.CATEGORY_KEYWORDS.keys())

    def _extract_text(self, file_bytes: bytes, filename: str) -> str:
        text = ""
        fname = filename.lower()

        if fname.endswith(".pdf"):
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    text += page.extract_text() or ""
            except Exception:
                text = file_bytes.decode("utf-8", errors="ignore")

        elif fname.endswith(".docx"):
            try:
                doc = docx.Document(io.BytesIO(file_bytes))
                text = "\n".join([p.text for p in doc.paragraphs])
            except Exception:
                text = file_bytes.decode("utf-8", errors="ignore")

        else:
            text = file_bytes.decode("utf-8", errors="ignore")

        return text.lower()

    def _score(self, text: str) -> dict:
        scores = {}
        words = re.findall(r"\b\w[\w\s]{1,30}\b", text)
        text_counter = Counter(words)
        total_words = max(len(words), 1)

        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = 0.0
            for kw in keywords:
                count = text.count(kw)
                if count > 0:
                    tf = count / total_words
                    idf = math.log(len(self.categories) / 1)
                    score += tf * idf
            scores[category] = round(score * 1000, 4)

        return scores

    def classify(self, file_bytes: bytes, filename: str) -> dict:
        text = self._extract_text(file_bytes, filename)

        if len(text.strip()) < 20:
            raise ValueError("Document appears to be empty or unreadable.")

        scores = self._score(text)
        total = sum(scores.values()) or 1
        confidences = {k: round(v / total * 100, 2) for k, v in scores.items()}
        predicted = max(confidences, key=confidences.get)
        confidence = confidences[predicted]

        # Map confidence to accuracy tier
        if confidence >= 70:
            accuracy_label = "High"
        elif confidence >= 45:
            accuracy_label = "Medium"
        else:
            accuracy_label = "Low"

        return {
            "predicted_category": predicted,
            "confidence": confidence,
            "accuracy_label": accuracy_label,
            "all_scores": confidences,
            "word_count": len(text.split()),
            "filename": filename,
        }
