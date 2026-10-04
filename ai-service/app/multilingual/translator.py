TRANSLATION_MAP = {
    "hi": {
        "Liability Risk": "दायित्व जोखिम (Liability Risk)",
        "Financial Risk": "वित्तीय जोखिम (Financial Risk)",
        "Renewal Risk": "नवीनीकरण जोखिम (Renewal Risk)",
        "Termination Risk": "समाप्ति जोखिम (Termination Risk)",
        "IP Risk": "बौद्धिक संपदा जोखिम (IP Risk)",
        "Confidentiality Risk": "गोपनीयता जोखिम (Confidentiality Risk)",
        "CRITICAL": "गंभीर (CRITICAL)",
        "HIGH": "उच्च (HIGH)",
        "MEDIUM": "मध्यम (MEDIUM)",
        "LOW": "कम (LOW)",
        "Unlimited liability clause detected.": "असीमित दायित्व खंड का पता चला।",
        "The contract does not contain sufficient information to answer this question.": "इस प्रश्न का उत्तर देने के लिए अनुबंध में पर्याप्त जानकारी नहीं है।"
    },
    "te": {
        "Liability Risk": "బాధ్యత ప్రమాదం (Liability Risk)",
        "Financial Risk": "ఆర్థిక ప్రమాదం (Financial Risk)",
        "Renewal Risk": "నవీకరణ ప్రమాదం (Renewal Risk)",
        "Termination Risk": "రద్దు ప్రమాదం (Termination Risk)",
        "IP Risk": "మేధోసంపత్తి ప్రమాదం (IP Risk)",
        "Confidentiality Risk": "రహస్యత ప్రమాదం (Confidentiality Risk)",
        "CRITICAL": "క్లిష్టమైన (CRITICAL)",
        "HIGH": "అధిక (HIGH)",
        "MEDIUM": "మధ్యస్థ (MEDIUM)",
        "LOW": "తక్కువ (LOW)",
        "Unlimited liability clause detected.": "పరిమితి లేని బాధ్యత నిబంధన గుర్తించబడింది.",
        "The contract does not contain sufficient information to answer this question.": "ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి ఒప్పందంలో తగినంత సమాచారం లేదు."
    }
}

def translate_explanation(text: str, target_lang: str = "en") -> str:
    """
    Translates explanations and risk findings into Hindi or Telugu if requested.
    Returns original English text if target_lang is 'en' or unsupported.
    """
    if target_lang not in TRANSLATION_MAP:
        return text

    lang_dict = TRANSLATION_MAP[target_lang]
    translated = text
    for key, val in lang_dict.items():
        if key in translated:
            translated = translated.replace(key, val)

    return translated

def detect_language(text: str) -> str:
    """
    Simple language detection (en, hi, te).
    """
    # Devanagari script unicode range for Hindi
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hi"
    # Telugu script unicode range
    if any('\u0C00' <= char <= '\u0C7F' for char in text):
        return "te"
    return "en"
