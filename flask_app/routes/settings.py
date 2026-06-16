from flask import Blueprint, render_template_string, request, session as flask_session

from ..helpers import api_put, login_required
from ..layout import LAYOUT_BOTTOM, LAYOUT_TOP

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings", methods=["GET", "POST"])
@login_required
def settings():
    user = flask_session.get("user", {})
    success = ""
    error = ""
    if request.method == "POST":
        action = request.form.get("action", "")
        if action == "username":
            uname = request.form.get("username", "").strip()
            if len(uname) < 3:
                error = "Username must be at least 3 characters"
            else:
                try:
                    data = api_put("/api/auth/profile", {"username": uname})
                    flask_session["user"] = data
                    success = "Username updated."
                except Exception as e:
                    error = str(e)
        elif action == "password":
            new = request.form.get("new_password", "")
            confirm = request.form.get("confirm_password", "")
            if new != confirm:
                error = "Passwords do not match."
            elif len(new) < 6:
                error = "Password must be at least 6 characters."
            else:
                try:
                    api_put("/api/auth/change-password", {"new_password": new})
                    success = "Password changed."
                except Exception as e:
                    error = str(e)
        elif action == "preferences":
            thinking = request.form.get("thinking_level", "medium")
            theme = request.form.get("theme", "dark")
            current_style = flask_session.get("user", {}).get("answer_style", "{}")
            style_json = current_style if current_style != "{}" else '{"format":"paragraph","tone":"professional","length":"medium"}'
            try:
                data = api_put("/api/auth/profile", {
                    "username": flask_session.get("user", {}).get("username", ""),
                    "preferred_language": "english",
                    "thinking_level": thinking,
                    "theme": theme,
                    "answer_style": style_json,
                })
                flask_session["user"] = data
                success = "Preferences saved."
            except Exception as e:
                error = str(e)
    user_data = flask_session.get("user", {})
    return render_template_string(LAYOUT_TOP + """\
<div class="header">
<h1>Settings</h1>
<nav><a href="/chat">Back to Chat</a> <a href="/logout">Sign Out</a></nav>
</div>
{% if success %}<div class="success">{{ success }}</div>{% endif %}
{% if error %}<div class="error">{{ error }}</div>{% endif %}
<div class="card">
<h2>Update Username</h2>
<form method="post">
<input type="hidden" name="action" value="username">
<div class="form-group"><label>New Username</label><input type="text" name="username" value="{{ user.get('username','') }}" minlength="3" required></div>
<button type="submit" class="btn">Save</button>
</form>
</div>
<div class="card">
<h2>Preferences</h2>
<form method="post">
<input type="hidden" name="action" value="preferences">

<div class="form-group"><label>Thinking Level</label>
<select name="thinking_level">
<option value="low" {% if user.get('thinking_level','medium') == 'low' %}selected{% endif %}>Low — Fast answers</option>
<option value="medium" {% if user.get('thinking_level','medium') == 'medium' %}selected{% endif %}>Medium — Balanced</option>
<option value="high" {% if user.get('thinking_level','') == 'high' %}selected{% endif %}>High — Deep structured</option>
</select>
</div>
<div class="form-group"><label>Theme</label>
<select name="theme">
<option value="dark" {% if user.get('theme','dark') == 'dark' %}selected{% endif %}>Dark</option>
<option value="light" {% if user.get('theme','') == 'light' %}selected{% endif %}>Light</option>
</select>
</div>
<button type="submit" class="btn">Save Preferences</button>
</form>
</div>
<div class="card">
<h2>Change Password</h2>
<form method="post">
<input type="hidden" name="action" value="password">

<div class="form-group"><label>New Password</label><input type="password" name="new_password" minlength="6" required></div>
<div class="form-group"><label>Confirm New Password</label><input type="password" name="confirm_password" minlength="6" required></div>
<button type="submit" class="btn">Change Password</button>
</form>
</div>
""" + LAYOUT_BOTTOM, user=user_data, success=success, error=error)
