# CoreMatrix AI Service

This is the Python-based microservice for workout form analysis using MediaPipe and FastAPI.

## 🚀 Deployment Instructions

### Option 1: Render (Native Python)
1. Set **Build Command**: `pip install -r requirements.txt`
2. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 5000`
3. Set **Environment Variables**:
   - `PYTHON_SERVICE_URL`: (Self-referencing if needed, but usually just used by the Node.js backend)

### Option 2: Docker
If you are using the provided `Dockerfile` or `docker-compose.yml`, the service will start automatically using:
`uvicorn main:app --host 0.0.0.0 --port 5000`

## 🛠️ Local Development
```bash
cd ai_service
pip install -r requirements.txt
python main.py
```

## ⚠️ Troubleshooting
If you see `ModuleNotFoundError: No module named 'your_application'`, it means your hosting provider is using a default placeholder. **Ensure your Start Command is exactly:**
`uvicorn main:app --host 0.0.0.0 --port 5000`
