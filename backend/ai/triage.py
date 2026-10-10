import re

SPECIALTY_RULES = [
    (r"chest|heart|palpitation|breath", "Cardiology"),
    (r"skin|rash|itch|acne|hair", "Dermatology"),
]


def suggest_specialty(text: str) -> str:
    """Rule-based for now. The AI model replaces this later."""
    for pattern, specialty in SPECIALTY_RULES:
        if re.search(pattern, text, re.IGNORECASE):
            return specialty
    return "General Physician"


def followup_questions(duration: str | None, severity: str | None) -> list[str]:
    questions = []
    if not duration:
        questions.append("How long have you had this problem?")
    if not severity:
        questions.append("How severe is it: mild, moderate, or severe?")
    return questions


def missing_info(duration: str | None, severity: str | None) -> str:
    gaps = []
    if not duration:
        gaps.append("duration")
    if not severity:
        gaps.append("severity")
    return ", ".join(gaps)