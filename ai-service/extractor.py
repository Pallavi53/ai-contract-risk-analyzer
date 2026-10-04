import io
import pymupdf as fitz
from PIL import Image
import pytesseract
import os
import sys

# Configure tesseract executable location if needed on Windows
TESSERACT_CMD = os.environ.get("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if os.path.exists(TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

def extract_pdf_pages(file_bytes: bytes, filename: str = "document.pdf", document_id: str = "doc_unknown"):
    """
    Extracts text page by page from a PDF document.
    Uses PyMuPDF for digital PDFs and falls back to Tesseract OCR for scanned/empty pages.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    used_ocr = False

    for page_idx in range(len(doc)):
        page_num = page_idx + 1
        page = doc[page_idx]
        text = page.get_text("text").strip()

        # Check if text is empty or insufficient (scanned PDF page)
        if len(text) < 30:
            ocr_text = run_ocr_on_page(page)
            if ocr_text and len(ocr_text) > len(text):
                text = ocr_text.strip()
                used_ocr = True

        pages.append({
            "page": page_num,
            "text": text
        })

    full_text = "\n\n".join([f"--- Page {p['page']} ---\n{p['text']}" for p in pages if p["text"]])
    total_length = len(full_text)

    # Logging debugging output as requested in Section 36
    print(f"==================================================")
    print(f"DOCUMENT ID: {document_id}")
    print(f"FILENAME: {filename}")
    print(f"EXTRACTED TEXT LENGTH: {total_length}")
    print(f"TOTAL PAGES: {len(pages)}")
    print(f"USED OCR: {used_ocr}")
    print(f"==================================================")
    sys.stdout.flush()

    return {
        "document_id": document_id,
        "filename": filename,
        "total_pages": len(pages),
        "total_text_length": total_length,
        "used_ocr": used_ocr,
        "pages": pages,
        "full_text": full_text
    }

def run_ocr_on_page(page) -> str:
    """Renders a PDF page to pixmap image and runs Tesseract OCR."""
    try:
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_bytes))
        ocr_result = pytesseract.image_to_string(img)
        return ocr_result
    except Exception as e:
        print(f"[OCR Warning] Tesseract OCR failed on page: {e}")
        return ""
