# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json

from pydantic import BaseModel
from fireworks import LLM
from typing import Optional

app = FastAPI()

origins = [
    "http://localhost:5173",  # or wherever your frontend runs
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # or ["*"] to allow all (not recommended in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    model: str
    prompt: str
    response_id: Optional[str] = None


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

@app.post("/chat_request")
def chat_request(chatRequest: ChatRequest):

    llm = LLM(
        model=chatRequest.model,
        deployment_type="serverless"
    )

    response = llm.responses.create(
        input=chatRequest.prompt,
        # tools=[{"type": "sse", "server_url": "https://gitmcp.io/docs"}]
    )
    
    initial_response_id = response.id
    formmated_response = response.output[-1].content[0].text.split("</think>")[-1]
    # Remove extra newline
    formmated_response = formmated_response.replace("\n\n", "\n")

    return {"response": formmated_response, "response_id": initial_response_id}


@app.get("/chat_request1")
def chat_request1(model: str, prompt: str):
    def event_generator():
        llm = LLM(
            model=model,
            deployment_type="serverless"
        )

        stream = llm.responses.create(
            input=prompt,
            stream=True,
            # tools=[{"type": "sse", "server_url": "https://gitmcp.io/docs"}]
        )
        
        # formmated_response = response.output[-1].content[0].text.split("</think>")[-1]
        # Remove extra newline
        # formmated_response = formmated_response.replace("\n\n", "\n")

        completed_thinking_stage = False
        try:
            for chunk in stream:
                print(chunk)
                if chunk.type == "response.created":
                    yield f"data: {json.dumps({'response_id': chunk.response.id})}\n\n"

                if chunk.type == "response.output_text.delta":

                    if completed_thinking_stage:
                        yield f"data: {json.dumps({'delta': chunk.delta})}\n\n"

                    if '</think>' in chunk.delta:
                        completed_thinking_stage = True

        except Exception as e:
            print("Error in SSE stream:", e)
            # traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")



@app.post("/chat_request_continued")
def chat_request_continued(chatRequest: ChatRequest):

    llm = LLM(
        model=chatRequest.model,
        deployment_type="serverless"
    )

    response = llm.responses.create(
        input=chatRequest.prompt,
        previous_response_id=chatRequest.response_id,
        # tools=[{"type": "sse", "server_url": "https://gitmcp.io/docs"}]
    )
    
    formmated_response = response.output[-1].content[0].text.split("</think>")[-1]
    
    # Remove extra newline
    formmated_response = formmated_response.replace("\n\n", "\n")

    return {"response": formmated_response}


@app.get("/chat_request_continued1")
def chat_request_continued1(model: str, prompt: str, response_id: str):
    def event_generator():

        llm = LLM(
            model=model,
            deployment_type="serverless"
        )

        stream = llm.responses.create(
            input=prompt,
            stream=True,
            previous_response_id=response_id,
            # tools=[{"type": "sse", "server_url": "https://gitmcp.io/docs"}]
        )

        completed_thinking_stage = False
        try:
            for chunk in stream:
                if chunk.type == "response.output_text.delta":
                    if completed_thinking_stage:
                        yield f"data: {json.dumps({'delta': chunk.delta})}\n\n"

                    if '</think>' in chunk.delta:
                        completed_thinking_stage = True

        except Exception as e:
            print("Error in SSE stream:", e)
            # traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")