"""
API Request and Authentication Utilities

This module provides helper functions to wrap the `requests` library for 
communicating with the backend API. It automatically handles token injection 
from the Flask session, configures request timeouts, and provides a 
route decorator to enforce authentication.
"""

from functools import wraps

import requests
from flask import redirect, session as flask_session, url_for

from .config import Config


def api_headers():
    """
    Constructs the standard HTTP headers required for API requests.
    
    Retrieves the authentication token from the current Flask session 
    and attaches it as a Bearer token if it exists.
    
    Returns:
        dict: A dictionary of HTTP headers containing Content-Type and 
              Authorization (if logged in).
    """
    token = flask_session.get("token")
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    return headers


def api_post(path, body=None):
    """
    Sends an HTTP POST request to the configured backend API.
    
    Args:
        path (str): The API endpoint path (e.g., '/users').
        body (dict, optional): The JSON payload to send. Defaults to an empty dict.
        
    Returns:
        dict: The JSON response parsed as a Python dictionary.
        
    Raises:
        Exception: If the response status code is not successful (not 2xx).
    """
    # POST requests generally might involve longer operations, hence a 30s timeout
    r = requests.post(
        f"{Config.API_BASE}{path}", 
        headers=api_headers(), 
        json=body or {}, 
        timeout=30
    )
    
    if not r.ok:
        # Extract the specific error detail from the API, falling back to raw text
        detail = r.json().get("detail", r.text)
        raise Exception(detail)
        
    return r.json()


def api_get(path):
    """
    Sends an HTTP GET request to the configured backend API.
    
    Args:
        path (str): The API endpoint path.
        
    Returns:
        dict: The JSON response parsed as a Python dictionary.
        
    Raises:
        Exception: If the response status code is not successful (not 2xx).
    """
    r = requests.get(f"{Config.API_BASE}{path}", headers=api_headers(), timeout=15)
    
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
        
    return r.json()


def api_put(path, body):
    """
    Sends an HTTP PUT request to the configured backend API for full resource replacement.
    
    Args:
        path (str): The API endpoint path.
        body (dict): The JSON payload containing the updated resource.
        
    Returns:
        dict: The JSON response parsed as a Python dictionary.
        
    Raises:
        Exception: If the response status code is not successful (not 2xx).
    """
    r = requests.put(f"{Config.API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
        
    return r.json()


def api_delete(path):
    """
    Sends an HTTP DELETE request to the configured backend API.
    
    Args:
        path (str): The API endpoint path targeting a specific resource.
        
    Returns:
        dict: The JSON response parsed as a Python dictionary.
        
    Raises:
        Exception: If the response status code is not successful (not 2xx).
    """
    r = requests.delete(f"{Config.API_BASE}{path}", headers=api_headers(), timeout=15)
    
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
        
    return r.json()


def api_patch(path, body):
    """
    Sends an HTTP PATCH request to the configured backend API for partial resource updates.
    
    Args:
        path (str): The API endpoint path.
        body (dict): The JSON payload containing the fields to update.
        
    Returns:
        dict: The JSON response parsed as a Python dictionary.
        
    Raises:
        Exception: If the response status code is not successful (not 2xx).
    """
    r = requests.patch(f"{Config.API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
        
    return r.json()


def login_required(f):
    """
    A decorator for Flask route functions that enforces authentication.
    
    Checks the Flask session for a valid 'token'. If no token is found, 
    the user is immediately redirected to the login page. Otherwise, 
    the requested route function is executed normally.
    
    Usage:
        @app.route('/dashboard')
        @login_required
        def dashboard():
            ...
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Verify the user has an active session token
        if not flask_session.get("token"):
            return redirect(url_for("auth.login"))
            
        # Execute the original function if authenticated
        return f(*args, **kwargs)
        
    return wrapper
