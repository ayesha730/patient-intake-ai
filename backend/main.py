from fastapi import FastAPI
from database import engine, Base
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Patient Intake API")


@app.get("/")
def home():
    return {"message": "Patient Intake API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}