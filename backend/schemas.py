from pydantic import BaseModel
from typing import List, Optional

# --- Doctor Schemas ---
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


# --- AI Suggestions Schemas (Medicine & Diet) ---
class MedicineItem(BaseModel):
    id: str
    name: str
    dosage: str
    status: str = "pending"  # "pending", "approved", "rejected"

class FoodItem(BaseModel):
    id: str
    recommendation: str
    status: str = "pending"  # "pending", "approved", "rejected"

class ClinicalAISummary(BaseModel):
    summary: str
    medicines: List[MedicineItem]
    diet_plan: List[FoodItem]
    doctor_review_status: str = "pending_review"


# --- Patient Intake Schemas ---
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
    summary: Optional[str] = None
    confidence: Optional[str] = None
    urgency: str
    ai_suggestions: Optional[ClinicalAISummary] = None

    model_config = {"from_attributes": True}


# --- Doctor Review Submission Schema ---
class ReviewItemUpdate(BaseModel):
    id: str
    status: str  # "approved" or "rejected"

class DoctorReviewSubmission(BaseModel):
    intake_id: int
    doctor_id: int
    medicines: List[ReviewItemUpdate]
    diet_plan: List[ReviewItemUpdate]