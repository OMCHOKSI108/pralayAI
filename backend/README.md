# PralayAI Backend

> The robust, high-performance FastAPI backend powering PralayAI.

This service manages PostgreSQL data persistence (conversations, messages), interfaces with the PralayAI Inference Engine, and ensures secure, filtered interactions.

---

## Features

* **High Performance:** Built on FastAPI for asynchronous, rapid response times.
* **Robust Storage:** PostgreSQL integration for reliable conversation and message state management.
* **Inference Integration:** Seamless API client connecting to the external LLM/Inference API.
* **Safety First:** Built-in cybersecurity safety filter to sanitize inputs and outputs.
* **Monitoring & User Insights:** Dedicated health check and user feedback endpoints.

---

## Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.8+**
* **PostgreSQL** (running locally or remotely)
* **[uv](https://github.com/astral-sh/uv)** (Extremely fast Python package installer and resolver)

---

## Configuration

Create a `.env` file in the **root directory** of your project and configure the following environment variables:

```env
# Application Settings
APP_NAME="PralayAI Backend"
APP_ENV=local
APP_HOST=0.0.0.0
APP_PORT=8000
REQUEST_TIMEOUT_SECONDS=180

# Database Configuration
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pralayai_db

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173

# Inference Engine Settings
INFERENCE_API_URL=http://localhost:5000/generate
# Use the URL below for the hosted Hugging Face space:
# INFERENCE_API_URL=https://omchoksi108-pralayai-inference-api.hf.space/generate

```

> **Note:** Make sure to replace `YOUR_PASSWORD` with your actual PostgreSQL password and ensure the `pralayai_db` database exists before running the application.

---

## Installation & Running Locally

Follow these steps from the root of your project to get the development server running:

**1. Activate your virtual environment:**

```bash
source .venv/bin/activate

```

**2. Install dependencies using `uv`:**

```bash
uv pip install -r backend/requirements.txt

```

**3. Navigate to the backend directory:**

```bash
cd backend

```

**4. Start the development server:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

---

## API Documentation

Once the server is running, FastAPI automatically generates interactive API documentation. You can access it here:

* **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
