import os

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR

ocr = None


def get_ocr():
    global ocr

    if ocr is None:
        ocr = PaddleOCR(
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            enable_mkldnn=False,
        )

    return ocr


def extract_text(file_path: str):
    ocr_instance = get_ocr()

    result = ocr_instance.predict(file_path)

    texts = []

    for res in result:
        texts.extend(res["rec_texts"])

    return texts