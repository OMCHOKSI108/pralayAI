import re
from typing import Dict, List, Optional, Tuple


CODE_KEYWORDS = {
    "python": ["python", "django", "flask", "fastapi", "pandas", "numpy", "async"],
    "javascript": ["javascript", "js", "node", "nodejs", "express", "react", "vue", "angular"],
    "typescript": ["typescript", "ts", "tsx"],
    "sql": ["sql", "query", "database", "postgresql", "mysql", "sqlite"],
    "bash": ["bash", "shell", "sh", "zsh", "command line"],
    "docker": ["docker", "container", "dockerfile", "docker-compose"],
    "html": ["html", "css", "frontend", "web page"],
}

DEBUG_KEYWORDS = [
    "debug", "bug", "error", "issue", "not working", "wrong",
    "problem", "fix", "why is", "doesn't work", "failed",
]


def is_debug_request(query: str) -> bool:
    query_lower = query.lower()
    return any(kw in query_lower for kw in DEBUG_KEYWORDS)


def detect_language(query: str) -> str:
    query_lower = query.lower()
    scores = {}
    for lang, keywords in CODE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in query_lower)
        if score > 0:
            scores[lang] = score

    if not scores:
        return "python"

    return max(scores, key=scores.get)


def format_code_response(query: str) -> str:
    lang = detect_language(query)
    is_debug = is_debug_request(query)

    if is_debug:
        return _format_debug_response(query, lang)
    return _format_implementation_response(query, lang)


def _format_implementation_response(query: str, lang: str) -> str:
    return f"""## Implementation

Here is a solution for your request in **{lang}**:

### File: `solution.{lang}`

```{lang}
# TODO: Implement {query[:60]}
# This is a placeholder structure for your requested implementation.
# Replace with actual code based on your specific requirements.

def main():
    # Your implementation here
    pass


if __name__ == "__main__":
    main()
```

### Usage

```bash
# TODO: Add usage instructions
```

### Notes
- Review the implementation for your specific use case
- Add error handling as needed
- Write tests to verify correctness
"""


def _format_debug_response(query: str, lang: str) -> str:
    return f"""## Debug Diagnosis

### Issue Analysis
You're asking about debugging a **{lang}** issue: "{query[:100]}"

To help debug effectively, please provide:
1. The error message or unexpected behavior
2. The relevant code snippet
3. What you expected to happen
4. What actually happened

### Common {lang} Debugging Steps

```bash
# Check syntax
{_get_lint_command(lang)}

# Run with verbose output
{_get_run_command(lang)}
```

### Checklist
- [ ] Check for typos in variable names
- [ ] Verify input data types
- [ ] Add logging to trace execution
- [ ] Test edge cases
- [ ] Review for off-by-one errors
"""


def _get_lint_command(lang: str) -> str:
    commands = {
        "python": "python -m py_compile script.py",
        "javascript": "npx eslint script.js",
        "typescript": "npx tsc --noEmit",
        "bash": "bash -n script.sh",
    }
    return commands.get(lang, "# Run linter for your language")


def _get_run_command(lang: str) -> str:
    commands = {
        "python": "python -u script.py",
        "javascript": "node script.js",
        "typescript": "npx ts-node script.ts",
        "bash": "bash -x script.sh",
    }
    return commands.get(lang, "# Run your program")
