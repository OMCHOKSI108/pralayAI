from flask import Blueprint, redirect, render_template_string, url_for

from ..helpers import api_delete, api_get, login_required
from ..layout import LAYOUT_BOTTOM, LAYOUT_TOP

memory_bp = Blueprint("memory", __name__)


@memory_bp.route("/memory")
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
<nav><a href="/chat">Back to Chat</a> <a href="/tokens">Tokens</a> <a href="/logout">Sign Out</a></nav>
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


@memory_bp.route("/memory/<memory_id>/delete", methods=["POST"])
@login_required
def delete_memory_route(memory_id):
    try:
        api_delete(f"/api/memory/{memory_id}")
    except Exception:
        pass
    return redirect(url_for("memory.memory"))
