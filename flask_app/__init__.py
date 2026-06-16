from flask import Flask

from .config import Config
from .routes.auth import auth_bp
from .routes.chat import chat_bp
from .routes.settings import settings_bp
from .routes.memory import memory_bp
from .routes.tokens import tokens_bp
from .routes.conversation import conversation_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY

    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(memory_bp)
    app.register_blueprint(tokens_bp)
    app.register_blueprint(conversation_bp)

    return app
