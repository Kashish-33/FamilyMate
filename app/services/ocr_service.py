import os

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR


def extract_text(file_path: str):
    ocr = PaddleOCR(
        lang="en",

        # Use lightweight mobile OCR models
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec",

        # Disable unnecessary extra models
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,

        # Keep CPU inference lightweight
        enable_mkldnn=False,
    )

    result = ocr.predict(file_path)

    texts = []

    for res in result:
        texts.extend(res["rec_texts"])

    return texts