import os

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=False
)


def extract_text(file_path: str):
    result = ocr.predict(file_path)

    texts = []

    for res in result:
        texts.extend(res["rec_texts"])

    return texts
