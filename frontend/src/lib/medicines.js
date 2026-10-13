// Compares two lists of medicine names that the doctor types.
// Matches on the first word only, so "Paracetamol 500mg" matches "paracetamol".
// Works in any language, because the doctor types the names.

// Turns "Paracetamol 500mg, Omeprazole 20mg" into a list
export function parseList(text) {
  return (text || "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Lowercase first word, used for matching
function key(name) {
  return name.trim().toLowerCase().split(/\s+/)[0];
}

// prescription: medicines the doctor prescribed
// mentioned: medicines the patient talked about
export function compareLists(prescription, mentioned) {
  const menKeys = mentioned.map(key);
  const rxKeys = prescription.map(key);

  return {
    both: prescription.filter((p) => menKeys.includes(key(p))),
    prescribedOnly: prescription.filter((p) => !menKeys.includes(key(p))),
    mentionedOnly: mentioned.filter((m) => !rxKeys.includes(key(m))),
  };
}