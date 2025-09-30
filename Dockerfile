FROM python:3.11-slim

WORKDIR /app

# Copy requirements from api folder
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire api folder
COPY api/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
