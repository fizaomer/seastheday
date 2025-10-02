# Seas the Day 🌊

Find your perfect beach window based on weather forecasts.

## What it is

A web app that tells you the best times to go to the beach. Just pick your location, set your preferences (temperature, wind, etc.), and get personalized recommendations for 2-4 hour windows when the weather will be perfect for your beach activity.

## How it works

- **Location**: Use your current location or search for any beach
- **Preferences**: Choose between lounge, swim, or surf mode and set your ideal conditions
- **Weather**: Pulls real-time data from Open-Meteo API
- **Recommendations**: Shows you the best beach windows with detailed weather info
- **Calendar**: One-click add to Google Calendar

## How to use it

### Local development

```bash
# Clone and run
git clone <repo-url>
cd seas-the-day
./run-local.sh
```

Visit `http://localhost:3000`

### Docker

```bash
docker-compose up
```

## How it was built

**Frontend**: Next.js + TypeScript + Tailwind CSS
- Clean, responsive UI with ocean video background
- Interactive map with nearby beaches
- Smooth animations and snap scrolling
- One-click calendar integration

**Backend**: FastAPI + Python
- Weather data from Open-Meteo API
- Custom scoring algorithm for beach windows
- CORS enabled for cross-origin requests

**Deployment**: 
- Frontend on Vercel
- Backend on Railway
- Docker for local development

## Features

- Real-time weather data (temperature, wind, UV, clouds)
- Activity-specific recommendations (lounge/swim/surf)
- Interactive map with beach discovery
- Google Calendar integration
- Mobile responsive design
- Search for any beach by name

## License

MIT