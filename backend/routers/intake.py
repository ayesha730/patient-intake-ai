from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai.redflags import check_red_flags

router = APIRouter(prefix="/intake", tags=["intake"])


@router.post("", response_model=schemas.IntakeOut)
def create_intake(data: schemas.PatientIntakeCreate, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter_by(id=data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    flags = check_red_flags(data.original_text)
    if flags:
        raise HTTPException(
            status_code=409,
            detail={
                "emergency": True,
                "message": "Your symptoms may be an emergency. Please go to the nearest emergency department or call 1122 now.",
                "matched": flags,
            },
        )

    patient = models.Patient(name=data.name, language=data.language, consent_given=True)
    db.add(patient)
    db.flush()

    # Token numbers restart per doctor per day
    today_count = db.query(models.Appointment).filter_by(doctor_id=doctor.id).count()

    appt = models.Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        slot_time=datetime.fromisoformat(data.slot_time),
        token_number=today_count + 1,
        original_text=data.original_text,
        original_language=data.original_language,
        summary=None,  # AI summary comes in a later task
        confidence="pending",
        urgency="normal",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    return schemas.IntakeOut(
        id=appt.id,
        token_number=appt.token_number,
        doctor_id=appt.doctor_id,
        slot_time=appt.slot_time.isoformat(),
        summary=appt.summary,
        confidence=appt.confidence,
        urgency=appt.urgency,
    )