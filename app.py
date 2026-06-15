"""PralayAI — Flask Frontend (white, Times New Roman, black text, no emoji)"""

import os
import json
import requests
from flask import Flask, render_template_string, request, redirect, url_for, session as flask_session, stream_with_context, Response
from functools import wraps

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET", "pralayai-flask-secret-change-me")

API_BASE = os.getenv("PRALAY_API_URL", "http://127.0.0.1:8000")

# ── Helpers ─────────────────────────────────────────────────────────────────────

def api_headers():
    token = flask_session.get("token")
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def api_post(path, body=None):
    r = requests.post(f"{API_BASE}{path}", headers=api_headers(), json=body or {}, timeout=30)
    if not r.ok:
        detail = r.json().get("detail", r.text)
        raise Exception(detail)
    return r.json()


def api_get(path):
    r = requests.get(f"{API_BASE}{path}", headers=api_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_put(path, body):
    r = requests.put(f"{API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_delete(path):
    r = requests.delete(f"{API_BASE}{path}", headers=api_headers(), timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def api_patch(path, body):
    r = requests.patch(f"{API_BASE}{path}", headers=api_headers(), json=body, timeout=15)
    if not r.ok:
        raise Exception(r.json().get("detail", r.text))
    return r.json()


def login_required(f):
    @wraps(f)
    def wrapper(*a, **kw):
        if not flask_session.get("token"):
            return redirect(url_for("login"))
        return f(*a, **kw)
    return wrapper

# ── Layout ──────────────────────────────────────────────────────────────────────

LAYOUT_TOP = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PralayAI</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Times New Roman', Times, serif; background: #fff; color: #000; line-height: 1.6; min-height: 100vh; }
a { color: #000; text-decoration: underline; }
a:hover { color: #555; }
input, button, textarea, select { font-family: 'Times New Roman', Times, serif; font-size: 1rem; }
.container { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
.header { border-bottom: 1px solid #ccc; padding-bottom: 0.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.header h1 { font-size: 1.4rem; font-weight: 700; }
.header nav a { margin-left: 1rem; font-size: 0.95rem; }
.card { border: 1px solid #ccc; padding: 1.5rem; margin-bottom: 1.5rem; }
.card h2 { font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 700; margin-bottom: 0.3rem; font-size: 0.95rem; }
.form-group input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #888; background: #fff; color: #000; }
.form-group input:focus { outline: none; border-color: #000; }
.btn { display: inline-block; padding: 0.5rem 1.25rem; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-size: 0.95rem; text-decoration: none; }
.btn:hover { background: #333; }
.btn-outline { background: #fff; color: #000; }
.btn-outline:hover { background: #f0f0f0; }
.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.85rem; }
.error { border: 1px solid #c00; background: #fdd; padding: 0.5rem 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; }
.success { border: 1px solid #080; background: #dfd; padding: 0.5rem 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; }
.info { border: 1px solid #08c; background: #def; padding: 0.5rem 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; }
.text-muted { color: #555; font-size: 0.9rem; }
.text-sm { font-size: 0.85rem; }
.mt-1 { margin-top: 1rem; }
.mb-1 { margin-bottom: 1rem; }
.chat-window { border: 1px solid #ccc; max-height: 60vh; overflow-y: auto; padding: 1rem; margin-bottom: 1rem; }
.msg-user { text-align: right; margin-bottom: 0.75rem; }
.msg-user .bubble { display: inline-block; background: #f0f0f0; border: 1px solid #ccc; padding: 0.5rem 0.75rem; max-width: 80%; text-align: left; }
.msg-assist { margin-bottom: 0.75rem; }
.msg-assist .bubble { display: inline-block; background: #fff; border: 1px solid #ccc; padding: 0.5rem 0.75rem; max-width: 80%; }
.msg-assist .label { font-size: 0.8rem; color: #555; margin-bottom: 0.15rem; }
.chat-input-row { display: flex; gap: 0.5rem; }
.chat-input-row input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #888; background: #fff; color: #000; }
.sidebar-layout { display: flex; gap: 1.5rem; }
.sidebar { width: 240px; flex-shrink: 0; }
.sidebar .conv-item { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.5rem; border: 1px solid #ccc; margin-bottom: 0.3rem; cursor: pointer; font-size: 0.9rem; }
.sidebar .conv-item:hover { background: #f5f5f5; }
.sidebar .conv-item.active { background: #e0e0e0; }
.sidebar .conv-item .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.main { flex: 1; min-width: 0; }
.mem-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid #ccc; margin-bottom: 0.3rem; font-size: 0.9rem; }
.mem-item .mem-type { font-size: 0.8rem; color: #555; width: 70px; flex-shrink: 0; }
.mem-item .mem-content { flex: 1; }
.timestamp { font-size: 0.75rem; color: #888; margin-top: 0.3rem; text-align: right; }
.typing-cursor { display: inline-block; animation: blink 1s step-end infinite; font-weight: 700; color: #555; }
@keyframes blink { 50% { opacity: 0; } }
.msg-assist .bubble { line-height: 1.65; }
.msg-assist .bubble p { margin: 0.4rem 0; }
.msg-assist .bubble ul, .msg-assist .bubble ol { margin: 0.4rem 0; padding-left: 1.5rem; }
.msg-assist .bubble pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 0.75rem; overflow-x: auto; margin: 0.5rem 0; font-size: 0.85rem; }
.msg-assist .bubble code { font-family: 'Courier New', Courier, monospace; background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
.msg-assist .bubble pre code { background: none; padding: 0; border-radius: 0; font-size: 0.85rem; }
.msg-assist .bubble blockquote { border-left: 3px solid #ccc; padding-left: 0.75rem; margin: 0.5rem 0; color: #555; }
.msg-assist .bubble a { color: #3366cc; }
.msg-assist .bubble table { border-collapse: collapse; margin: 0.5rem 0; font-size: 0.9rem; }
.msg-assist .bubble th, .msg-assist .bubble td { border: 1px solid #ccc; padding: 0.3rem 0.6rem; text-align: left; }
.msg-assist .bubble th { background: #f0f0f0; font-weight: 700; }
.msg-assist .bubble img { max-width: 100%; height: auto; }
.citations { margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #ddd; font-size: 0.85rem; }
.citations p { font-weight: 700; margin-bottom: 0.3rem; }
.citations ul { list-style: none; padding: 0; margin: 0; }
.citations li { margin-bottom: 0.4rem; padding: 0.3rem 0.5rem; background: #f9f9f9; border: 1px solid #eee; border-radius: 3px; }
.citations a { color: #3366cc; text-decoration: none; font-weight: 700; }
.citations a:hover { text-decoration: underline; }
.cit-snippet { color: #666; font-size: 0.8rem; display: block; margin-top: 0.15rem; }
.process-summary { margin-top: 0.5rem; font-size: 0.8rem; color: #666; cursor: pointer; }
.process-summary:hover { color: #333; }
.process-details { font-size: 0.8rem; color: #555; margin-top: 0.3rem; padding: 0.4rem 0.5rem; background: #fafafa; border: 1px solid #eee; border-radius: 3px; display: none; }
.process-details.open { display: block; }
@media (max-width: 700px) { .sidebar-layout { flex-direction: column; } .sidebar { width: 100%; } }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css">
</head>
<body>
<div class="container">
"""

LAYOUT_BOTTOM = """\
</div>
</body>
</html>
"""

# ── Routes ──────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    if flask_session.get("token"):
        return redirect(url_for("chat"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    error = ""
    if request.method == "POST":
        email = request.form.get("email", "")
        password = request.form.get("password", "")
        try:
            data = api_post("/api/auth/login", {"email": email, "password": password})
            flask_session["token"] = data["token"]
            flask_session["user"] = data["user"]
            return redirect(url_for("chat"))
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


@app.route("/register", methods=["GET", "POST"])
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
                return redirect(url_for("chat"))
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


@app.route("/forgot-password", methods=["GET", "POST"])
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
                return redirect(url_for("forgot_password", step=1))
            except Exception as e:
                error = str(e)
        elif step == 1:
            otp = request.form.get("otp", "")
            try:
                data = api_post("/api/auth/password-reset/verify", {"email": reset_email, "otp": otp})
                flask_session["token"] = data["token"]
                flask_session["user"] = data["user"]
                return redirect(url_for("chat"))
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


@app.route("/logout")
def logout():
    try:
        api_post("/api/auth/logout")
    except Exception:
        pass
    flask_session.clear()
    return redirect(url_for("login"))


@app.route("/chat")
@login_required
def chat():
    user = flask_session.get("user", {})
    conversations = []
    try:
        conversations = api_get("/api/conversations")
    except Exception:
        pass
    return render_template_string(LAYOUT_TOP + """\
<div class="header">
<h1>PralayAI</h1>
<nav>
<span class="text-muted">{{ user.get('username','') }}</span>
<a href="/settings">Settings</a>
<a href="/memory">Memory</a>
<a href="/logout">Sign Out</a>
</nav>
</div>

<div class="sidebar-layout">
<div class="sidebar">
<div class="mb-1"><a href="/chat" class="btn btn-sm btn-outline">+ New Chat</a></div>
{% for conv in conversations %}
<div class="conv-item" onclick="window.location='/chat/{{ conv.id }}'">
<span class="title">{{ conv.title[:28] }}</span>
<form method="post" action="/conversation/{{ conv.id }}/delete" style="margin:0;" onsubmit="return confirm('Delete this conversation?')">
<button type="submit" class="btn btn-sm btn-outline" style="padding:0.15rem 0.4rem;font-size:0.75rem;">X</button>
</form>
</div>
{% endfor %}
<div class="sidebar-section context-box" id="context-box" style="display:none;margin-top:0.5rem;">
<p class="text-muted" style="font-size:0.8rem;font-weight:700;margin-bottom:0.3rem;">Context</p>
<div class="context-content" id="context-content" style="font-size:0.8rem;color:#555;">Loading...</div>
</div>
</div>

<div class="main">
<div class="status-bar" id="status-bar"></div>
<div class="chat-window" id="chat-window">
{% for msg in messages %}
<div class="msg-{{ msg.role }}">
<div class="bubble">
<div class="msg-text">{{ msg.content }}</div>
{% if msg.role == 'user' %}<div class="timestamp">{{ msg.time or '' }}</div>{% endif %}
</div>
</div>
{% endfor %}
</div>
<div class="chat-input-row">
<input type="text" id="chat-input" placeholder="Ask about cybersecurity..." autofocus onkeydown="if(event.key==='Enter')sendMessage()">
<button class="btn" onclick="try{sendMessage()}catch(e){alert(e.message)}">Send</button>
</div>
</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
<script>
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, {language: lang}).value; } catch(e) {}
    }
    try { return hljs.highlightAuto(code).value; } catch(e) {}
    return code;
  }
});

var cid = "{{ current_cid or '' }}";
var messages = {{ messages_json | safe }};
if (cid) { loadContext(cid); }

function escapeHtml(text) {
  var d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function formatTime(date) {
  var h = date.getHours(), m = date.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

function scrollBottom() {
  var w = document.getElementById('chat-window');
  w.scrollTop = w.scrollHeight;
}

function addMessage(role, content, date) {
  var w = document.getElementById('chat-window');
  var d = document.createElement('div');
  d.className = 'msg-' + role;
  var ts = date ? '<div class="timestamp">' + formatTime(date) + '</div>' : '';
  var body = role === 'user' ? escapeHtml(content).replace(/\\n/g, '<br>') : marked.parse(content);
  d.innerHTML = '<div class="bubble"><div class="msg-text">' + body + '</div>' + ts + '</div>';
  w.appendChild(d);
  scrollBottom();
}

async function sendMessage() {
  var input = document.getElementById('chat-input');
  var text = input.value.trim();
  if (!text) return false;
  input.value = '';

  var now = new Date();
  addMessage('user', text, now);

  var tmp = document.createElement('div');
  tmp.className = 'msg-assist';
  tmp.innerHTML = '<div class="bubble"><div class="msg-text"><span class="typing-cursor">|</span></div></div>';
  document.getElementById('chat-window').appendChild(tmp);
  scrollBottom();

  try {
    var res = await fetch('/api/proxy/chat/stream', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text, conversation_id: cid})
    });
    if (!res.ok) throw new Error('Connection failed');
    if (!res.body) throw new Error('Stream not supported');

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var fullText = '';
    var citations = [];
    var processInfo = null;
    var reasoningSummary = '';
    var streamDone = false;
    var statusBar = null;

    while (true) {
      var result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, {stream: true});
      var parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (var p = 0; p < parts.length; p++) {
        var part = parts[p];
        var lines = part.split('\\n');
        for (var l = 0; l < lines.length; l++) {
          var line = lines[l];
          if (line.startsWith('data: ')) {
            try {
              var evt = JSON.parse(line.slice(6));
              switch (evt.type) {
                case 'delta':
                  fullText += evt.delta;
                  tmp.querySelector('.msg-text').innerHTML = marked.parse(fullText);
                  scrollBottom();
                  break;
                case 'citations':
                  citations = evt.data || [];
                  break;
                case 'process':
                  processInfo = evt;
                  break;
                case 'reasoning':
                  reasoningSummary = evt.summary || '';
                  break;
                case 'intent':
                  if (evt.thinking_level && document.getElementById('status-bar')) {
                    document.getElementById('status-bar').textContent = 'Thinking: ' + evt.thinking_level + ' | Mode: ' + (evt.mode || '');
                  }
                  break;
                case 'status':
                  if (document.getElementById('status-bar')) {
                    document.getElementById('status-bar').textContent = evt.message || '';
                  }
                  break;
                case 'conversation':
                  cid = evt.conversation_id;
                  window.history.replaceState(null, '', '/chat/' + cid);
                  loadContext(cid);
                  break;
                case 'done':
                  streamDone = true;
                  break;
                case 'error':
                  throw new Error(evt.error);
              }
            } catch(e) {
              if (!e.message || e.message === 'Error') continue;
              throw e;
            }
          }
        }
      }
    }

    if (!streamDone) {
      tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#c00;">Stream ended unexpectedly</div></div>';
      return false;
    }

    var bubble = tmp.querySelector('.bubble');
    var msgTextDiv = tmp.querySelector('.msg-text');

    // Append citations
    if (citations.length > 0) {
      var citHtml = '<div class="citations"><p>Sources</p><ul>';
      for (var c = 0; c < citations.length; c++) {
        var cit = citations[c];
        citHtml += '<li>';
        if (cit.url) {
          citHtml += '<a href="' + cit.url + '" target="_blank" rel="noopener">' + escapeHtml(cit.title) + '</a>';
        } else {
          citHtml += escapeHtml(cit.title || 'Source');
        }
        if (cit.snippet) {
          citHtml += '<span class="cit-snippet">' + escapeHtml(cit.snippet.substring(0, 250)) + '</span>';
        }
        citHtml += '</li>';
      }
      citHtml += '</ul></div>';
      bubble.innerHTML += citHtml;
    }

    // Reasoning summary
    if (reasoningSummary) {
      var reasHtml = '<div class="process-summary" onclick="var d=this.nextElementSibling; if(d) d.classList.toggle(\'open\')">Show Reasoning Summary</div>';
      reasHtml += '<div class="process-details"><p>' + escapeHtml(reasoningSummary) + '</p></div>';
      bubble.innerHTML += reasHtml;
    }

    // Append process summary (collapsible)
    if (processInfo) {
      var procHtml = '<div class="process-summary" onclick="var d=this.nextElementSibling;if(d)d.classList.toggle(\'open\')">';
      if (processInfo.confidence) procHtml += ' Confidence: ' + processInfo.confidence;
      if (processInfo.skill) procHtml += ' | Skill: ' + processInfo.skill;
      if (processInfo.num_sources) procHtml += ' | Sources: ' + processInfo.num_sources;
      procHtml += ' (details)</div>';
      procHtml += '<div class="process-details">';
      if (processInfo.assumptions && processInfo.assumptions.length > 0) {
        procHtml += '<p><strong>Assumptions:</strong></p><ul>';
        for (var a = 0; a < processInfo.assumptions.length; a++) procHtml += '<li>' + escapeHtml(processInfo.assumptions[a]) + '</li>';
        procHtml += '</ul>';
      }
      if (processInfo.limitations && processInfo.limitations.length > 0) {
        procHtml += '<p><strong>Limitations:</strong></p><ul>';
        for (var li = 0; li < processInfo.limitations.length; li++) procHtml += '<li>' + escapeHtml(processInfo.limitations[li]) + '</li>';
        procHtml += '</ul>';
      }
      procHtml += '</div>';
      bubble.innerHTML += procHtml;
    }

    // Timestamp
    var ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.textContent = formatTime(new Date());
    bubble.appendChild(ts);

    scrollBottom();
  } catch(e) {
    tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#c00;">Error: ' + escapeHtml(e.message) + '</div></div>';
  }
  return false;
}

scrollBottom();
</script>
""" + LAYOUT_BOTTOM, user=user, conversations=conversations,
        messages=flask_session.get("chat_messages", []),
        messages_json=json.dumps(flask_session.get("chat_messages", [])),
        current_cid=flask_session.get("current_cid"))


@app.route("/chat/<conversation_id>")
@login_required
def chat_with_id(conversation_id):
    user = flask_session.get("user", {})
    conversations = []
    messages = []
    current_cid = conversation_id
    try:
        conversations = api_get("/api/conversations")
        detail = api_get(f"/api/conversations/{conversation_id}")
        messages = [{"role": m["role"], "content": m["content"]} for m in detail.get("messages", [])]
        flask_session["chat_messages"] = messages
        flask_session["current_cid"] = current_cid
    except Exception:
        pass
    return render_template_string(LAYOUT_TOP + """\
<div class="header">
<h1>PralayAI</h1>
<nav>
<span class="text-muted">{{ user.get('username','') }}</span>
<a href="/settings">Settings</a>
<a href="/memory">Memory</a>
<a href="/logout">Sign Out</a>
</nav>
</div>

<div class="sidebar-layout">
<div class="sidebar">
<div class="mb-1"><a href="/chat" class="btn btn-sm btn-outline">+ New Chat</a></div>
{% for conv in conversations %}
<div class="conv-item{% if conv.id == current_cid %} active{% endif %}" onclick="window.location='/chat/{{ conv.id }}'">
<span class="title">{{ conv.title[:28] }}</span>
<form method="post" action="/conversation/{{ conv.id }}/delete" style="margin:0;" onsubmit="return confirm('Delete this conversation?')">
<button type="submit" class="btn btn-sm btn-outline" style="padding:0.15rem 0.4rem;font-size:0.75rem;">X</button>
</form>
</div>
{% endfor %}
</div>

<div class="main">
<div class="status-bar" id="status-bar"></div>
<div class="chat-window" id="chat-window">
{% for msg in messages %}
<div class="msg-{{ msg.role }}">
<div class="bubble">
<div class="msg-text">{{ msg.content }}</div>
{% if msg.role == 'user' %}<div class="timestamp">{{ msg.time or '' }}</div>{% endif %}
</div>
</div>
{% endfor %}
</div>
<div class="chat-input-row">
<input type="text" id="chat-input" placeholder="Ask about cybersecurity..." autofocus onkeydown="if(event.key==='Enter')sendMessage()">
<button class="btn" onclick="try{sendMessage()}catch(e){alert(e.message)}">Send</button>
</div>
</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
<script>
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, {language: lang}).value; } catch(e) {}
    }
    try { return hljs.highlightAuto(code).value; } catch(e) {}
    return code;
  }
});

var cid = "{{ current_cid }}";
var messages = {{ messages_json | safe }};

function escapeHtml(text) {
  var d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function formatTime(date) {
  var h = date.getHours(), m = date.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

function scrollBottom() { var w = document.getElementById('chat-window'); w.scrollTop = w.scrollHeight; }

function addMessage(role, content, date) {
  var w = document.getElementById('chat-window');
  var d = document.createElement('div');
  d.className = 'msg-' + role;
  var ts = date ? '<div class="timestamp">' + formatTime(date) + '</div>' : '';
  var body = role === 'user' ? escapeHtml(content).replace(/\n/g, '<br>') : marked.parse(content);
  d.innerHTML = '<div class="bubble"><div class="msg-text">' + body + '</div>' + ts + '</div>';
  w.appendChild(d);
  scrollBottom();
}

async function loadContext(sessionId) {
  try {
    var r = await fetch('/api/proxy/context/' + sessionId);
    if (!r.ok) return;
    var ctx = await r.json();
    var html = '';
    if (ctx.current_topic) html += '<p><strong>Topic:</strong> ' + escapeHtml(ctx.current_topic.substring(0, 80)) + '</p>';
    if (ctx.skill_used) html += '<p><strong>Skill:</strong> ' + escapeHtml(ctx.skill_used) + '</p>';
    if (ctx.language && ctx.language !== 'english') html += '<p><strong>Lang:</strong> ' + escapeHtml(ctx.language) + '</p>';
    if (ctx.summary) html += '<p>' + escapeHtml(ctx.summary.substring(0, 120)) + '</p>';
    if (html) {
      document.getElementById('context-content').innerHTML = html;
      document.getElementById('context-box').style.display = 'block';
    }
  } catch(e) {}
}

async function sendMessage() {
  var input = document.getElementById('chat-input');
  var text = input.value.trim();
  if (!text) return false;
  input.value = '';

  var now = new Date();
  addMessage('user', text, now);

  var tmp = document.createElement('div');
  tmp.className = 'msg-assist';
  tmp.innerHTML = '<div class="bubble"><div class="msg-text"><span class="typing-cursor">|</span></div></div>';
  document.getElementById('chat-window').appendChild(tmp);
  scrollBottom();

  try {
    var res = await fetch('/api/proxy/chat/stream', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text, conversation_id: cid})
    });
    if (!res.ok) throw new Error('Connection failed');
    if (!res.body) throw new Error('Stream not supported');

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var fullText = '';
    var citations = [];
    var processInfo = null;
    var reasoningSummary = '';
    var streamDone = false;
    var statusBar = null;

    while (true) {
      var result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, {stream: true});
      var parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (var p = 0; p < parts.length; p++) {
        var part = parts[p];
        var lines = part.split('\\n');
        for (var l = 0; l < lines.length; l++) {
          var line = lines[l];
          if (line.startsWith('data: ')) {
            try {
              var evt = JSON.parse(line.slice(6));
              switch (evt.type) {
                case 'delta':
                  fullText += evt.delta;
                  tmp.querySelector('.msg-text').innerHTML = marked.parse(fullText);
                  scrollBottom();
                  break;
                case 'citations':
                  citations = evt.data || [];
                  break;
                case 'process':
                  processInfo = evt;
                  break;
                case 'reasoning':
                  reasoningSummary = evt.summary || '';
                  break;
                case 'intent':
                  if (evt.thinking_level && document.getElementById('status-bar')) {
                    document.getElementById('status-bar').textContent = 'Thinking: ' + evt.thinking_level + ' | Mode: ' + (evt.mode || '');
                  }
                  break;
                case 'status':
                  if (document.getElementById('status-bar')) {
                    document.getElementById('status-bar').textContent = evt.message || '';
                  }
                  break;
                case 'conversation':
                  cid = evt.conversation_id;
                  window.history.replaceState(null, '', '/chat/' + cid);
                  loadContext(cid);
                  break;
                case 'done':
                  streamDone = true;
                  break;
                case 'error':
                  throw new Error(evt.error);
              }
            } catch(e) {
              if (!e.message || e.message === 'Error') continue;
              throw e;
            }
          }
        }
      }
    }

    if (!streamDone) {
      tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#c00;">Stream ended unexpectedly</div></div>';
      return false;
    }

    var bubble = tmp.querySelector('.bubble');
    var msgTextDiv = tmp.querySelector('.msg-text');

    // Append citations
    if (citations.length > 0) {
      var citHtml = '<div class="citations"><p>Sources</p><ul>';
      for (var c = 0; c < citations.length; c++) {
        var cit = citations[c];
        citHtml += '<li>';
        if (cit.url) {
          citHtml += '<a href="' + cit.url + '" target="_blank" rel="noopener">' + escapeHtml(cit.title) + '</a>';
        } else {
          citHtml += escapeHtml(cit.title || 'Source');
        }
        if (cit.snippet) {
          citHtml += '<span class="cit-snippet">' + escapeHtml(cit.snippet.substring(0, 250)) + '</span>';
        }
        citHtml += '</li>';
      }
      citHtml += '</ul></div>';
      bubble.innerHTML += citHtml;
    }

    // Reasoning summary
    if (reasoningSummary) {
      var reasHtml = '<div class="process-summary" onclick="var d=this.nextElementSibling; if(d) d.classList.toggle(\'open\')">Show Reasoning Summary</div>';
      reasHtml += '<div class="process-details"><p>' + escapeHtml(reasoningSummary) + '</p></div>';
      bubble.innerHTML += reasHtml;
    }

    // Append process summary (collapsible)
    if (processInfo) {
      var procHtml = '<div class="process-summary" onclick="var d=this.nextElementSibling;if(d)d.classList.toggle(\'open\')">';
      if (processInfo.confidence) procHtml += ' Confidence: ' + processInfo.confidence;
      if (processInfo.skill) procHtml += ' | Skill: ' + processInfo.skill;
      if (processInfo.num_sources) procHtml += ' | Sources: ' + processInfo.num_sources;
      procHtml += ' (details)</div>';
      procHtml += '<div class="process-details">';
      if (processInfo.assumptions && processInfo.assumptions.length > 0) {
        procHtml += '<p><strong>Assumptions:</strong></p><ul>';
        for (var a = 0; a < processInfo.assumptions.length; a++) procHtml += '<li>' + escapeHtml(processInfo.assumptions[a]) + '</li>';
        procHtml += '</ul>';
      }
      if (processInfo.limitations && processInfo.limitations.length > 0) {
        procHtml += '<p><strong>Limitations:</strong></p><ul>';
        for (var li = 0; li < processInfo.limitations.length; li++) procHtml += '<li>' + escapeHtml(processInfo.limitations[li]) + '</li>';
        procHtml += '</ul>';
      }
      procHtml += '</div>';
      bubble.innerHTML += procHtml;
    }

    // Timestamp
    var ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.textContent = formatTime(new Date());
    bubble.appendChild(ts);

    scrollBottom();
  } catch(e) {
    tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#c00;">Error: ' + escapeHtml(e.message) + '</div></div>';
  }
  return false;
}

scrollBottom();
</script>
""" + LAYOUT_BOTTOM, user=user, conversations=conversations,
        messages=messages, messages_json=json.dumps(messages),
        current_cid=current_cid)


@app.route("/settings", methods=["GET", "POST"])
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
            cur = request.form.get("current_password", "")
            new = request.form.get("new_password", "")
            confirm = request.form.get("confirm_password", "")
            if new != confirm:
                error = "Passwords do not match."
            elif len(new) < 6:
                error = "Password must be at least 6 characters."
            else:
                try:
                    api_put("/api/auth/change-password", {"current_password": cur, "new_password": new})
                    success = "Password changed."
                except Exception as e:
                    error = str(e)
        elif action == "preferences":
            lang = request.form.get("language", "english")
            thinking = request.form.get("thinking_level", "medium")
            theme = request.form.get("theme", "dark")
            style_json = '{"format":"paragraph","tone":"professional","length":"medium"}'
            try:
                data = api_put("/api/auth/profile", {
                    "username": flask_session.get("user", {}).get("username", ""),
                    "preferred_language": lang,
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
<div class="form-group"><label>Language</label>
<select name="language">
<option value="english" {% if user.get('preferred_language','english') == 'english' %}selected{% endif %}>English</option>
<option value="hindi" {% if user.get('preferred_language','') == 'hindi' %}selected{% endif %}>Hindi</option>
<option value="gujarati" {% if user.get('preferred_language','') == 'gujarati' %}selected{% endif %}>Gujarati</option>
<option value="hinglish" {% if user.get('preferred_language','') == 'hinglish' %}selected{% endif %}>Hinglish</option>
<option value="auto-detect" {% if user.get('preferred_language','') == 'auto-detect' %}selected{% endif %}>Auto-detect</option>
</select>
</div>
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
<div class="form-group"><label>Current Password</label><input type="password" name="current_password" required></div>
<div class="form-group"><label>New Password</label><input type="password" name="new_password" minlength="6" required></div>
<div class="form-group"><label>Confirm New Password</label><input type="password" name="confirm_password" minlength="6" required></div>
<button type="submit" class="btn">Change Password</button>
</form>
</div>
""" + LAYOUT_BOTTOM, user=user_data, success=success, error=error)


@app.route("/memory")
@login_required
def memory():
    memories = []
    try:
        data = api_get("/api/memory")
        memories = data.get("memories", [])
    except Exception:
        pass
    return render_template_string(LAYOUT_TOP + """\
<div class="header">
<h1>Memory</h1>
<nav><a href="/chat">Back to Chat</a> <a href="/logout">Sign Out</a></nav>
</div>
{% if not memories %}
<p class="text-muted">No memories yet. Talk to PralayAI and it will remember things about you.</p>
{% endif %}
{% for mem in memories %}
<div class="mem-item">
<span class="mem-type">{{ mem.get('type','fact')[:8] }}</span>
<span class="mem-content"><strong>{{ mem.get('key','') }}</strong> = {{ mem.get('value','') }}</span>
<form method="post" action="/memory/{{ mem.id }}/delete" style="margin:0;" onsubmit="return confirm('Delete this memory?')">
<button type="submit" class="btn btn-sm btn-outline">X</button>
</form>
</div>
{% endfor %}
""" + LAYOUT_BOTTOM, memories=memories)


@app.route("/memory/<memory_id>/delete", methods=["POST"])
@login_required
def delete_memory_route(memory_id):
    try:
        api_delete(f"/api/memory/{memory_id}")
    except Exception:
        pass
    return redirect(url_for("memory"))


@app.route("/conversation/<conversation_id>/delete", methods=["POST"])
@login_required
def delete_conversation_route(conversation_id):
    try:
        api_delete(f"/api/conversations/{conversation_id}")
    except Exception:
        pass
    return redirect(url_for("chat"))


@app.route("/api/proxy/context/<session_id>")
@login_required
def proxy_context(session_id):
    try:
        data = api_get(f"/api/chat/sessions/{session_id}/context")
        return data, 200
    except Exception:
        return {"error": "not found"}, 404


@app.route("/api/proxy/conversations/<conversation_id>/rename", methods=["POST"])
@login_required
def proxy_rename_conversation(conversation_id):
    title = request.get_json(force=True).get("title", "")
    try:
        data = api_patch(f"/api/conversations/{conversation_id}", {"title": title})
        return data, 200
    except Exception as e:
        return {"error": str(e)}, 400


@app.route("/api/proxy/chat", methods=["POST"])
@login_required
def proxy_chat():
    body = request.get_json(force=True)
    try:
        data = api_post("/api/chat", body)
        return data, 200
    except Exception as e:
        return {"error": str(e)}, 400


@app.route("/api/proxy/chat/stream", methods=["POST"])
@login_required
def proxy_chat_stream():
    body = request.get_json(force=True)
    token = flask_session.get("token", "")

    def event_stream():
        try:
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
            with requests.post(
                f"{API_BASE}/api/chat/stream",
                json=body,
                headers=headers,
                stream=True,
                timeout=120,
            ) as resp:
                for line in resp.iter_lines(decode_unicode=True):
                    if line:
                        yield line + "\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return Response(
        stream_with_context(event_stream()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
