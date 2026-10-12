from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from ai.redflags import check_red_flags
from ai.triage import suggest_specialty, followup_questions, missing_info
import models

router = APIRouter(prefix="/intake", tags=["intake"])

EMERGENCY_MESSAGE = (
    "Your symptoms may be an emergency. Please go to the nearest emergency "
    "department or call 1122 now."
)


class CheckIn(BaseModel):
    problem: str
    duration: str | None = None
    severity: str | None = None


class CheckOut(BaseModel):
    emergency: bool
    matched: list[str]
    followups: list[str]
    suggested_specialty: str


class BookIn(BaseModel):
    name: str
    age: int
    gender: str
    language: str = "English"
    consent: bool
    doctor_id: int
    slot_time: str
    problem: str
    duration: str | None = None
    severity: str | None = None


@router.post("/check", response_model=CheckOut)
def check(data: CheckIn):
    """Runs before booking: red flags, follow-up questions, specialty suggestion. Saves nothing."""
    flags = check_red_flags(data.problem)
    return CheckOut(
        emergency=bool(flags),
        matched=flags,
        followups=followup_questions(data.duration, data.severity),
        suggested_specialty=suggest_specialty(data.problem),
    )


@router.post("")
def book(data: BookIn, db: Session = Depends(get_db)):
    if not data.consent:
        raise HTTPException(status_code=400, detail="Consent is required before booking")

    flags = check_red_flags(data.problem)
    if flags:
        # Staff alert goes here later (staff review queue task)
        raise HTTPException(
            status_code=409,
            detail={"emergency": True, "message": EMERGENCY_MESSAGE, "matched": flags},
        )

    doctor = db.query(models.Doctor).filter_by(id=data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    patient = models.Patient(
        name=data.name, age=data.age, gender=data.gender,
        language=data.language, consent_given=True,
    )
    db.add(patient)
    db.flush()

    token = db.query(models.Appointment).filter_by(doctor_id=doctor.id).count() + 1
    gaps = missing_info(data.duration, data.severity)

    appt = models.Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        slot_time=datetime.fromisoformat(data.slot_time),
        token_number=token,
        original_text=data.problem,
        original_language=data.language,
        duration=data.duration,
        severity=data.severity,
        missing_info=gaps,
        confidence="pending",
        urgency="normal",
        needs_review=bool(gaps),
        review_status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    return {
        "appointment_id": appt.id,
        "token_number": token,
        "doctor": doctor.name,
        "slot_time": data.slot_time,
        "needs_review": appt.needs_review,
        "missing_info": gaps,
    }