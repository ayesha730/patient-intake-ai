import os
import requests
import json

# AMD vLLM instance configuration
AMD_VLLM_URL = os.getenv("AMD_VLLM_URL", "http://localhost:8000/v1/chat/completions")
AMD_API_KEY = os.getenv("AMD_API_KEY", "")

def generate_clinical_summary(patient_data: dict) -> dict:
    """
    Sends patient intake details to AMD vLLM server 
    to generate a structured clinical summary, medicines, and diet plan in JSON format.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {AMD_API_KEY}" if AMD_API_KEY else ""
    }
    
    prompt = f"""You are AegisCare, a precise clinical AI assistant.
Analyze the following patient intake details:

- Patient Name: {patient_data.get('name', 'N/A')}
- Age: {patient_data.get('age', 'N/A')}
- Chief Symptoms: {patient_data.get('symptoms', 'N/A')}
- Medical History: {patient_data.get('history', 'None reported')}

Provide a response strictly in valid JSON format with the following keys:
1. "summary": A concise clinical summary for the doctor.
2. "medicines": A list of suggested OTC/general medicines with fields "id", "name", "dosage", and "status" set to "pending".
3. "diet_plan": A list of recommended foods or dietary precautions with fields "id", "recommendation", and "status" set to "pending".

Example Output Format:
{{
  "summary": "Patient presents with mild fever and fatigue.",
  "medicines": [
    {{"id": "m1", "name": "Paracetamol 500mg", "dosage": "1-0-1 after meals", "status": "pending"}}
  ],
  "diet_plan": [
    {{"id": "d1", "recommendation": "Increase fluid intake and rest", "status": "pending"}}
  ]
}}"""

    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct",
        "messages": [
            {"role": "system", "content": "You are a helpful and precise medical AI assistant. Always respond with raw valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 500
    }

    try:
        response = requests.post(AMD_VLLM_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # LLM response content
        ai_response_text = data["choices"][0]["message"]["content"]
        
        # Parse JSON output from LLM
        return json.loads(ai_response_text)
        
    except Exception as e:
        # Fallback response in case server is unavailable or JSON parsing fails
        return {
            "summary": f"Patient {patient_data.get('name', 'N/A')} reports symptoms: {patient_data.get('symptoms', 'N/A')}.",
            "medicines": [
                {"id": "m1", "name": "Paracetamol 500mg", "dosage": "1-0-1 after food", "status": "pending"}
            ],
            "diet_plan": [
                {"id": "d1", "recommendation": "Warm liquids and light meals", "status": "pending"}
            ],
            "error_note": f"Fallback applied due to connection issue: {str(e)}"
        }