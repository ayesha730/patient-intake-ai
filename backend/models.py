from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from database import Base


class Doctor(Base):
    _tablename_ = "doctors"
    id = Column(Integer, primary_key=True)
    hospital_id = Column(String, unique=True, nullable=False)
    name = Column(String)
    specialty = Column(String)
    degree = Column(String)
    level = Column(String)
    experience_years = Column(Integer)
    fee = Column(Float)
    rating = Column(Float, default=0)
    language = Column(String, default="English")


class Patient(Base):
    _tablename_ = "patients"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    language = Column(String, default="English")
    consent_given = Column(Boolean, default=False)


class Appointment(Base):
    _tablename_ = "appointments"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    slot_time = Column(DateTime)
    token_number = Column(Integer)
    original_text = Column(Text)      # patient's own words
    original_language = Column(String)
    summary = Column(Text)            # AI summary
    confidence = Column(String)       # high / medium / low
    missing_info = Column(Text)
    urgency = Column(String, default="normal")  # normal / urgent
    needs_review = Column(Boolean, default=False)
    review_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)