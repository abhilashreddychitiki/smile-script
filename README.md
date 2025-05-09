# SmileScript

SmileScript is an AI-powered call summarizer for dental clinics.

## Project Structure

- `backend/`: FastAPI backend
- `frontend/`: Next.js frontend with Tailwind CSS

## Getting Started

### Option 1: Docker Deployment (Recommended)

1. Navigate to the project root directory
2. (Optional) Configure OpenAI API:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `USE_OPENAI_API=true` to use OpenAI for summarization
   - Add your OpenAI API key to `OPENAI_API_KEY`
3. Build and start the containers:
   ```
   docker-compose up -d
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser
5. To stop the containers:
   ```
   docker-compose down
   ```

### Option 2: Local Development

#### Backend

1. Navigate to the project root directory
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. (Optional) Configure OpenAI API:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `USE_OPENAI_API=true` to use OpenAI for summarization
   - Add your OpenAI API key to `OPENAI_API_KEY`
5. Run the backend server:
   ```
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Transcribe and summarize dental clinic calls
- Optional OpenAI API integration for AI-powered summaries
- Store and retrieve call summaries
- Re-run summaries with updated AI models
- Clean, responsive UI built with Tailwind CSS
- Containerized deployment with Docker and Docker Compose
- Environment-based configuration for easy deployment
