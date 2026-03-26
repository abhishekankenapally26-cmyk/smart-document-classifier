import pytest
from app.services.classifier import DocumentClassifier

classifier = DocumentClassifier()

def make_bytes(text: str) -> bytes:
    return text.encode("utf-8")

def test_classify_resume():
    text = """
    John Doe | LinkedIn | GitHub
    Summary: Full Stack Developer with 5 years of experience.
    Skills: Python, JavaScript, React, AWS, Docker
    Education: Bachelor of Science, University of Texas, GPA 3.8
    Experience: Software Engineer at Google (2019-2024)
    Certifications: AWS Certified Developer
    """
    result = classifier.classify(make_bytes(text), "resume.txt")
    assert result["predicted_category"] == "resume"
    assert result["confidence"] > 0

def test_classify_invoice():
    text = """
    INVOICE #12345
    Bill To: Acme Corp
    Invoice Date: 2024-01-15 | Due Date: 2024-02-15 | Net 30
    Item            Qty   Unit Price   Total
    Web Design       1    $2,000.00    $2,000.00
    Hosting (annual) 1    $500.00      $500.00
    Subtotal: $2,500.00 | Tax (8%): $200.00 | Amount Due: $2,700.00
    Payment methods: Bank Transfer, Credit Card, PayPal
    """
    result = classifier.classify(make_bytes(text), "invoice.txt")
    assert result["predicted_category"] == "invoice"

def test_classify_legal():
    text = """
    SERVICE AGREEMENT
    This Agreement is entered into by and between the parties hereinafter referred to.
    WHEREAS, the Client desires to obtain services; NOW THEREFORE, in consideration of
    the mutual covenants herein, the parties agree: Confidentiality obligations shall
    survive termination. Jurisdiction: State of California. Arbitration clause applies.
    Liability shall be limited. Intellectual property remains with the vendor.
    """
    result = classifier.classify(make_bytes(text), "contract.txt")
    assert result["predicted_category"] == "legal"

def test_empty_document_raises():
    with pytest.raises(ValueError):
        classifier.classify(b"   ", "empty.txt")

def test_all_scores_sum_to_100():
    text = "invoice payment total amount due tax subtotal billing"
    result = classifier.classify(text.encode(), "test.txt")
    total = sum(result["all_scores"].values())
    assert abs(total - 100.0) < 0.1

def test_word_count_returned():
    text = "one two three four five six seven eight nine ten"
    result = classifier.classify(text.encode(), "test.txt")
    assert result["word_count"] > 0
