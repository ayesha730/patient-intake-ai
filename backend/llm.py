import os
import requests

# AMD vLLM instance configuration
# Agni server IP/URL environment variable se uthayega, warna default localhost par dekhega
AMD_VLLM_URL = os.getenv("AMD_VLLM_URL", "http://localhost:8000/v1/chat/completions")
AMD_API_KEY = os.getenv("AMD_API_KEY", "")

def generate_clinical_summary(patient_data: dict) -> str:
    """
    Sends patient intake details to AMD vLLM server 
    to generate a structured clinical summary for doctors.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AMD_API_KEY}" if AMD_API_KEY else ""
    }
    
    prompt = f"""You are AegisCare, a precise clinical AI assistant.
Summarize the following patient intake details clearly for the doctor:

- Patient Name: {patient_data.get('name', 'N/A')}
- Age: {patient_data.get('age', 'N/A')}
- Chief Symptoms: {patient_data.get('symptoms', 'N/A')}
- Medical History: {patient_data.get('history', 'None reported')}

Provide a concise, professional summary highlighting potential concerns and priority areas."""

    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful and precise medical AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 300
    }

    try:
        response = requests.post(AMD_VLLM_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error connecting to AMD LLM: {str(e)}"