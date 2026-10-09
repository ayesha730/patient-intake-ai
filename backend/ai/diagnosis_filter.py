import re

# Phrases that imply a diagnosis or treatment advice
DIAGNOSTIC_PATTERNS = [
    r"\bmay be\b.*\b(disease|infection|diabetes|cancer|fracture|tumou?r)\b",
    r"\b(diagnos\w*|you have|patient has|suffering from)\b",
    r"\b(prescri\w*|take \d+\s*mg|dosage|treatment plan)\b",
    r"\b(likely|probably)\s+(a|an|the)?\s*\w*\s*(disease|infection|condition|disorder)\b",
]


def find_diagnostic_wording(text: str) -> list[str]:
    """Return any diagnostic phrases found in an AI summary (empty = clean)."""
    hits = []
    for pattern in DIAGNOSTIC_PATTERNS:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            hits.append(match.group(0))
    return hits


def make_safe_summary(summary: str) -> str:
    """Block the summary if it contains diagnostic wording."""
    hits = find_diagnostic_wording(summary)
    if hits:
        return "[Summary withheld: contains diagnostic wording. Please review the patient's original text.]"
    return summary