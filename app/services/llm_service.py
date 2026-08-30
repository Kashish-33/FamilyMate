import json
import logging
from fastapi import HTTPException
from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY
from app.schemas.document import ExtractedDocument
from app.schemas.medicine import ExtractedMedicine

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def extract_document_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> ExtractedDocument:
    prompt = """You are a document understanding assistant.

Analyze the uploaded document (image or PDF).

Identify:
1. The document type (e.g., Passport, Aadhaar, Driver License, Invoice, Medical Report, Marksheet, etc.).
2. Important fields and their values (such as document number, holder name, dates, issuing authority, etc.).
3. Do not invent information that is not present in the document.

Return ONLY JSON in exactly this structure:

{
    "document_type": "string",
    "extracted_fields": {
        "field_name": "field_value"
    }
}

The key MUST be named "extracted_fields".
Do not use "fields", "data", or any other name.
All values inside "extracted_fields" must be strings.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
    except Exception as exc:
        logger.error(f"Gemini API call failed during document extraction: {exc}")
        raise HTTPException(
            status_code=502,
            detail=f"AI service extraction failed: {exc}"
        )

    try:
        raw_text = response.text or "{}"
        data = json.loads(raw_text)

        if not isinstance(data, dict):
            raise ValueError("Parsed output is not a JSON object")

        if not data.get("document_type"):
            data["document_type"] = "Unknown Document"

        fields = data.get("extracted_fields")
        if isinstance(fields, dict):
            data["extracted_fields"] = {
                str(k): str(v) if v is not None else ""
                for k, v in fields.items()
            }
        else:
            data["extracted_fields"] = {}

        return ExtractedDocument.model_validate(data)
    except Exception as exc:
        logger.error(f"Failed to parse document extraction JSON: {exc}, raw: {response.text}")
        raise HTTPException(
            status_code=502,
            detail="Failed to parse AI extraction output."
        )


def extract_medicine_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> ExtractedMedicine:
    prompt = """You are a medicine information extraction assistant.

Analyze the uploaded medicine image (package, blister strip, prescription, bottle label).

Identify:
1. The medicine name.
2. Important medicine-related fields and their values (such as dosage, frequency, expiry_date in MM/YYYY or DD/MM/YYYY format, composition, manufacturer, etc.).
3. Do not invent information that is not present in the image.

Return ONLY JSON in exactly this structure:

{
    "medicine_name": "string",
    "extracted_fields": {
        "field_name": "field_value"
    }
}

The key MUST be named "extracted_fields".
Do not use "fields", "data", or any other name.
All values inside "extracted_fields" must be strings.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
    except Exception as exc:
        logger.error(f"Gemini API call failed during medicine extraction: {exc}")
        raise HTTPException(
            status_code=502,
            detail=f"AI service extraction failed: {exc}"
        )

    try:
        raw_text = response.text or "{}"
        data = json.loads(raw_text)

        if not isinstance(data, dict):
            raise ValueError("Parsed output is not a JSON object")

        if not data.get("medicine_name"):
            data["medicine_name"] = "Unknown Medicine"

        fields = data.get("extracted_fields")
        if isinstance(fields, dict):
            data["extracted_fields"] = {
                str(k): str(v) if v is not None else ""
                for k, v in fields.items()
            }
        else:
            data["extracted_fields"] = {}

        return ExtractedMedicine.model_validate(data)
    except Exception as exc:
        logger.error(f"Failed to parse medicine extraction JSON: {exc}, raw: {response.text}")
        raise HTTPException(
            status_code=502,
            detail="Failed to parse AI extraction output."
        )