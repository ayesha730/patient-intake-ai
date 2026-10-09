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