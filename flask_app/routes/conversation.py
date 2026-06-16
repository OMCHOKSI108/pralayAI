from flask import Blueprint, redirect, url_for

from ..helpers import api_delete, login_required

conversation_bp = Blueprint("conversation", __name__)


@conversation_bp.route("/conversation/<conversation_id>/delete", methods=["POST"])
@login_required
def delete_conversation_route(conversation_id):
    try:
        api_delete(f"/api/conversations/{conversation_id}")
    except Exception:
        pass
    return redirect(url_for("chat.chat"))
