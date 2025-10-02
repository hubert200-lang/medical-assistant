
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, analysis, research
from app.chains.chat_chain import get_chat_chain
from app.models.schemas import ChatRequest, ChatResponse
from datetime import datetime

app = FastAPI(
    title="Medical AI Assistant",
    description="A production-ready AI-powered medical assistant.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(research.router, prefix="/api")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    chain = get_chat_chain(request.language)
    response = await chain.ainvoke({"question": request.message})
    return ChatResponse(
        response=response.content,
        language=request.language,
        timestamp=datetime.utcnow().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
