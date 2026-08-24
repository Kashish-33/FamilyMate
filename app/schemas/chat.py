from pydantic import BaseModel, field_validator


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty(cls, value: str) -> str:
        message = value.strip()

        if not message:
            raise ValueError("Message cannot be empty")

        return message
