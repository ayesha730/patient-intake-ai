// Translation layer for the doctor's view.
// No translation model is connected yet, so any case where the patient and doctor
// use different languages is flagged for a human interpreter.
// When the AMD model is connected, replace the body of translateText only.

export function translateText(text, fromLang, toLang) {
  if (!text) {
    return { text: "", status: "empty" };
  }
  if (fromLang === toLang) {
    return { text, status: "same_language" };
  }
  // Safety rule: never show an unchecked machine translation.
  return { text: null, status: "needs_interpreter" };
}