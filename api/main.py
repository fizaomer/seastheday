from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
import asyncio
from datetime import datetime, timedelta
import os

from weather_service import WeatherService
from scoring import ScoringService

app = FastAPI(title="Seas the Day API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
weather_service = WeatherService()
scoring_service = ScoringService()

class RecommendationRequest(BaseModel):
    lat: float
    lon: float
    startDate: str
    endDate: str
    mode: str = "lounge"
    prefs: dict
    windowHours: float = 3

class WeatherSummary(BaseModel):
    tempF: float
    uv: float
    windMph: float
    cloudPct: float
    waterTempF: Optional[float] = None
    waveHeightFt: Optional[float] = None

class BeachWindow(BaseModel):
    score: float
    start: str
    end: str
    summary: WeatherSummary
    reasons: List[str]

class RecommendationsResponse(BaseModel):
    windows: List[BeachWindow]
    notes: List[str]

@app.get("/health")
async def health_check():
    print("Health check requested")
    return {"status": "ok", "message": "API is running"}

@app.get("/")
async def root():
    return {"message": "Seas the Day API", "status": "running"}

@app.post("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        # Get weather data
        weather_data = await weather_service.get_weather_data(
            lat=request.lat,
            lon=request.lon,
            start_date=request.startDate,
            end_date=request.endDate
        )
        
        if not weather_data:
            raise HTTPException(status_code=404, detail="No weather data available")
        
        # Score the windows
        windows = scoring_service.score_windows(
            weather_data=weather_data,
            mode=request.mode,
            preferences=request.prefs,
            window_hours=request.windowHours
        )
        
        # Convert to response format
        beach_windows = []
        for window in windows[:5]:  # Top 5 windows
            beach_windows.append(BeachWindow(
                score=window['score'],
                start=window['start'],
                end=window['end'],
                summary=WeatherSummary(
                    tempF=window['summary']['tempF'],
                    uv=window['summary']['uv'],
                    windMph=window['summary']['windMph'],
                    cloudPct=window['summary']['cloudPct'],
                    waterTempF=window['summary'].get('waterTempF'),
                    waveHeightFt=window['summary'].get('waveHeightFt')
                ),
                reasons=window['reasons']
            ))
        
        return RecommendationsResponse(
            windows=beach_windows,
            notes=["Weather data from Open-Meteo", f"Scored {len(windows)} windows"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
