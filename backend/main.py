from fastapi import FastAPI

app = FastAPI(title="Patient Intake API")


@app.get("/")
def home():
    return {"message": "Patient Intake API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}