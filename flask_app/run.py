import os
import sys

# Ensure the parent dir is on the path so the package can be found
_parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _parent not in sys.path:
    sys.path.insert(0, _parent)

from flask_app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
