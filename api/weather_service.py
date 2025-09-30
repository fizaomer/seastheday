import httpx
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os

class WeatherService:
    def __init__(self):
        self.base_url = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1")
        self.cache = {}  # Simple in-memory cache
    
    async def get_weather_data(self, lat: float, lon: float, start_date: str, end_date: str) -> Optional[List[Dict[str, Any]]]:
        """Fetch hourly weather data from Open-Meteo API"""
        
        # Check cache first
        cache_key = f"{lat}_{lon}_{start_date}_{end_date}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            async with httpx.AsyncClient() as client:
                # Calculate date range
                start_dt = datetime.fromisoformat(start_date)
                end_dt = datetime.fromisoformat(end_date)
                days = (end_dt - start_dt).days + 1
                
                # Open-Meteo API call
                params = {
                    "latitude": lat,
                    "longitude": lon,
                    "hourly": [
                        "temperature_2m",
                        "cloud_cover",
                        "precipitation_probability", 
                        "wind_speed_10m",
                        "uv_index",
                        "relative_humidity_2m"
                    ],
                    "daily": ["sunrise", "sunset"],
                    "timezone": "auto",
                    "forecast_days": min(days, 10)  # Open-Meteo limit
                }
                
                response = await client.get(f"{self.base_url}/forecast", params=params)
                response.raise_for_status()
                data = response.json()
                
                # Process hourly data
                hourly_data = []
                times = data.get("hourly", {}).get("time", [])
                temps = data.get("hourly", {}).get("temperature_2m", [])
                clouds = data.get("hourly", {}).get("cloud_cover", [])
                precip = data.get("hourly", {}).get("precipitation_probability", [])
                wind = data.get("hourly", {}).get("wind_speed_10m", [])
                uv = data.get("hourly", {}).get("uv_index", [])
                humidity = data.get("hourly", {}).get("relative_humidity_2m", [])
                
                for i, time_str in enumerate(times):
                    if i < len(temps):
                        hourly_data.append({
                            "time": time_str,
                            "temperature_2m": temps[i],
                            "cloud_cover": clouds[i] if i < len(clouds) else 0,
                            "precipitation_probability": precip[i] if i < len(precip) else 0,
                            "wind_speed_10m": wind[i] if i < len(wind) else 0,
                            "uv_index": uv[i] if i < len(uv) else 0,
                            "relative_humidity_2m": humidity[i] if i < len(humidity) else 0,
                        })
                
                # Cache the result
                self.cache[cache_key] = hourly_data
                
                return hourly_data
                
        except Exception as e:
            print(f"Weather API error: {e}")
            return None
    
    def clear_cache(self):
        """Clear the weather cache"""
        self.cache.clear()

