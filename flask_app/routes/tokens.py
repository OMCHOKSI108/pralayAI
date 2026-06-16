import json

from flask import Blueprint, render_template_string

from ..helpers import api_get, login_required
from ..layout import LAYOUT_BOTTOM, LAYOUT_TOP

tokens_bp = Blueprint("tokens", __name__)


@tokens_bp.route("/tokens")
@login_required
def tokens_page():
    usage = []
    try:
        data = api_get("/api/tokens/usage")
        usage = data.get("usage", [])
    except Exception:
        pass
    labels_json = json.dumps([d["date"] for d in usage])
    data_json = json.dumps([d["total_tokens"] for d in usage])
    counts_json = json.dumps([d["message_count"] for d in usage])
    return render_template_string(LAYOUT_TOP + """\
<div class="header">
<h1>Token Usage</h1>
<nav><a href="/chat">Back to Chat</a> <a href="/memory">Memory</a> <a href="/logout">Sign Out</a></nav>
</div>
{% if not usage %}
<p class="text-muted">No token usage data yet.</p>
{% endif %}
<canvas id="tokenChart" width="800" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
var ctx = document.getElementById('tokenChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: {{ labels_json|safe }},
    datasets: [{
      label: 'Tokens Used',
      data: {{ data_json|safe }},
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderColor: '#000',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { afterLabel: function(ctx) {
        var counts = {{ counts_json|safe }};
        return 'Messages: ' + counts[ctx.dataIndex];
      }}}
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Tokens' }, beginAtZero: true }
    }
  }
});
</script>
""" + LAYOUT_BOTTOM, usage=usage, labels_json=labels_json, data_json=data_json, counts_json=counts_json)
