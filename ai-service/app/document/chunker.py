import re

def chunk_contract_pages(pages_data, max_chunk_size=500, overlap=50):
    """
    Chunks contract text page-by-page preserving section titles, page numbers, and offsets.
    """
    chunks = []
    chunk_counter = 0

    for page_info in pages_data:
        page_num = page_info.get("page", 1)
        text = page_info.get("text", "")
        
        if not text:
            continue

        # Split text into paragraphs
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        current_chunk = ""
        current_section = "General Provision"

        for para in paragraphs:
            # Check if paragraph looks like a section heading
            if re.match(r'^(Section|SECTION|Article|ARTICLE|\d+\.|\d+\.\d+)\s+[A-Z0-9\s,–\-]{3,60}', para):
                current_section = para[:100]

            if len(current_chunk) + len(para) < max_chunk_size:
                current_chunk += (" " + para if current_chunk else para)
            else:
                chunk_counter += 1
                chunks.append({
                    "chunk_index": chunk_counter,
                    "page_number": page_num,
                    "section_title": current_section,
                    "chunk_text": current_chunk.strip()
                })
                current_chunk = para

        if current_chunk:
            chunk_counter += 1
            chunks.append({
                "chunk_index": chunk_counter,
                "page_number": page_num,
                "section_title": current_section,
                "chunk_text": current_chunk.strip()
            })

    return chunks
