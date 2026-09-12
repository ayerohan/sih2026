from fastapi import FastAPI, HTTPException, status

from .config import get_settings
from .llm_client import LLMClient, LLMClientError
from .processor import process_report
from .schemas import HealthResponse, ProcessRequest, ProcessResponse

settings = get_settings()
app = FastAPI(title="SiteSync AI Service", version="0.1.0")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="UP", service=settings.ai_service_name)


@app.post("/process", response_model=ProcessResponse)
async def process(request: ProcessRequest) -> ProcessResponse:
    try:
        client = LLMClient(settings)
        return await process_report(request, client)
    except LLMClientError as exc:
        message = str(exc)
        if message == "OPENROUTER_API_KEY is not configured":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=message,
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned invalid structured data",
        ) from exc
