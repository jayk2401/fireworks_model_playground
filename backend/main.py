# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from fireworks import LLM

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


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

@app.post("/chat_request")
def chat_request(chatRequest: ChatRequest):

    llm = LLM(
        model=chatRequest.model,
        deployment_type="serverless"
    )

    # response = llm.chat.completions.create(
    #     messages=[{
    #         "role": "system",
    #         "content": chatRequest.prompt,
    #     }],
    # )

    # formmated_response = response.choices[0].message.content.split("</think>")[1].strip()


    response = llm.responses.create(
        input=chatRequest.prompt,
        # tools=[{"type": "sse", "server_url": "https://gitmcp.io/docs"}]
    )
    
    initial_response_id = response.id
    formmated_response = response.output[-1].content[0].text.split("</think>")[-1]

    return {"response": formmated_response, "response_id": initial_response_id}
