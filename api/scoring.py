from typing import List, Dict, Any
from datetime import datetime, timedelta
import math

class ScoringService:
    def __init__(self):
        self.mode_weights = {
            "lounge": {
                "cloud": 0.35,
                "temp": 0.20,
                "uv": 0.15,
                "wind": -0.15,
                "precip": -0.15
            },
            "swim": {
                "cloud": 0.30,
                "temp": 0.25,
                "uv": 0.20,
                "wind": -0.10,
                "precip": -0.15
            },
            "surf": {
                "cloud": 0.25,
                "temp": 0.10,
                "uv": 0.10,
                "wind": -0.20,
                "precip": -0.15,
                "swell": 0.30
            }
        }
    
    def score_windows(self, weather_data: List[Dict[str, Any]], mode: str, preferences: Dict[str, Any], window_hours: float) -> List[Dict[str, Any]]:
        """Score all possible windows and return ranked list"""
        
        windows = []
        weights = self.mode_weights.get(mode, self.mode_weights["lounge"])
        
        # Extract preferences
        pref_temp = preferences.get("prefTempF", 75)
        max_wind = preferences.get("maxWindMph", 15)
        uv_good = preferences.get("uvGood", 6)
        
        # Generate all possible windows
        window_hours_int = int(window_hours)
        for i in range(len(weather_data) - window_hours_int + 1):
            window_data = weather_data[i:i + window_hours_int]
            
            # Calculate window metrics
            avg_temp = sum(hour["temperature_2m"] for hour in window_data) / len(window_data)
            avg_cloud = sum(hour["cloud_cover"] for hour in window_data) / len(window_data)
            avg_uv = sum(hour["uv_index"] for hour in window_data) / len(window_data)
            avg_wind = sum(hour["wind_speed_10m"] for hour in window_data) / len(window_data)
            max_precip = max(hour["precipitation_probability"] for hour in window_data)
            
            # Convert temperature to Fahrenheit
            temp_f = (avg_temp * 9/5) + 32
            wind_mph = avg_wind * 2.237  # m/s to mph
            
            # Apply hard filters
            if self._should_filter_window(window_data, pref_temp, max_wind, uv_good):
                continue
            
            # Calculate score
            score = self._calculate_score(
                cloud_pct=avg_cloud,
                temp_f=temp_f,
                pref_temp=pref_temp,
                uv=avg_uv,
                uv_good=uv_good,
                wind_mph=wind_mph,
                max_wind=max_wind,
                precip_prob=max_precip,
                weights=weights,
                mode=mode,
                window_data=window_data
            )
            
            # Generate reasons
            reasons = self._generate_reasons(
                score, avg_cloud, temp_f, pref_temp, avg_uv, wind_mph, max_precip, mode
            )
            
            windows.append({
                "score": score,
                "start": window_data[0]["time"],
                "end": window_data[-1]["time"],
                "summary": {
                    "tempF": round(temp_f, 1),
                    "uv": round(avg_uv, 1),
                    "windMph": round(wind_mph, 1),
                    "cloudPct": round(avg_cloud, 1)
                },
                "reasons": reasons
            })
        
        # Sort by score (highest first)
        windows.sort(key=lambda x: x["score"], reverse=True)
        
        return windows
    
    def _should_filter_window(self, window_data: List[Dict[str, Any]], pref_temp: float, max_wind: float, uv_good: float) -> bool:
        """Apply hard filters to determine if window should be excluded"""
        
        for hour in window_data:
            temp_f = (hour["temperature_2m"] * 9/5) + 32
            wind_mph = hour["wind_speed_10m"] * 2.237
            
            # Hard filters
            if (hour["cloud_cover"] > 60 or  # Too cloudy
                hour["precipitation_probability"] > 20 or  # High rain chance
                wind_mph > max_wind or  # Too windy
                abs(temp_f - pref_temp) > 15):  # Temperature too far from preference
                return True
        
        return False
    
    def _calculate_score(self, cloud_pct: float, temp_f: float, pref_temp: float, uv: float, 
                        uv_good: float, wind_mph: float, max_wind: float, precip_prob: float,
                        weights: Dict[str, float], mode: str, window_data: List[Dict[str, Any]]) -> float:
        """Calculate the score for a window"""
        
        # Base scoring components
        cloud_score = 1 - (cloud_pct / 100)
        temp_score = max(0, 1 - abs(temp_f - pref_temp) / 15)
        uv_score = min(1, uv / uv_good)
        wind_score = max(0, 1 - wind_mph / max_wind)
        precip_score = 1 - (precip_prob / 100)
        
        # Calculate base score
        score = (weights.get("cloud", 0) * cloud_score +
                weights.get("temp", 0) * temp_score +
                weights.get("uv", 0) * uv_score +
                weights.get("wind", 0) * wind_score +
                weights.get("precip", 0) * precip_score)
        
        # Mode-specific adjustments
        if mode == "swim":
            # Swimming prefers warmer water and calmer conditions
            if temp_f >= 75:
                score += 0.1
            if wind_mph < 8:
                score += 0.1
                
        elif mode == "surf":
            # Add swell score (stub for now)
            swell_score = 0.5  # Neutral for now
            score += weights.get("swell", 0) * swell_score
        
        # Marine layer heuristic
        marine_bonus = self._calculate_marine_layer_bonus(window_data)
        score += marine_bonus
        
        # Normalize to 0-10 scale
        return max(0, min(10, score * 10))
    
    def _calculate_golden_hour_bonus(self, window_data: List[Dict[str, Any]]) -> float:
        """Calculate golden hour bonus for photo mode"""
        # This would need sunrise/sunset data to be accurate
        # For now, return a small bonus for early morning/late afternoon
        hour = datetime.fromisoformat(window_data[0]["time"].replace("Z", "+00:00")).hour
        if 6 <= hour <= 8 or 17 <= hour <= 19:
            return 0.3
        return 0
    
    def _calculate_marine_layer_bonus(self, window_data: List[Dict[str, Any]]) -> float:
        """Calculate marine layer clearing bonus"""
        # Simple heuristic: if conditions improve throughout the window
        if len(window_data) < 2:
            return 0
        
        start_cloud = window_data[0]["cloud_cover"]
        end_cloud = window_data[-1]["cloud_cover"]
        start_temp = window_data[0]["temperature_2m"]
        end_temp = window_data[-1]["temperature_2m"]
        
        # If clouds decrease and temp increases significantly
        if (start_cloud - end_cloud > 20 and end_temp - start_temp > 2):
            return 0.1
        
        return 0
    
    def _generate_reasons(self, score: float, cloud_pct: float, temp_f: float, pref_temp: float,
                         uv: float, wind_mph: float, precip_prob: float, mode: str) -> List[str]:
        """Generate human-readable reasons for the score"""
        reasons = []
        
        if cloud_pct < 20:
            reasons.append("clear skies")
        elif cloud_pct < 40:
            reasons.append("mostly sunny")
        
        if abs(temp_f - pref_temp) < 5:
            reasons.append("perfect temperature")
        elif temp_f > pref_temp:
            reasons.append("warm weather")
        else:
            reasons.append("cool weather")
        
        if uv > 6:
            reasons.append("high UV")
        elif uv > 3:
            reasons.append("good UV")
        
        if wind_mph < 5:
            reasons.append("calm winds")
        elif wind_mph < 10:
            reasons.append("light breeze")
        
        if precip_prob < 10:
            reasons.append("no rain expected")
        elif precip_prob < 20:
            reasons.append("low rain chance")
        
        if mode == "swim":
            if temp_f >= 75:
                reasons.append("warm water")
            if wind_mph < 8:
                reasons.append("calm seas")
        
        if mode == "surf":
            reasons.append("surf conditions")
        
        return reasons[:3]  # Limit to top 3 reasons
