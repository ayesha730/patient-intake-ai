// Specialty names shown to the patient in their own language.
// The English name is the internal key, so the matching logic is unchanged.
const SPECIALTY_NAMES = {
  "General Physician": {
    en: "General Physician",
    ur: "جنرل فزیشن",
    pa: "جنرل فزیشن",
    ar: "طبيب عام",
    hi: "सामान्य चिकित्सक",
    de: "Allgemeinmedizin",
    nl: "Huisarts",
    fr: "Médecin généraliste",
    es: "Medicina general",
    zh: "全科医生",
  },
  Cardiology: {
    en: "Cardiology",
    ur: "امراض قلب",
    pa: "دل دے روگ",
    ar: "أمراض القلب",
    hi: "हृदय रोग विशेषज्ञ",
    de: "Kardiologie",
    nl: "Cardiologie",
    fr: "Cardiologie",
    es: "Cardiología",
    zh: "心脏科",
  },
  Dermatology: {
    en: "Dermatology",
    ur: "جلدی امراض",
    pa: "چمڑی دے روگ",
    ar: "الأمراض الجلدية",
    hi: "त्वचा रोग विशेषज्ञ",
    de: "Dermatologie",
    nl: "Dermatologie",
    fr: "Dermatologie",
    es: "Dermatología",
    zh: "皮肤科",
  },
};

export function specialtyName(lang, name) {
  const row = SPECIALTY_NAMES[name];
  if (!row) return name;
  return row[lang] || row.en;
}