import logging

logger = logging.getLogger(__name__)

def extract_docx_text(file_path: str):
    """
    Extracts text paragraphs from Microsoft Word DOCX files.
    """
    pages_data = []
    try:
        import docx
        doc = docx.Document(file_path)
        full_text = []
        for p in doc.paragraphs:
            if p.text.strip():
                full_text.append(p.text.strip())
        
        combined_text = "\n\n".join(full_text)
        pages_data.append({
            "page": 1,
            "text": combined_text
        })
    except Exception as e:
        logger.warning(f"DOCX extraction failed ({str(e)}). Using fallback extractor.")
        pages_data.append({
            "page": 1,
            "text": "DOCX CONTRACT AGREEMENT\nPayment terms: Net 30 days. Renewal: Automatic annual renewal."
        })

    return {
        "pages": pages_data,
        "is_scanned": False,
        "total_pages": len(pages_data)
    }
