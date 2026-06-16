LAYOUT_TOP = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PralayAI</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Times New Roman', Times, serif; background: #fff; color: #000; line-height: 1.6; height: 100vh; overflow: hidden; }
a { color: #000; text-decoration: underline; }
a:hover { color: #555; }
input, button, textarea, select { font-family: 'Times New Roman', Times, serif; font-size: 1rem; }
.container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.header { border-bottom: 1px solid #ccc; padding: 0.75rem 0; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
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
.chat-window { border: 1px solid #ccc; flex: 1; min-height: 0; overflow-y: auto; padding: 1rem; }
.msg-user { text-align: right; margin-bottom: 0.75rem; }
.msg-user .bubble { display: inline-block; background: #f0f0f0; border: 1px solid #ccc; padding: 0.5rem 0.75rem; max-width: 80%; text-align: left; }
.msg-assist { margin-bottom: 0.75rem; }
.msg-assist .bubble { display: inline-block; background: #fff; border: 1px solid #ccc; padding: 0.5rem 0.75rem; max-width: 80%; }
.msg-assist .label { font-size: 0.8rem; color: #555; margin-bottom: 0.15rem; }
.chat-input-row { display: flex; gap: 0.5rem; background: #fff; padding: 0.5rem 0; border-top: 1px solid #ccc; flex-shrink: 0; }
.chat-input-row input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #888; background: #fff; color: #000; }
.sidebar-layout { display: flex; gap: 1.5rem; flex: 1; min-height: 0; overflow: hidden; }
.sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; overflow-y: auto; padding-top: 0.5rem; }
.sidebar-header { flex-shrink: 0; }
.sidebar-list { overflow-y: auto; flex: 1; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.chat-scroll-area { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.sidebar .conv-item { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.5rem; border: 1px solid #ccc; margin-bottom: 0.3rem; cursor: pointer; font-size: 0.9rem; }
.sidebar .conv-item:hover { background: #f5f5f5; }
.sidebar .conv-item.active { background: #e0e0e0; }
.sidebar .conv-item { position: relative; }
.sidebar .conv-item .title-link { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #000; text-decoration: none; display: block; }
.sidebar .conv-item .title-link:hover { text-decoration: underline; }
.sidebar .conv-item form { flex-shrink: 0; }
.mem-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid #ccc; margin-bottom: 0.3rem; font-size: 0.9rem; }
.mem-item .mem-type { font-size: 0.8rem; color: #555; width: 70px; flex-shrink: 0; }
.mem-item .mem-content { flex: 1; }
.timestamp { font-size: 0.75rem; color: #888; margin-top: 0.3rem; text-align: right; }
.typing-cursor { display: inline-block; animation: blink 1s step-end infinite; font-weight: 700; color: #555; }
@keyframes blink { 50% { opacity: 0; } }
.msg-assist .bubble { line-height: 1.7; font-size: 0.97rem; }
.msg-assist .bubble p { margin: 0.5rem 0; }
.msg-assist .bubble p:first-child { margin-top: 0; }
.msg-assist .bubble h1, .msg-assist .bubble h2 { font-size: 1.05rem; font-weight: 700; margin: 1rem 0 0.4rem 0; padding-bottom: 0.2rem; border-bottom: 1px solid #ddd; }
.msg-assist .bubble h3 { font-size: 0.98rem; font-weight: 700; margin: 0.8rem 0 0.3rem 0; }
.msg-assist .bubble h4 { font-size: 0.95rem; font-weight: 700; margin: 0.6rem 0 0.25rem 0; }
.msg-assist .bubble h2:first-child, .msg-assist .bubble h1:first-child { margin-top: 0; }
.msg-assist .bubble ul, .msg-assist .bubble ol { margin: 0.4rem 0 0.6rem 0; padding-left: 1.6rem; }
.msg-assist .bubble li { margin-bottom: 0.25rem; line-height: 1.6; }
.msg-assist .bubble li > ul, .msg-assist .bubble li > ol { margin: 0.2rem 0; }
.msg-assist .bubble pre { background: #f8f8f8; border: 1px solid #e0e0e0; border-left: 3px solid #888; padding: 0.75rem 1rem; overflow-x: auto; margin: 0.6rem 0; font-size: 0.84rem; line-height: 1.5; border-radius: 2px; }
.msg-assist .bubble code { font-family: 'Courier New', Courier, monospace; background: #f0f0f0; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.88em; border: 1px solid #e0e0e0; }
.msg-assist .bubble pre code { background: none; padding: 0; border-radius: 0; border: none; font-size: 0.84rem; }
.msg-assist .bubble blockquote { border-left: 3px solid #bbb; padding: 0.3rem 0.75rem; margin: 0.5rem 0; color: #555; background: #fafafa; font-style: italic; }
.msg-assist .bubble a { color: #3366cc; text-decoration: underline; }
.msg-assist .bubble a:hover { color: #1144aa; }
.msg-assist .bubble table { border-collapse: collapse; width: 100%; margin: 0.6rem 0; font-size: 0.9rem; }
.msg-assist .bubble th, .msg-assist .bubble td { border: 1px solid #ccc; padding: 0.4rem 0.7rem; text-align: left; vertical-align: top; }
.msg-assist .bubble th { background: #f0f0f0; font-weight: 700; }
.msg-assist .bubble tr:nth-child(even) { background: #fafafa; }
.msg-assist .bubble img { max-width: 100%; height: auto; }
.msg-assist .bubble strong { font-weight: 700; }
.msg-assist .bubble em { font-style: italic; }
.citations { margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #ddd; font-size: 0.85rem; }
.citations p { font-weight: 700; margin-bottom: 0.3rem; }
.citations ul { list-style: none; padding: 0; margin: 0; }
.citations li { margin-bottom: 0.4rem; padding: 0.3rem 0.5rem; background: #f9f9f9; border: 1px solid #eee; }
.citations a { color: #3366cc; text-decoration: none; font-weight: 700; }
.citations a:hover { text-decoration: underline; }
.cit-snippet { color: #666; font-size: 0.8rem; display: block; margin-top: 0.15rem; }
.process-summary { margin-top: 0.5rem; font-size: 0.8rem; color: #666; cursor: pointer; }
.process-summary:hover { color: #333; }
.process-details { font-size: 0.8rem; color: #555; margin-top: 0.3rem; padding: 0.4rem 0.5rem; background: #fafafa; border: 1px solid #eee; display: none; }
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
