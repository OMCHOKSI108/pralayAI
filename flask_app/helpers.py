from functools import wraps

import requests
from flask import redirect, session as flask_session, url_for

from .config import Config


def api_headers():
    token = flask_session.get("token")
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def api_post(path, body=None):
    r = requests.post(f"{Config.API_BASE}{path}", headers=api_headers(), json=body or {}, timeout=30)
    if not r.ok:
        detail = r.json().get("detail", r.text)
        raise Exception(detail)
    return r.json()


def api_get(path):
    r = requests.get(f"{Config.API_BASE}{path}", headers=api_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_put(path, body):
    r = requests.put(f"{Config.API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_delete(path):
    r = requests.delete(f"{Config.API_BASE}{path}", headers=api_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_patch(path, body):
    r = requests.patch(f"{Config.API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def login_required(f):
    @wraps(f)
    def wrapper(*a, **kw):
        if not flask_session.get("token"):
            return redirect(url_for("auth.login"))
        return f(*a, **kw)
    return wrapper
