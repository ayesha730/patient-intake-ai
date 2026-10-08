from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.post("", response_model=schemas.DoctorOut)
def create_doctor(data: schemas.DoctorCreate, db: Session = Depends(get_db)):
    if db.query(models.Doctor).filter_by(hospital_id=data.hospital_id).first():
        raise HTTPException(status_code=400, detail="Hospital ID already registered")
    doctor = models.Doctor(**data.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("", response_model=list[schemas.DoctorOut])
def list_doctors(max_fee: float | None = None, specialty: str | None = None,
                 db: Session = Depends(get_db)):
    query = db.query(models.Doctor)
    if max_fee is not None:
        query = query.filter(models.Doctor.fee <= max_fee)
    if specialty:
        query = query.filter(models.Doctor.specialty == specialty)
    return query.order_by(models.Doctor.rating.desc()).all()