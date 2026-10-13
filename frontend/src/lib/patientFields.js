// Labels for the "Your details" screen. Kept separate from i18n.js.
const FIELDS = {
  en: { title: "Your details", hint: "Your doctor will see this with your visit.", name: "Full name", age: "Age", gender: "Gender", male: "Male", female: "Female", other: "Other" },
  ur: { title: "آپ کی تفصیلات", hint: "یہ آپ کی ملاقات کے ساتھ ڈاکٹر کو دکھائی دے گا۔", name: "پورا نام", age: "عمر", gender: "جنس", male: "مرد", female: "عورت", other: "دیگر" },
  pa: { title: "تہاڈیاں تفصیلاں", hint: "ایہ تہاڈی ملاقات دے نال ڈاکٹر نوں دِسے گا۔", name: "پورا ناں", age: "عمر", gender: "جنس", male: "مرد", female: "عورت", other: "ہور" },
  ar: { title: "بياناتك", hint: "سيراها الطبيب مع زيارتك.", name: "الاسم الكامل", age: "العمر", gender: "الجنس", male: "ذكر", female: "أنثى", other: "أخرى" },
  hi: { title: "आपका विवरण", hint: "यह आपकी मुलाकात के साथ डॉक्टर को दिखेगा।", name: "पूरा नाम", age: "उम्र", gender: "लिंग", male: "पुरुष", female: "महिला", other: "अन्य" },
  de: { title: "Ihre Angaben", hint: "Ihr Arzt sieht dies zusammen mit Ihrem Besuch.", name: "Vollständiger Name", age: "Alter", gender: "Geschlecht", male: "Männlich", female: "Weiblich", other: "Divers" },
  nl: { title: "Uw gegevens", hint: "Uw arts ziet dit bij uw bezoek.", name: "Volledige naam", age: "Leeftijd", gender: "Geslacht", male: "Man", female: "Vrouw", other: "Anders" },
  fr: { title: "Vos informations", hint: "Votre médecin verra ceci avec votre visite.", name: "Nom complet", age: "Âge", gender: "Sexe", male: "Homme", female: "Femme", other: "Autre" },
  es: { title: "Sus datos", hint: "Su médico verá esto con su visita.", name: "Nombre completo", age: "Edad", gender: "Sexo", male: "Masculino", female: "Femenino", other: "Otro" },
  zh: { title: "您的信息", hint: "医生会在您的就诊中看到这些信息。", name: "全名", age: "年龄", gender: "性别", male: "男", female: "女", other: "其他" },
};

export function ft(lang, key) {
  const table = FIELDS[lang] || FIELDS.en;
  return table[key] !== undefined ? table[key] : FIELDS.en[key];
}