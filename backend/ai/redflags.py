RED_FLAG_TERMS = {
    "English": [
        "chest pain", "difficulty breathing", "can't breathe", "cannot breathe",
        "shortness of breath", "unconscious", "fainted", "seizure",
        "severe bleeding", "coughing blood", "stroke", "slurred speech",
        "suicide", "want to die", "overdose", "severe allergic", "swollen throat",
    ],
    "Urdu": [
        "سینے میں درد", "سانس لینے میں دشواری", "بے ہوش", "دورہ",
        "خون بہہ", "خودکشی",
    ],
}


def check_red_flags(text: str) -> list[str]:
    """Return the emergency phrases found in the text (empty list = none found)."""
    lowered = text.lower()
    found = []
    for terms in RED_FLAG_TERMS.values():
        for term in terms:
            if term.lower() in lowered:
                found.append(term)
    return found