from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from database import Base


class Doctor(Base):
    __tablename__ = "doctors"
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
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    language = Column(String, default="English")
    consent_given = Column(Boolean, default=False)
    consent_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    slot_time = Column(DateTime)
    token_number = Column(Integer)
    original_text = Column(Text)          # patient's own words
    original_language = Column(String)
    duration = Column(String)
    severity = Column(String)
    summary = Column(Text)                # AI summary, filled in after AMD is live
    confidence = Column(String)           # pending / high / medium / low
    missing_info = Column(Text)
    urgency = Column(String, default="normal")
    needs_review = Column(Boolean, default=False)
    review_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True)
    medicines = Column(Text)              # what the doctor prescribed
    ai_suggestion = Column(Text)          # filled in later, for comparison
    notes = Column(Text)