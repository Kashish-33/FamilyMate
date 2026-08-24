import json
from google import genai
from app.core.config import GEMINI_API_KEY
from app.schemas.document import ExtractedDocument
from app.schemas.medicine import ExtractedMedicine


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def extract_document_data(text: list[str]):

    ocr_text = "\n".join(text)

    prompt = f"""
You are a document understanding assistant.

Analyze the OCR text below.

Identify:
1. The document type.
2. Important fields and their values.
3. Do not invent information that is not present in the text.

Return ONLY JSON in exactly this structure:

{{
    "document_type": "string",
    "extracted_fields": {{
        "field_name": "field_value"
    }}
}}

The key MUST be named "extracted_fields".
Do not use "fields", "data", or any other name.

OCR TEXT:
{ocr_text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
        "response_mime_type": "application/json"
        }
    )

    data = json.loads(response.text)


    validated_data = ExtractedDocument.model_validate(data)

    return validated_data



if __name__ == "__main__":

    test_text = [
        "Name: Kashish Gupta",
        "DOB: 10/05/2004",
        "Document: Test Document"
    ]

    result = extract_document_data(test_text)

    print(result)


def extract_medicine_data(text: list[str]):

    ocr_text = "\n".join(text)

    prompt = f"""
You are a medicine information extraction assistant.

Analyze the OCR text below.

Identify:
1. The medicine name.
2. Important medicine-related fields and their values.
3. Do not invent information that is not present in the text.

Return ONLY JSON in exactly this structure:

{{
    "medicine_name": "string",
    "extracted_fields": {{
        "field_name": "field_value"
    }}
}}

The key MUST be named "extracted_fields".
Do not use "fields", "data", or any other name.

OCR TEXT:
{ocr_text}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        }
    )

    data = json.loads(response.text)

    validated_data = ExtractedMedicine.model_validate(data)

    return validated_data

if __name__ == "__main__":

    test_text = [
        "Paracetamol 650 mg",
        "Take one tablet twice daily",
        "Expiry Date: 15/08/2027"
    ]

    result = extract_medicine_data(test_text)

    print(result)