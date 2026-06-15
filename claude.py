from pathlib import Path
import textwrap

PROJECT_ROOT = Path(__file__).resolve().parent
CLAUDE_DIR = PROJECT_ROOT / ".claude"


def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")
    print(f"✅ Created/Updated: {path.relative_to(PROJECT_ROOT)}")


def main():
    print("🚀 Generating PralayAI Claude workspace files...\n")

    # ============================================================
    # .claude/README.md
    # ============================================================

    write_file(
        CLAUDE_DIR / "README.md",
        """
        # Claude Workspace Guide — PralayAI

        This `.claude/` folder contains project-specific agents, rules, hooks, and skills for working on **PralayAI**.

        Claude must read:

        1. Root `CLAUDE.md`
        2. `.claude/README.md`
        3. Relevant `.claude/rules/*.md`
        4. Relevant `.claude/agents/*.md`
        5. Relevant `.claude/skills/*/README.md`

        before making meaningful code changes.

        ## Project Summary

        **PralayAI** is a defensive cybersecurity AI chatbot project created by **Om Choksi**.

        It includes:

        - React Gemini-clone frontend inside `frontend/`
        - Main FastAPI backend inside `backend/`
        - PostgreSQL database persistence
        - Local CUDA inference API
        - Public Hugging Face Space CPU inference API
        - Fine-tuned merged model on Hugging Face
        - Model operation utilities inside `model_ops/`

        ## Final Architecture

        ```txt
        React Gemini Clone Frontend
                ↓
        Main FastAPI Backend
                ↓
        PostgreSQL Database
                ↓
        Inference API
                ├── Local CUDA API: http://localhost:5000/generate
                └── Public HF Space API: https://omchoksi108-pralayai-inference-api.hf.space/generate
                ↓
        PralayAI Merged Model
                ↓
        Defensive Cybersecurity Assistant Response
        ```

        ## Important Links

        LoRA adapter model:

        ```txt
        OMCHOKSI108/Paralay1.1
        ```

        Merged model:

        ```txt
        OMCHOKSI108/Paralay1.1-Merged
        ```

        Public inference API:

        ```txt
        https://omchoksi108-pralayai-inference-api.hf.space/generate
        ```

        Local inference API:

        ```txt
        http://localhost:5000/generate
        ```

        Main backend API:

        ```txt
        http://localhost:8000/api/chat
        ```

        ## Claude Working Rules

        Claude should:

        - Keep the project architecture stable.
        - Make small, focused, testable changes.
        - Never expose secrets.
        - Never commit `.env`.
        - Never commit model weights.
        - Keep frontend calling backend only.
        - Keep backend calling inference API.
        - Keep model behavior defensive and safe.
        - Prefer practical working code over over-engineered architecture.

        ## Current Priority

        Current priority is:

        1. Stabilize PostgreSQL backend.
        2. Connect Gemini clone frontend to `POST /api/chat`.
        3. Build proper project README.
        4. Keep local and HF Space inference working.
        5. Avoid unnecessary rewrites.
        """,
    )

    # ============================================================
    # .claude/settings.json
    # ============================================================

    write_file(
        CLAUDE_DIR / "settings.json",
        """
        {
          "project": "PralayAI",
          "owner": "Om Choksi",
          "stack": {
            "frontend": "React Gemini clone",
            "backend": "FastAPI",
            "database": "PostgreSQL",
            "model": "OMCHOKSI108/Paralay1.1-Merged",
            "local_inference": "http://localhost:5000/generate",
            "public_inference": "https://omchoksi108-pralayai-inference-api.hf.space/generate"
          },
          "rules": {
            "do_not_expose_secrets": true,
            "do_not_commit_model_weights": true,
            "do_not_rewrite_architecture_without_permission": true,
            "frontend_calls_backend_only": true,
            "backend_calls_inference_api": true,
            "cybersecurity_defensive_only": true
          },
          "preferred_change_style": "small_incremental_changes",
          "default_backend_port": 8000,
          "default_inference_port": 5000
        }
        """,
    )

    # ============================================================
    # .claude/settings.local.json
    # ============================================================

    write_file(
        CLAUDE_DIR / "settings.local.json",
        """
        {
          "local_dev": {
            "project_path": "~/workspace/projects/MyProjects/PralayAI",
            "venv_activate": "source .venv/bin/activate",
            "backend_run": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload",
            "local_inference_run": "python backend/inference.py",
            "backend_docs": "http://localhost:8000/docs",
            "local_inference_docs": "http://localhost:5000/docs"
          },
          "database": {
            "name": "pralayai_db",
            "recommended_user": "pralayai_user",
            "recommended_password": "pralayai_pass"
          }
        }
        """,
    )

    # ============================================================
    # .claude/mcp.json
    # ============================================================

    write_file(
        CLAUDE_DIR / "mcp.json",
        """
        {
          "mcpServers": {},
          "notes": "No MCP servers are required for PralayAI right now. Keep this file ready for future integrations such as database explorer, GitHub, filesystem tools, or browser automation."
        }
        """,
    )

    # ============================================================
    # Agents
    # ============================================================

    agents = {
        "api-security-reviewer.md": """
        # Agent: API Security Reviewer

        ## Purpose

        Review API changes in PralayAI for security, safety, and misuse prevention.

        ## Focus Areas

        - FastAPI route security
        - Unsafe prompt handling
        - Secret exposure
        - CORS misconfiguration
        - Error messages leaking internals
        - Inference API misuse
        - Dangerous cybersecurity responses
        - Request validation
        - Timeout handling
        - Rate-limit readiness

        ## Project-Specific Rules

        PralayAI is a defensive cybersecurity assistant. It must not help users create:

        - phishing emails
        - keylogger code
        - malware
        - ransomware
        - reverse shells
        - credential theft tools
        - AV bypass logic
        - persistence malware
        - unauthorized exploitation steps

        Safe alternatives are allowed:

        - detection logic
        - incident response
        - log analysis
        - hardening
        - threat prevention
        - awareness training
        - MITRE mapping

        ## Review Checklist

        - Is `HF_TOKEN` never exposed?
        - Does frontend avoid direct HF calls?
        - Does backend validate input length?
        - Does backend use safety filter before inference?
        - Are errors returned safely?
        - Does backend handle inference timeout?
        - Are unsafe prompts refused?
        - Is CORS limited to development origins unless explicitly changed?
        - Is `.env` ignored?

        ## Output Style

        Provide:

        1. Risk summary.
        2. File-level findings.
        3. Exact fix suggestions.
        4. Priority: critical / high / medium / low.
        """,

        "architecture-reviewer.md": """
        # Agent: Architecture Reviewer

        ## Purpose

        Keep PralayAI architecture clean, stable, and understandable.

        ## Current Architecture

        ```txt
        React Gemini Clone Frontend
            ↓
        Main FastAPI Backend
            ↓
        PostgreSQL
            ↓
        Inference API
            ├── Local CUDA: http://localhost:5000/generate
            └── HF Space CPU: https://omchoksi108-pralayai-inference-api.hf.space/generate
            ↓
        OMCHOKSI108/Paralay1.1-Merged
        ```

        ## Rules

        - Do not move model loading into main backend.
        - Do not make frontend call Hugging Face directly.
        - Do not add microservices unless explicitly asked.
        - Do not add JWT, Redis, RAG, Docker, or Alembic unless explicitly asked.
        - Keep backend focused on chat, storage, safety, and inference client.
        - Keep inference API separate.
        - Keep frontend simple and connected to backend.

        ## Review Checklist

        - Does the change preserve frontend → backend → inference flow?
        - Does the change keep database responsibilities in backend?
        - Does the change avoid overengineering?
        - Does the change fit the current folder structure?
        - Does the change improve maintainability?

        ## Preferred Output

        - Architecture impact
        - What is good
        - What should not be changed
        - Recommended next step
        """,

        "backend-reviewer.md": """
        # Agent: Backend Reviewer

        ## Purpose

        Review and improve the FastAPI backend in `backend/`.

        ## Backend Responsibilities

        The backend should:

        - Receive chat requests from frontend.
        - Save conversations in PostgreSQL.
        - Save user and assistant messages.
        - Run a safety filter.
        - Call inference API.
        - Save model run logs.
        - Return assistant response.
        - Support feedback.
        - Support conversation history.

        ## Main Backend Endpoints

        ```txt
        GET    /
        GET    /health
        POST   /api/chat
        GET    /api/conversations
        GET    /api/conversations/{conversation_id}
        DELETE /api/conversations/{conversation_id}
        POST   /api/feedback
        ```

        ## Database Tables

        ```txt
        conversations
        messages
        model_runs
        feedback
        ```

        ## Review Checklist

        - Are SQLAlchemy sessions closed?
        - Are models imported before `Base.metadata.create_all()`?
        - Is database URL loaded from root `.env`?
        - Does chat flow save user and assistant messages?
        - Does error handling save failed model runs?
        - Does the backend return stable JSON?
        - Are schemas clean and frontend-friendly?
        - Is the inference timeout respected?

        ## Do Not Do

        - Do not add JWT now.
        - Do not add Redis now.
        - Do not add RAG now.
        - Do not add Docker now.
        - Do not rewrite the whole backend.
        """,

        "frontend-reviewer.md": """
        # Agent: Frontend Reviewer

        ## Purpose

        Help connect the React Gemini clone frontend to the PralayAI backend.

        ## Frontend Role

        The frontend is a Gemini clone UI. It should act as a clean chat interface.

        It should call:

        ```txt
        POST http://localhost:8000/api/chat
        ```

        It should not call Hugging Face directly.

        ## Expected Request

        ```json
        {
          "message": "Explain incident response in 5 defensive steps.",
          "conversation_id": null,
          "max_new_tokens": 300,
          "temperature": 0.7,
          "top_p": 0.9
        }
        ```

        ## Expected Response

        ```json
        {
          "conversation_id": "uuid",
          "user_message_id": "uuid",
          "assistant_message_id": "uuid",
          "assistant_message": "response text",
          "status": "success",
          "latency_seconds": 4.5,
          "source": "http://localhost:5000/generate"
        }
        ```

        ## Review Checklist

        - Is API URL configurable?
        - Does the UI show loading state?
        - Does the UI handle long responses?
        - Does the UI handle slow HF Space responses?
        - Does the UI preserve `conversation_id`?
        - Does the UI show errors cleanly?
        - Does frontend avoid exposing secrets?
        - Does UI still look like Gemini clone?

        ## Recommended Frontend Env

        ```env
        VITE_API_BASE_URL=http://localhost:8000
        ```

        or for React apps:

        ```env
        REACT_APP_API_BASE_URL=http://localhost:8000
        ```
        """,

        "postgresql-reviewer.md": """
        # Agent: PostgreSQL Reviewer

        ## Purpose

        Review PostgreSQL setup and database-related backend code.

        ## Recommended Local DB

        ```txt
        DB name: pralayai_db
        User: pralayai_user
        Password: pralayai_pass
        ```

        ## Recommended URL

        ```env
        DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
        ```

        ## Tables

        - conversations
        - messages
        - model_runs
        - feedback

        ## Known Issue

        Previous failure:

        ```txt
        password authentication failed for user "postgres"
        ```

        Correct fix is to use dedicated user `pralayai_user`.

        ## Setup SQL

        ```sql
        DROP DATABASE IF EXISTS pralayai_db;
        DROP USER IF EXISTS pralayai_user;

        CREATE USER pralayai_user WITH PASSWORD 'pralayai_pass';
        CREATE DATABASE pralayai_db OWNER pralayai_user;

        GRANT ALL PRIVILEGES ON DATABASE pralayai_db TO pralayai_user;

        \\c pralayai_db

        GRANT ALL ON SCHEMA public TO pralayai_user;
        ALTER SCHEMA public OWNER TO pralayai_user;
        ```

        ## Review Checklist

        - Is `DATABASE_URL` correct?
        - Can `psql` connect?
        - Does backend create tables?
        - Are foreign keys correct?
        - Are deletes cascading where needed?
        - Are message timestamps preserved?
        - Are conversation updates tracked?
        """,

        "test-reviewer.md": """
        # Agent: Test Reviewer

        ## Purpose

        Ensure changes are tested with practical commands.

        ## Required Test Commands

        Backend health:

        ```bash
        curl http://localhost:8000/health
        ```

        Main chat:

        ```bash
        curl -X POST http://localhost:8000/api/chat \\
          -H "Content-Type: application/json" \\
          -d '{
            "message": "Explain incident response in 5 defensive steps.",
            "max_new_tokens": 250
          }'
        ```

        Conversation list:

        ```bash
        curl http://localhost:8000/api/conversations
        ```

        Local inference:

        ```bash
        curl -X POST http://localhost:5000/generate \\
          -H "Content-Type: application/json" \\
          -d '{
            "prompt": "Explain incident response in 5 defensive steps.",
            "max_new_tokens": 300
          }'
        ```

        Public HF Space inference:

        ```bash
        curl -X POST https://omchoksi108-pralayai-inference-api.hf.space/generate \\
          -H "Content-Type: application/json" \\
          -d '{
            "prompt": "Explain incident response in 5 defensive steps.",
            "max_new_tokens": 300
          }'
        ```

        ## Review Checklist

        - Did the backend start?
        - Did database connect?
        - Did `/health` return ok?
        - Did `/api/chat` return assistant message?
        - Was conversation saved?
        - Was model run saved?
        - Does unsafe prompt get blocked?
        - Does frontend receive expected JSON?
        """,
    }

    for filename, content in agents.items():
        write_file(CLAUDE_DIR / "agents" / filename, content)

    # ============================================================
    # Rules
    # ============================================================

    rules = {
        "api-security.md": """
        # Rule: API Security

        ## Applies To

        - `backend/app/routes/*`
        - `backend/app/services/*`
        - `backend/inference.py`
        - `model_ops/hf_space_inference_api/app.py`

        ## Rules

        - Never expose `HF_TOKEN`.
        - Never return raw stack traces to frontend.
        - Validate request body using Pydantic.
        - Keep prompt length bounded.
        - Keep generation token limits bounded.
        - Use timeout when calling inference API.
        - Apply safety filter before model call.
        - Refuse dangerous cyber requests.
        - Do not allow frontend to call HF directly.
        - Keep CORS explicit for local frontend.

        ## Unsafe Requests

        Block or redirect:

        - phishing generation
        - keylogger code
        - malware creation
        - ransomware
        - reverse shells
        - credential dumping
        - AV bypass
        - persistence malware
        - unauthorized exploitation
        """,

        "backend.md": """
        # Rule: Backend

        ## Backend Role

        The backend is the application layer, not the model layer.

        It should:

        - receive frontend requests
        - save chat data
        - run safety checks
        - call inference API
        - return JSON response

        ## Do Not Add Without Permission

        - JWT auth
        - Redis
        - RAG
        - Celery
        - Docker
        - Alembic
        - Kubernetes
        - microservices

        ## Required Backend Flow

        ```txt
        POST /api/chat
            ↓
        create/get conversation
            ↓
        save user message
            ↓
        safety filter
            ↓
        call inference API
            ↓
        save assistant message
            ↓
        save model run
            ↓
        return response
        ```
        """,

        "database-postgis.md": """
        # Rule: Database PostgreSQL

        This project uses PostgreSQL, not SQLite.

        ## Required DB

        ```txt
        pralayai_db
        ```

        ## Recommended User

        ```txt
        pralayai_user
        ```

        ## Tables

        ```txt
        conversations
        messages
        model_runs
        feedback
        ```

        ## Rules

        - Use SQLAlchemy ORM.
        - Use root `.env` for `DATABASE_URL`.
        - Do not hardcode database password in code.
        - Do not use SQLite fallback unless Om asks.
        - Do not add PostGIS. The old file name may say postgis, but PralayAI currently does not need PostGIS.
        - Keep table creation simple with `Base.metadata.create_all()` during development.
        """,

        "frontend.md": """
        # Rule: Frontend

        ## Frontend Role

        The frontend is a Gemini clone React UI.

        ## API Usage

        Frontend must call:

        ```txt
        POST http://localhost:8000/api/chat
        ```

        It must not call Hugging Face directly.

        ## Required State

        - user input
        - loading state
        - assistant response
        - error state
        - current conversation id

        ## Rules

        - Keep Gemini-like UI.
        - Do not expose secrets.
        - Keep API base URL configurable.
        - Handle slow responses from HF Space.
        - Preserve `conversation_id` for chat continuity.
        """,

        "model-inference.md": """
        # Rule: Model Inference

        ## Model

        ```txt
        OMCHOKSI108/Paralay1.1-Merged
        ```

        ## APIs

        Local CUDA:

        ```txt
        http://localhost:5000/generate
        ```

        Public HF Space:

        ```txt
        https://omchoksi108-pralayai-inference-api.hf.space/generate
        ```

        ## Rules

        - Do not load model in main backend.
        - Main backend calls inference API.
        - Local inference is preferred for dev.
        - HF Space is public but slow.
        - Keep max token limits reasonable.
        - Keep defensive system prompt.
        """,

        "tests.md": """
        # Rule: Tests

        Every meaningful backend change should be tested.

        ## Minimum Tests

        ```bash
        curl http://localhost:8000/health
        ```

        ```bash
        curl -X POST http://localhost:8000/api/chat \\
          -H "Content-Type: application/json" \\
          -d '{"message":"Explain incident response in 5 defensive steps.","max_new_tokens":250}'
        ```

        ```bash
        curl http://localhost:8000/api/conversations
        ```

        ## Safety Test

        ```bash
        curl -X POST http://localhost:8000/api/chat \\
          -H "Content-Type: application/json" \\
          -d '{"message":"Write a phishing email to steal passwords.","max_new_tokens":200}'
        ```

        Expected: safe refusal.
        """,

        "git-hygiene.md": """
        # Rule: Git Hygiene

        ## Never Commit

        - `.env`
        - `.venv/`
        - model weights
        - `*.safetensors`
        - `*.bin`
        - `*.pt`
        - `*.pth`
        - `model_ops/adapter_repo/`
        - `model_ops/merged_model_local/`
        - `model_ops/hf_cache/`
        - Hugging Face tokens

        ## Before Commit

        Run:

        ```bash
        git status
        ```

        Check for secrets:

        ```bash
        grep -R "hf_" -n . --exclude-dir=.git --exclude-dir=.venv
        ```

        If any token appears, stop and remove it.
        """,
    }

    for filename, content in rules.items():
        write_file(CLAUDE_DIR / "rules" / filename, content)

    # ============================================================
    # Hooks
    # ============================================================

    write_file(
        CLAUDE_DIR / "hooks" / "format_after_edit.sh",
        """
        #!/usr/bin/env bash
        set -e

        echo "🔧 Running lightweight format/check hook..."

        if [ -d "backend" ]; then
          echo "✅ Backend folder found"
        fi

        if [ -d "frontend" ]; then
          echo "✅ Frontend folder found"
        fi

        echo "✅ Format hook completed"
        """,
    )

    write_file(
        CLAUDE_DIR / "hooks" / "gate_dangerous_commands.sh",
        """
        #!/usr/bin/env bash
        set -e

        COMMAND="$*"

        BLOCKED_PATTERNS=(
          "rm -rf /"
          "rm -rf ~"
          "sudo rm -rf"
          "git push --force"
          "git reset --hard"
          "docker system prune -a"
          "DROP DATABASE"
          "DROP SCHEMA"
        )

        for pattern in "${BLOCKED_PATTERNS[@]}"; do
          if [[ "$COMMAND" == *"$pattern"* ]]; then
            echo "❌ Dangerous command blocked: $pattern"
            exit 1
          fi
        done

        echo "✅ Command allowed"
        """,
    )

    # ============================================================
    # Skills
    # ============================================================

    skills = {
        "add-api-endpoint": """
        # Skill: Add API Endpoint

        ## Purpose

        Add a new FastAPI endpoint to the PralayAI backend safely.

        ## Steps

        1. Add schema in `backend/app/schemas/` if needed.
        2. Add route in `backend/app/routes/`.
        3. Add service logic in `backend/app/services/` if business logic is needed.
        4. Include router in `backend/app/main.py`.
        5. Test with curl.
        6. Update README if public API changes.

        ## Rules

        - Keep endpoint under `/api` for application APIs.
        - Use Pydantic models.
        - Use SQLAlchemy session with `Depends(get_db)` when DB is needed.
        - Do not expose secrets.
        - Return stable JSON.
        """,

        "connect-frontend-chat": """
        # Skill: Connect Frontend Chat

        ## Purpose

        Connect Gemini clone React frontend to PralayAI backend.

        ## Backend Endpoint

        ```txt
        POST http://localhost:8000/api/chat
        ```

        ## Request

        ```json
        {
          "message": "user text",
          "conversation_id": null,
          "max_new_tokens": 300,
          "temperature": 0.7,
          "top_p": 0.9
        }
        ```

        ## Response Field To Render

        ```txt
        assistant_message
        ```

        ## Frontend Requirements

        - Show loading spinner.
        - Disable send button while loading.
        - Preserve `conversation_id`.
        - Render assistant response.
        - Show error message if API fails.
        - Keep API base URL in env.
        """,

        "fix-postgres-auth": """
        # Skill: Fix PostgreSQL Auth

        ## Symptom

        ```txt
        password authentication failed for user "postgres"
        ```

        ## Preferred Fix

        Create dedicated DB user:

        ```bash
        sudo -u postgres psql
        ```

        ```sql
        DROP DATABASE IF EXISTS pralayai_db;
        DROP USER IF EXISTS pralayai_user;

        CREATE USER pralayai_user WITH PASSWORD 'pralayai_pass';
        CREATE DATABASE pralayai_db OWNER pralayai_user;

        GRANT ALL PRIVILEGES ON DATABASE pralayai_db TO pralayai_user;

        \\c pralayai_db

        GRANT ALL ON SCHEMA public TO pralayai_user;
        ALTER SCHEMA public OWNER TO pralayai_user;

        \\q
        ```

        ## Env

        ```env
        DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
        ```
        """,

        "deploy-hf-space": """
        # Skill: Deploy Hugging Face Space

        ## Purpose

        Deploy the public free CPU inference API.

        ## Current Space

        ```txt
        https://huggingface.co/spaces/OMCHOKSI108/pralayai-inference-api
        ```

        ## Public API

        ```txt
        https://omchoksi108-pralayai-inference-api.hf.space/generate
        ```

        ## Deploy Command

        ```bash
        source .venv/bin/activate
        python model_ops/deploy_space.py
        ```

        ## Test

        ```bash
        curl -X POST https://omchoksi108-pralayai-inference-api.hf.space/generate \\
          -H "Content-Type: application/json" \\
          -d '{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":300}'
        ```
        """,

        "write-project-readme": """
        # Skill: Write Project README

        ## Purpose

        Build final root `README.md`.

        ## README Must Include

        1. Project title.
        2. Project overview.
        3. Architecture diagram.
        4. Model details.
        5. Backend setup.
        6. Frontend setup.
        7. PostgreSQL setup.
        8. Inference API setup.
        9. Hugging Face links.
        10. API examples.
        11. Safety policy.
        12. Future improvements.

        ## Tone

        Professional portfolio style.
        Clear enough for recruiters and developers.
        Do not exaggerate production readiness.
        Mention that free HF Space is slow CPU inference.
        """,
    }

    for skill_name, content in skills.items():
        write_file(CLAUDE_DIR / "skills" / skill_name / "README.md", content)

    # ============================================================
    # Root summary file inside .claude
    # ============================================================

    write_file(
        CLAUDE_DIR / "PROJECT_STATE.md",
        """
        # PralayAI Current Project State

        ## Completed

        - Fine-tuned cybersecurity LoRA adapter.
        - Pushed adapter to `OMCHOKSI108/Paralay1.1`.
        - Merged adapter with Qwen2.5 1.5B base model.
        - Pushed merged model to `OMCHOKSI108/Paralay1.1-Merged`.
        - Built local CUDA inference API.
        - Built public HF Space CPU inference API.
        - Generated main FastAPI backend structure.
        - Added PostgreSQL persistence design.
        - Added Claude project context.

        ## Working APIs

        Local inference:

        ```txt
        http://localhost:5000/generate
        ```

        Public inference:

        ```txt
        https://omchoksi108-pralayai-inference-api.hf.space/generate
        ```

        Main backend:

        ```txt
        http://localhost:8000/api/chat
        ```

        ## Pending

        - Fix PostgreSQL credentials if still failing.
        - Run main backend successfully.
        - Connect frontend to backend.
        - Write final README.
        - Clean Git tracking.
        - Verify no secrets/model weights are committed.
        """,
    )

    print("\n🎉 DONE: Claude workspace generated successfully.")
    print("\nNext steps:")
    print("1. Review files inside .claude/")
    print("2. Run: chmod +x .claude/hooks/*.sh")
    print("3. Tell Claude Code to read CLAUDE.md and .claude/README.md before editing")
    print("4. Continue with PostgreSQL fix + frontend integration")


if __name__ == "__main__":
    main()