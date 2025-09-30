import pytest
from scoring import ScoringService

def test_lounge_scoring():
    """Test lounge mode scoring"""
    service = ScoringService()
    
    # Mock weather data
    weather_data = [
        {
            "time": "2024-01-01T12:00:00Z",
            "temperature_2m": 25,  # 77°F
            "cloud_cover": 20,
            "precipitation_probability": 5,
            "wind_speed_10m": 3,  # ~6.7 mph
            "uv_index": 6,
            "relative_humidity_2m": 60
        },
        {
            "time": "2024-01-01T13:00:00Z", 
            "temperature_2m": 26,
            "cloud_cover": 15,
            "precipitation_probability": 3,
            "wind_speed_10m": 2.5,
            "uv_index": 7,
            "relative_humidity_2m": 55
        },
        {
            "time": "2024-01-01T14:00:00Z",
            "temperature_2m": 27,
            "cloud_cover": 10,
            "precipitation_probability": 2,
            "wind_speed_10m": 2,
            "uv_index": 8,
            "relative_humidity_2m": 50
        }
    ]
    
    preferences = {
        "prefTempF": 75,
        "maxWindMph": 15,
        "uvGood": 6
    }
    
    windows = service.score_windows(
        weather_data=weather_data,
        mode="lounge",
        preferences=preferences,
        window_hours=3
    )
    
    assert len(windows) == 1  # Only one 3-hour window possible
    assert windows[0]["score"] > 7  # Should be a good score
    assert "clear skies" in windows[0]["reasons"]

def test_hard_filters():
    """Test that hard filters work correctly"""
    service = ScoringService()
    
    # Bad weather data
    weather_data = [
        {
            "time": "2024-01-01T12:00:00Z",
            "temperature_2m": 5,  # 41°F - too cold
            "cloud_cover": 80,   # Too cloudy
            "precipitation_probability": 30,  # High rain
            "wind_speed_10m": 10,  # ~22 mph - too windy
            "uv_index": 2,
            "relative_humidity_2m": 90
        }
    ]
    
    preferences = {
        "prefTempF": 75,
        "maxWindMph": 15,
        "uvGood": 6
    }
    
    windows = service.score_windows(
        weather_data=weather_data,
        mode="lounge", 
        preferences=preferences,
        window_hours=1
    )
    
    assert len(windows) == 0  # Should be filtered out

def test_photo_mode():
    """Test photo mode scoring"""
    service = ScoringService()
    
    weather_data = [
        {
            "time": "2024-01-01T18:00:00Z",  # Evening
            "temperature_2m": 22,
            "cloud_cover": 25,  # Light clouds good for photos
            "precipitation_probability": 5,
            "wind_speed_10m": 2,
            "uv_index": 3,
            "relative_humidity_2m": 60
        }
    ]
    
    preferences = {
        "prefTempF": 75,
        "maxWindMph": 15,
        "uvGood": 6
    }
    
    windows = service.score_windows(
        weather_data=weather_data,
        mode="photo",
        preferences=preferences,
        window_hours=1
    )
    
    assert len(windows) == 1
    assert "great for photos" in windows[0]["reasons"]

def test_edge_cases():
    """Test edge cases in scoring"""
    service = ScoringService()
    
    # All cloudy data
    weather_data = [
        {
            "time": "2024-01-01T12:00:00Z",
            "temperature_2m": 20,
            "cloud_cover": 100,
            "precipitation_probability": 0,
            "wind_speed_10m": 1,
            "uv_index": 1,
            "relative_humidity_2m": 80
        }
    ]
    
    preferences = {
        "prefTempF": 70,
        "maxWindMph": 20,
        "uvGood": 5
    }
    
    windows = service.score_windows(
        weather_data=weather_data,
        mode="lounge",
        preferences=preferences,
        window_hours=1
    )
    
    # Should be filtered out due to high cloud cover
    assert len(windows) == 0

