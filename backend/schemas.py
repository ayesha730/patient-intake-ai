from pydantic import BaseModel


class DoctorCreate(BaseModel):
    hospital_id: str
    name: str
    specialty: str
    degree: str
    level: str
    experience_years: int
    fee: float
    language: str = "English"


class DoctorOut(DoctorCreate):
    id: int
    rating: float

    model_config = {"from_attributes": True}
    
class PatientIntakeCreate(BaseModel):
    name: str
    language: str = "English"
    original_text: str
    original_language: str = "English"
    doctor_id: int
    slot_time: str  # e.g. "2026-10-12T10:30:00"


class IntakeOut(BaseModel):
    id: int
    token_number: int
    doctor_id: int
    slot_time: str
    summary: str | None = None
    confidence: str | None = None
    urgency: str

    model_config = {"from_attributes": True}