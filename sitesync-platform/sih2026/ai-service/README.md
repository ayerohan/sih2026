# SiteSync AI Service

Small FastAPI service that turns an unstructured construction progress report and supplied schedule activities into confidence-scored events. It does not access PostgreSQL or make business decisions.

## Setup

```powershell
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `OPENROUTER_API_KEY` in `.env`. The remaining defaults are:

```env
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openrouter/free
AI_SERVICE_NAME=sitesync-ai
```

Never expose the API key to React or commit `.env`.

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

## Health check

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Response:

```json
{"status":"UP","service":"sitesync-ai"}
```

## Process a report

`POST http://localhost:8000/process` requires an OpenRouter key and accepts:

```json
{
  "report": "Pipe laying from KP 10 to KP 11 was completed today.",
  "reportDate": "2026-09-11",
  "scheduleActivities": [
    {
      "id": 25,
      "activityCode": "PIPE-L6-001",
      "activityName": "Lay 12 inch Pipe KP 10-11",
      "discipline": "PIPING",
      "location": "KP 10-11",
      "plannedStart": "2026-09-08",
      "plannedFinish": "2026-09-15"
    }
  ]
}
```

Response shape:

```json
{
  "events": [
    {
      "activityDescription": "Pipe laying",
      "discipline": "PIPING",
      "location": "KP 10-11",
      "status": "COMPLETED",
      "progressPercentage": 100,
      "eventDate": "2026-09-11",
      "extractionConfidence": 0.98,
      "matchedActivityId": 25,
      "matchConfidence": 0.97
    }
  ],
  "processingStatus": "PROCESSED",
  "model": "openrouter/free"
}
```

The service clears matches that are not present in `scheduleActivities`, and the backend remains responsible for persistence, confidence thresholds, and actual-progress updates.
