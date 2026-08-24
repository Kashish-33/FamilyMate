import json

from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY
from app.services.agent_tools import get_family_members, get_medicines, get_medicine_reminders, get_documents, get_notifications


client = genai.Client(
    api_key=GEMINI_API_KEY
)




def chat_with_agent(
    user_message: str,
    user_id: int,
    db
):

    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="get_family_members",
                    description=(
                        "Use this function ONLY when the user asks about family "
                        "members, their names, or their relationships to the user."
                    ),
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={}
                    )
                ),

                types.FunctionDeclaration(
                    name="get_medicines",
                    description=(
                        "Use this function when the user asks about medicines, "
                        "medications, prescribed medicines, current medicines, "
                        "or which medicines belong to family members. "
                        "Returns the medicine name, dosage, frequency, and expiry date."
                    ),
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={}
                    )
                ),

                types.FunctionDeclaration(
                    name="get_medicine_reminders",
                    description="Get medicines that are expiring soon for the current user's family.",
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={}
                    )
                ),


                types.FunctionDeclaration(
                    name="get_documents",
                    description=(
                        "Use this function when the user asks about their documents, "
                        "uploaded documents, document details, document expiry dates, "
                        "or which documents belong to their family members."
                    ),
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={}
                    )
                ),

                types.FunctionDeclaration(
                    name="get_notifications",
                    description=(
                        "Use this function when the user asks about notifications, "
                        "alerts, reminders, unread notifications, or messages generated "
                        "by the Family Copilot system."
                    ),
                    parameters=types.Schema(
                        type="OBJECT",
                        properties={}
                    )
                )
            ]
        )
    ]

    # First Gemini call
    response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=user_message,
    config=types.GenerateContentConfig(
        tools=tools,
        system_instruction=(
            "You are the AI assistant for AI Family Copilot. "
            "Always use the provided tool data as the source of truth. "
            "Never invent, assume, or add information that is not present "
            "in the tool response. If a field is missing, say that the "
            "information is not available."
        )
    )
)


    function_call = None

    for candidate in response.candidates:
        for part in candidate.content.parts:

            if part.function_call:
                function_call = part.function_call
                break

        if function_call:
            break


    if function_call is None:
        return response.text


    if function_call.name == "get_family_members":

        result = get_family_members(
            user_id=user_id,
            db=db
        )



    elif function_call.name == "get_medicines":

        result = get_medicines(
            user_id=user_id,
            db=db
        )


    elif function_call.name == "get_medicine_reminders":

        result = get_medicine_reminders(
            user_id=user_id,
            db=db
        )

    elif function_call.name == "get_documents":

        result = get_documents(
            user_id=user_id,
            db=db
        )

    elif function_call.name == "get_notifications":

        result = get_notifications(
            user_id=user_id,
            db=db
        )


    else:
        return "I don't know how to perform that action."



    print("FIRST FUNCTION CALL:", function_call.name)
    print("FIRST FUNCTION ARGS:", function_call.args)
    print("TOOL RESULT:", result)




    function_response_part = types.Part(
        function_response=types.FunctionResponse(
            name=function_call.name,
            response={
                "result": result
            }
        )
    )

    tool_result_text = json.dumps(result, default=str)

    final_response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=f"""
    User's question:
    {user_message}

    Verified data returned by the backend tool:
    {tool_result_text}

    Answer the user's question using ONLY the verified backend data above.

    Do not call any tools.
    Do not invent information.
    If some information is missing, say that it is not available.
    Return only the natural-language answer to the user.
    """,
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are the AI assistant for AI Family Copilot. "
                "The backend data provided to you is the source of truth. "
                "Never invent or assume information."
            )
        )
    )

    print("FINAL GEMINI TEXT:", final_response.text)

    return {
        "message": final_response.text
    }
