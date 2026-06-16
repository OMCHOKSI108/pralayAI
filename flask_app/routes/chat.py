import json

import requests
from flask import (
    Blueprint,
    Response,
    render_template_string,
    request,
    session as flask_session,
    stream_with_context,
)
from flask import url_for

from ..config import Config
from ..helpers import api_get, api_patch, api_post, login_required
from ..layout import LAYOUT_BOTTOM, LAYOUT_TOP

chat_bp = Blueprint("chat", __name__)


def _chat_js(cid_value, messages_json, with_load_context):
    base_js = """
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

var cid = "{CID}";
var messages = {MESSAGES};

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
  var body = role === 'user' ? escapeHtml(content).replace(/\\n/g, '<br>') : marked.parse(content);
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
"""
    send_msg_js = r"""
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

  window._abortController = new AbortController();
  document.getElementById('send-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = '';

  try {
    var res = await fetch('/api/proxy/chat/stream', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text, conversation_id: cid}),
      signal: window._abortController.signal
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
      try {
      var result = await reader.read();
      } catch(e) {
        if (e.name === 'AbortError') { streamDone = true; break; }
        throw e;
      }
      if (result.done) break;
      buffer += decoder.decode(result.value, {stream: true});
      var parts = buffer.split('\n\n');
      buffer = parts.pop();
      for (var p = 0; p < parts.length; p++) {
        var part = parts[p];
        var lines = part.split('\n');
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
                  // Intentionally not displaying mode/thinking_level to user
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
      tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#555;font-style:italic;">Response ended early. Please try again.</div></div>';
      window._abortController = null;
      document.getElementById('send-btn').style.display = '';
      document.getElementById('stop-btn').style.display = 'none';
      return false;
    }

    var bubble = tmp.querySelector('.bubble');
    var msgTextDiv = tmp.querySelector('.msg-text');

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

    // reasoningSummary and processInfo (confidence/skill/sources) are intentionally
    // not shown in the normal UI — they are debug/internal data.
    // Set DEV_MODE=true in Config to expose them.

    var ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.textContent = formatTime(new Date());
    bubble.appendChild(ts);

    scrollBottom();
  } catch(e) {
    // Show error in a neutral style rather than alarming red
    tmp.innerHTML = '<div class="bubble"><div class="msg-text" style="color:#555;font-style:italic;">Something went wrong. Please try again.</div></div>';
    console.error('Chat error:', e.message);
  }
  window._abortController = null;
  document.getElementById('send-btn').style.display = '';
  document.getElementById('stop-btn').style.display = 'none';
  return false;
}

// Re-render markdown for history messages that were server-rendered as plain text
document.querySelectorAll('.msg-text[data-md]').forEach(function(el) {
  var raw = el.textContent;
  if (raw.trim()) { el.innerHTML = marked.parse(raw); }
});
scrollBottom();
"""
    load = "\nif (cid) { loadContext(cid); }\n" if with_load_context else "\n"
    return base_js.replace("{CID}", cid_value).replace("{MESSAGES}", messages_json) + load + send_msg_js


def _chat_template(active_cid_class, cid_template_var, with_load_context):
    user = flask_session.get("user", {})
    conversations = flask_session.get("conversations", [])
    messages = flask_session.get("chat_messages", [])
    messages_json = json.dumps(messages).replace("</", "<\\/")
    cid_val = flask_session.get("current_cid", "")
    js = _chat_js(cid_val, messages_json, with_load_context)
    return LAYOUT_TOP + """\
<div class="header">
<h1>PralayAI</h1>
<nav>
<span class="text-muted">{{ user.get('username','') }}</span>
<a href="/settings">Settings</a>
<a href="/memory">Memory</a>
<a href="/tokens">Tokens</a>
<a href="/logout">Sign Out</a>
</nav>
</div>

<div class="sidebar-layout">
<div class="sidebar">
<div class="sidebar-header">
<div class="mb-1"><a href="/chat" class="btn btn-sm btn-outline">+ New Chat</a></div>
</div>
<div class="sidebar-list">
{% for conv in conversations %}
<div class="conv-item""" + active_cid_class + r"""">
<a href="/chat/{{ conv.id }}" class="title-link">{{ conv.title[:28] }}</a>
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
</div>

<div class="main">
<div class="status-bar" id="status-bar"></div>
<div class="chat-window" id="chat-window">
{% for msg in messages %}
<div class="msg-{{ msg.role }}">
<div class="bubble">
{% if msg.role == 'assistant' %}
<div class="msg-text" data-md="1">{{ msg.content }}</div>
{% else %}
<div class="msg-text">{{ msg.content }}</div>
{% endif %}
{% if msg.role == 'user' %}<div class="timestamp">{{ msg.time or '' }}</div>{% endif %}
</div>
</div>
{% endfor %}
</div>
</div>
</div>
<div class="chat-input-row">
<input type="text" id="chat-input" placeholder="Ask about cybersecurity..." autofocus onkeydown="if(event.key==='Enter')try{sendMessage()}catch(e){alert(e.message)}">
<button class="btn" id="send-btn" onclick="try{sendMessage()}catch(e){alert(e.message)}">Send</button>
<button class="btn" id="stop-btn" style="display:none" onclick="try{window._abortController&&window._abortController.abort()}catch(e){}">Stop</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
<script>
""" + js + r"""
</script>
""" + LAYOUT_BOTTOM


@chat_bp.route("/chat")
@login_required
def chat():
    conversations = []
    try:
        conversations = api_get("/api/conversations")
        flask_session["conversations"] = conversations
    except Exception:
        pass
    flask_session["current_cid"] = ""
    flask_session["chat_messages"] = []
    user = flask_session.get("user", {})
    tmpl = _chat_template("", "{{ current_cid or '' }}", False)
    return render_template_string(tmpl, user=user, conversations=conversations,
                                  messages=flask_session.get("chat_messages", []),
                                  messages_json=json.dumps(flask_session.get("chat_messages", [])).replace("</", "<\\/"),
                                  current_cid=flask_session.get("current_cid"))


@chat_bp.route("/chat/<conversation_id>")
@login_required
def chat_with_id(conversation_id):
    conversations = []
    messages = []
    current_cid = conversation_id
    try:
        conversations = api_get("/api/conversations")
        flask_session["conversations"] = conversations
        detail = api_get(f"/api/conversations/{conversation_id}")
        messages = [{"role": m["role"], "content": m["content"]} for m in detail.get("messages", [])]
        flask_session["chat_messages"] = messages
        flask_session["current_cid"] = current_cid
    except Exception:
        pass
    user = flask_session.get("user", {})
    tmpl = _chat_template("{% if conv.id == current_cid %} active{% endif %}", "{{ current_cid }}", True)
    return render_template_string(tmpl, user=user, conversations=conversations,
                                  messages=messages,
                                  messages_json=json.dumps(messages).replace("</", "<\\/"),
                                  current_cid=current_cid)


@chat_bp.route("/api/proxy/context/<session_id>")
@login_required
def proxy_context(session_id):
    try:
        data = api_get(f"/api/chat/sessions/{session_id}/context")
        return data, 200
    except Exception:
        return {"error": "not found"}, 404


@chat_bp.route("/api/proxy/conversations/<conversation_id>/rename", methods=["POST"])
@login_required
def proxy_rename_conversation(conversation_id):
    title = request.get_json(force=True).get("title", "")
    try:
        data = api_patch(f"/api/conversations/{conversation_id}", {"title": title})
        return data, 200
    except Exception as e:
        return {"error": str(e)}, 400


@chat_bp.route("/api/proxy/chat", methods=["POST"])
@login_required
def proxy_chat():
    body = request.get_json(force=True)
    try:
        data = api_post("/api/chat", body)
        return data, 200
    except Exception as e:
        return {"error": str(e)}, 400


@chat_bp.route("/api/proxy/chat/stream", methods=["POST"])
@login_required
def proxy_chat_stream():
    body = request.get_json(force=True)
    token = flask_session.get("token", "")

    def event_stream():
        try:
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
            with requests.post(
                f"{Config.API_BASE}/api/chat/stream",
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
