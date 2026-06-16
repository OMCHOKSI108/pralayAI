from flask import Blueprint, redirect, render_template_string, request, session as flask_session, url_for

from ..helpers import api_get, api_post
from ..layout import LAYOUT_BOTTOM, LAYOUT_TOP

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/")
def home():
    if flask_session.get("token"):
        return redirect(url_for("chat.chat"))
    return redirect(url_for("auth.login"))


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    error = ""
    if request.method == "POST":
        email = request.form.get("email", "")
        password = request.form.get("password", "")
        try:
            data = api_post("/api/auth/login", {"email": email, "password": password})
            flask_session["token"] = data["token"]
            flask_session["user"] = data["user"]
            return redirect(url_for("chat.chat"))
        except Exception as e:
            error = str(e)
    return render_template_string(LAYOUT_TOP + """\
<div class="card" style="max-width:400px;margin:4rem auto;">
<h2>Sign In</h2>
{% if error %}<div class="error">{{ error }}</div>{% endif %}
<form method="post">
<div class="form-group"><label>Email</label><input type="email" name="email" required></div>
<div class="form-group"><label>Password</label><input type="password" name="password" required></div>
<button type="submit" class="btn">Sign In</button>
<a href="/register" class="btn btn-outline" style="margin-left:0.5rem;">Register</a>
<a href="/forgot-password" class="btn btn-outline" style="margin-left:0.5rem;">Forgot Password</a>
</form>
</div>
""" + LAYOUT_BOTTOM, error=error)


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    error = ""
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "")
        password = request.form.get("password", "")
        if len(username) < 3:
            error = "Username must be at least 3 characters"
        elif len(password) < 6:
            error = "Password must be at least 6 characters"
        else:
            try:
                data = api_post("/api/auth/register", {"username": username, "email": email, "password": password})
                flask_session["token"] = data["token"]
                flask_session["user"] = data["user"]
                return redirect(url_for("chat.chat"))
            except Exception as e:
                error = str(e)
    return render_template_string(LAYOUT_TOP + """\
<div class="card" style="max-width:400px;margin:4rem auto;">
<h2>Create Account</h2>
{% if error %}<div class="error">{{ error }}</div>{% endif %}
<form method="post">
<div class="form-group"><label>Username</label><input type="text" name="username" minlength="3" required></div>
<div class="form-group"><label>Email</label><input type="email" name="email" required></div>
<div class="form-group"><label>Password</label><input type="password" name="password" minlength="6" required></div>
<button type="submit" class="btn">Register</button>
<a href="/login" class="btn btn-outline" style="margin-left:0.5rem;">Back to Sign In</a>
</form>
</div>
""" + LAYOUT_BOTTOM, error=error)


@auth_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    step = int(request.args.get("step", 0))
    error = ""
    info = ""
    reset_email = flask_session.get("reset_email", "")

    if request.method == "POST":
        if step == 0:
            email = request.form.get("email", "")
            try:
                api_post("/api/auth/password-reset/request", {"email": email})
                flask_session["reset_email"] = email
                return redirect(url_for("auth.forgot_password", step=1))
            except Exception as e:
                error = str(e)
        elif step == 1:
            otp = request.form.get("otp", "")
            try:
                data = api_post("/api/auth/password-reset/verify", {"email": reset_email, "otp": otp})
                flask_session["token"] = data["token"]
                flask_session["user"] = data["user"]
                return redirect(url_for("chat.chat"))
            except Exception as e:
                error = str(e)

    tmpl = LAYOUT_TOP + """\
<div class="card" style="max-width:400px;margin:4rem auto;">
<h2>Reset Password</h2>
{% if error %}<div class="error">{{ error }}</div>{% endif %}
{% if info %}<div class="info">{{ info }}</div>{% endif %}
"""
    if step == 0:
        tmpl += """\
<p class="text-muted mb-1">Enter your email to receive a password reset OTP.</p>
<form method="post">
<div class="form-group"><label>Email</label><input type="email" name="email" required></div>
<button type="submit" class="btn">Send OTP</button>
<a href="/login" class="btn btn-outline" style="margin-left:0.5rem;">Back</a>
</form>"""
    elif step == 1:
        tmpl += """\
<p class="text-muted mb-1">Enter the 6-digit OTP sent to your email.</p>
<form method="post">
<div class="form-group"><label>OTP Code</label><input type="text" name="otp" maxlength="6" pattern="[0-9]{6}" required></div>
<button type="submit" class="btn">Verify & Login</button>
<a href="/login" class="btn btn-outline" style="margin-left:0.5rem;">Back</a>
</form>"""
    tmpl += """\
</div>
""" + LAYOUT_BOTTOM
    return render_template_string(tmpl, error=error, info=info)


@auth_bp.route("/logout")
def logout():
    try:
        from ..helpers import api_post
        api_post("/api/auth/logout")
    except Exception:
        pass
    flask_session.clear()
    return redirect(url_for("auth.login"))
