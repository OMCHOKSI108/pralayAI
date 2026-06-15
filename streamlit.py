"""PralayAI — Streamlit Frontend"""

import os
import json
import time
import uuid
import requests
import streamlit as st

API_BASE = os.getenv("PRALAY_API_URL", "http://127.0.0.1:8000")


# ── API Helpers ─────────────────────────────────────────────────────────────────

def _headers():
    token = st.session_state.get("token")
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def api_post(path, body=None):
    r = requests.post(f"{API_BASE}{path}", headers=_headers(), json=body or {}, timeout=30)
    if not r.ok:
        detail = r.json().get("detail", r.text)
        raise Exception(detail)
    return r.json()


def api_get(path):
    r = requests.get(f"{API_BASE}{path}", headers=_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_put(path, body):
    r = requests.put(f"{API_BASE}{path}", headers=_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_delete(path):
    r = requests.delete(f"{API_BASE}{path}", headers=_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_patch(path, body):
    r = requests.patch(f"{API_BASE}{path}", headers=_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def check_health():
    try:
        r = requests.get(f"{API_BASE}/health", timeout=5)
        return r.ok
    except Exception:
        return False


# ── Auth ────────────────────────────────────────────────────────────────────────

def do_login(email, password):
    data = api_post("/api/auth/login", {"email": email, "password": password})
    st.session_state.token = data["token"]
    st.session_state.user = data["user"]
    st.session_state.page = "chat"


def do_register(username, email, password):
    data = api_post("/api/auth/register", {"username": username, "email": email, "password": password})
    st.session_state.token = data["token"]
    st.session_state.user = data["user"]
    st.session_state.page = "chat"


def do_logout():
    try:
        api_post("/api/auth/logout")
    except Exception:
        pass
    st.session_state.token = None
    st.session_state.user = None
    st.session_state.page = "login"
    st.rerun()


def do_forgot_password(email):
    api_post("/api/auth/forgot-password", {"email": email})
    return True


def do_resolve_token(token):
    return api_post("/api/auth/resolve-reset-token", {"email": token})


def do_send_otp(email):
    api_post("/api/auth/send-reset-otp", {"email": email})


def do_verify_reset(email, new_password, otp):
    return api_post("/api/auth/verify-reset", {"email": email, "new_password": new_password, "otp": otp})


def do_change_password(current_pw, new_pw):
    api_put("/api/auth/change-password", {"current_password": current_pw, "new_password": new_pw})


def do_update_profile(username):
    data = api_put("/api/auth/profile", {"username": username})
    st.session_state.user = data


# ── Conversations ───────────────────────────────────────────────────────────────

def load_conversations():
    return api_get("/api/conversations") or []


def load_conversation(cid):
    return api_get(f"/api/conversations/{cid}")


def delete_conversation(cid):
    api_delete(f"/api/conversations/{cid}")


def send_chat(message, conversation_id=None):
    body = {
        "message": message,
        "conversation_id": conversation_id,
        "max_new_tokens": 512,
        "temperature": 0.7,
        "top_p": 0.9,
    }
    return api_post("/api/chat", body)


# ── Memory ──────────────────────────────────────────────────────────────────────

def load_memories():
    return api_get("/api/memory")


def delete_memory(mid):
    api_delete(f"/api/memory/{mid}")


# ── Init session state ──────────────────────────────────────────────────────────

if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None
if "page" not in st.session_state:
    st.session_state.page = "login" if not st.session_state.token else "chat"
if "conversations" not in st.session_state:
    st.session_state.conversations = []
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "current_cid" not in st.session_state:
    st.session_state.current_cid = None
if "forgot_step" not in st.session_state:
    st.session_state.forgot_step = 0
if "reset_email" not in st.session_state:
    st.session_state.reset_email = ""

# ── Theme ───────────────────────────────────────────────────────────────────────

theme = st.session_state.get("theme", "dark")


# ── Pages ───────────────────────────────────────────────────────────────────────

def page_login():
    st.title("PralayAI")
    st.caption("Defensive Cybersecurity Assistant")

    tab1, tab2 = st.tabs(["Sign In", "Register"])
    with tab1:
        with st.form("login_form"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            col1, col2 = st.columns([1, 1])
            with col1:
                if st.form_submit_button("Sign In", use_container_width=True):
                    try:
                        do_login(email, password)
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))
            with col2:
                if st.form_submit_button("Forgot Password?", use_container_width=True):
                    st.session_state.page = "forgot"
                    st.session_state.forgot_step = 0
                    st.rerun()

    with tab2:
        with st.form("register_form"):
            uname = st.text_input("Username")
            reg_email = st.text_input("Email")
            reg_pw = st.text_input("Password", type="password")
            if st.form_submit_button("Create Account", use_container_width=True):
                if len(uname.strip()) < 3:
                    st.error("Username must be at least 3 characters")
                elif len(reg_pw) < 6:
                    st.error("Password must be at least 6 characters")
                else:
                    try:
                        do_register(uname.strip(), reg_email, reg_pw)
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))


def page_forgot():
    st.title("PralayAI")
    st.caption("Reset Password")

    step = st.session_state.forgot_step

    if step == 0:
        with st.form("forgot_form"):
            email = st.text_input("Email address")
            if st.form_submit_button("Send Reset Link"):
                try:
                    do_forgot_password(email)
                    st.session_state.reset_email = email
                    st.session_state.forgot_step = 1
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

    elif step == 1:
        with st.form("otp_form"):
            new_pw = st.text_input("New Password", type="password")
            if st.form_submit_button("Send OTP"):
                if len(new_pw) < 6:
                    st.error("Password must be at least 6 characters")
                else:
                    try:
                        do_send_otp(st.session_state.reset_email)
                        st.session_state.forgot_new_pw = new_pw
                        st.session_state.forgot_step = 2
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    elif step == 2:
        st.info(f"OTP sent to {st.session_state.reset_email}")
        with st.form("verify_form"):
            otp = st.text_input("OTP Code", max_chars=6)
            if st.form_submit_button("Verify & Sign In"):
                try:
                    data = do_verify_reset(
                        st.session_state.reset_email,
                        st.session_state.forgot_new_pw,
                        otp,
                    )
                    st.session_state.token = data["token"]
                    st.session_state.user = data["user"]
                    st.session_state.page = "chat"
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

    if st.button("Back to Sign In"):
        st.session_state.page = "login"
        st.rerun()


def page_chat():
    user = st.session_state.user or {}
    username = user.get("username", "User")

    # Sidebar
    with st.sidebar:
        st.markdown(f"**{username}**")
        st.caption(user.get("email", ""))

        if st.button("+ New Chat", use_container_width=True):
            st.session_state.chat_messages = []
            st.session_state.current_cid = None
            st.rerun()

        # Load conversations
        try:
            st.session_state.conversations = load_conversations()
        except Exception:
            st.session_state.conversations = []

        for conv in st.session_state.conversations:
            cols = st.columns([4, 1])
            with cols[0]:
                if st.button(conv["title"][:30], key=f"c_{conv['id']}", use_container_width=True):
                    try:
                        detail = load_conversation(conv["id"])
                        msgs = []
                        for m in detail.get("messages", []):
                            msgs.append({"role": m["role"], "content": m["content"]})
                        st.session_state.chat_messages = msgs
                        st.session_state.current_cid = conv["id"]
                        st.rerun()
                    except Exception:
                        st.error("Failed to load conversation")
            with cols[1]:
                if st.button("X", key=f"d_{conv['id']}"):
                    try:
                        delete_conversation(conv["id"])
                        if st.session_state.current_cid == conv["id"]:
                            st.session_state.chat_messages = []
                            st.session_state.current_cid = None
                        st.rerun()
                    except Exception:
                        st.error("Delete failed")

        st.divider()
        if st.button("Settings", use_container_width=True):
            st.session_state.page = "settings"
            st.rerun()
        if st.button("Memory", use_container_width=True):
            st.session_state.page = "memory"
            st.rerun()
        if st.button("Sign Out", use_container_width=True):
            do_logout()

    # Chat area
    st.title("PralayAI")

    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    prompt = st.chat_input("Ask about cybersecurity...")
    if prompt:
        st.session_state.chat_messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            placeholder = st.empty()
            placeholder.markdown("_Thinking..._")
            try:
                result = send_chat(prompt, st.session_state.current_cid)
                response = result.get("assistant_message", "")
                st.session_state.current_cid = result.get("conversation_id")
                placeholder.markdown(response)
                st.session_state.chat_messages.append({"role": "assistant", "content": response})
            except Exception as e:
                placeholder.error(str(e))


def page_settings():
    st.title("Settings")

    user = st.session_state.user or {}

    with st.expander("Update Username", expanded=True):
        with st.form("username_form"):
            new_uname = st.text_input("New username", value=user.get("username", ""))
            if st.form_submit_button("Save"):
                if len(new_uname.strip()) < 3:
                    st.error("Username must be at least 3 characters")
                else:
                    try:
                        do_update_profile(new_uname.strip())
                        st.success("Username updated!")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    with st.expander("Change Password", expanded=True):
        with st.form("password_form"):
            cur_pw = st.text_input("Current Password", type="password")
            new_pw = st.text_input("New Password", type="password")
            confirm_pw = st.text_input("Confirm New Password", type="password")
            if st.form_submit_button("Change Password"):
                if new_pw != confirm_pw:
                    st.error("Passwords do not match")
                elif len(new_pw) < 6:
                    st.error("Password must be at least 6 characters")
                else:
                    try:
                        do_change_password(cur_pw, new_pw)
                        st.success("Password changed!")
                    except Exception as e:
                        st.error(str(e))

    if st.button("Back to Chat"):
        st.session_state.page = "chat"
        st.rerun()


def page_memory():
    st.title("Memory")
    st.caption("What PralayAI remembers about you")

    try:
        data = load_memories()
        memories = data.get("memories", [])
    except Exception:
        memories = []

    if not memories:
        st.info("No memories yet. Talk to PralayAI and it will remember things about you.")

    for mem in memories:
        cols = st.columns([1, 3, 1])
        with cols[0]:
            st.caption(mem.get("type", "fact")[:8])
        with cols[1]:
            st.markdown(f"**{mem.get('key', '?')}** = {mem.get('value', '')}")
        with cols[2]:
            if st.button("Delete", key=f"md_{mem['id']}"):
                try:
                    delete_memory(mem["id"])
                    st.rerun()
                except Exception:
                    st.error("Delete failed")

    if st.button("Back to Chat"):
        st.session_state.page = "chat"
        st.rerun()


# ── Router ──────────────────────────────────────────────────────────────────────

def main():
    if not check_health():
        st.error("Backend is not reachable at " + API_BASE)
        st.info("Make sure the backend is running: cd backend && uvicorn app.main:app --port 8000")
        return

    page = st.session_state.page

    if not st.session_state.token:
        if page in ("forgot",):
            page_forgot()
        else:
            page_login()
        return

    if page == "chat":
        page_chat()
    elif page == "settings":
        page_settings()
    elif page == "memory":
        page_memory()
    else:
        page_chat()


if __name__ == "__main__":
    st.set_page_config(page_title="PralayAI", page_icon=None, layout="wide")
    main()
