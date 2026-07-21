"""
VulnLab API - INTENTIONALLY INSECURE for security testing only.
Do NOT deploy to production or expose to the internet.
"""

import base64
import hashlib
import os
import pickle
import sqlite3
import subprocess
from pathlib import Path

import requests
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

# VULN: Hardcoded secrets (SAST / secret scanning)
SECRET_KEY = "super-secret-key-12345"
ADMIN_PASSWORD = "admin123"
API_KEY = "sk-live-vulnlab-abc123xyz789"
DATABASE_PASSWORD = "db_password_leaked_in_code"

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["DEBUG"] = True  # VULN: Debug mode enabled

# VULN: Overly permissive CORS
CORS(app, origins="*", supports_credentials=True)

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "vulnlab.db"
UPLOADS_DIR = DATA_DIR / "uploads"
PRIVATE_DIR = DATA_DIR / "private"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DATA_DIR.mkdir(exist_ok=True)
    UPLOADS_DIR.mkdir(exist_ok=True)
    PRIVATE_DIR.mkdir(exist_ok=True)

    secret_file = PRIVATE_DIR / "secret.txt"
    if not secret_file.exists():
        secret_file.write_text("CONFIDENTIAL: employee salaries and API keys live here.\n")

    conn = get_db()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            email TEXT
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price REAL,
            description TEXT
        );
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY,
            product_id INTEGER,
            username TEXT,
            content TEXT
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            product_name TEXT,
            total REAL,
            status TEXT
        );
        """
    )

    users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if users == 0:
        conn.executemany(
            "INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)",
            [
                ("alice", "password123", "user", "alice@example.com"),
                ("bob", "qwerty", "user", "bob@example.com"),
                ("admin", ADMIN_PASSWORD, "admin", "admin@vulnlab.local"),
            ],
        )
        conn.executemany(
            "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
            [
                ("Laptop", 999.99, "Dev machine"),
                ("Mouse", 29.99, "Wireless mouse"),
                ("Keyboard", 79.99, "Mechanical keyboard"),
            ],
        )
        conn.executemany(
            "INSERT INTO orders (user_id, product_name, total, status) VALUES (?, ?, ?, ?)",
            [
                (1, "Laptop", 999.99, "shipped"),
                (2, "Mouse", 29.99, "pending"),
                (3, "Keyboard", 79.99, "delivered"),
            ],
        )
    conn.commit()
    conn.close()


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "app": "VulnLab", "warning": "intentionally insecure"})


# --- VULN: SQL Injection (login) ---
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username = data.get("username", "")
    password = data.get("password", "")

    conn = get_db()
    # VULN: String concatenation SQL injection
    query = f"SELECT id, username, role, email FROM users WHERE username = '{username}' AND password = '{password}'"
    try:
        row = conn.execute(query).fetchone()
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e), "query": query}), 500
    conn.close()

    if row:
        token = base64.b64encode(f"{row['username']}:{row['role']}".encode()).decode()
        return jsonify(
            {
                "success": True,
                "user": {"id": row["id"], "username": row["username"], "role": row["role"], "email": row["email"]},
                "token": token,
            }
        )
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


# --- VULN: SQL Injection (search) ---
@app.route("/api/products/search")
def search_products():
    q = request.args.get("q", "")
    conn = get_db()
    query = f"SELECT id, name, price, description FROM products WHERE name LIKE '%{q}%' OR description LIKE '%{q}%'"
    try:
        rows = conn.execute(query).fetchall()
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e), "query": query}), 500
    conn.close()
    return jsonify({"products": [dict(r) for r in rows], "query_used": query})


@app.route("/api/products")
def list_products():
    conn = get_db()
    rows = conn.execute("SELECT id, name, price, description FROM products").fetchall()
    conn.close()
    return jsonify({"products": [dict(r) for r in rows]})


# --- VULN: Stored XSS (comments not sanitized) ---
@app.route("/api/products/<int:product_id>/comments", methods=["GET", "POST"])
def product_comments(product_id):
    conn = get_db()
    if request.method == "POST":
        data = request.get_json(force=True)
        username = data.get("username", "anonymous")
        content = data.get("content", "")  # VULN: No sanitization
        conn.execute(
            "INSERT INTO comments (product_id, username, content) VALUES (?, ?, ?)",
            (product_id, username, content),
        )
        conn.commit()
    rows = conn.execute(
        "SELECT id, username, content FROM comments WHERE product_id = ? ORDER BY id DESC",
        (product_id,),
    ).fetchall()
    conn.close()
    return jsonify({"comments": [dict(r) for r in rows]})


# --- VULN: Reflected XSS via error message ---
@app.route("/api/greet")
def greet():
    name = request.args.get("name", "Guest")
    # VULN: User input reflected without encoding
    return jsonify({"message": f"Hello, {name}! Welcome to VulnLab."})


# --- VULN: IDOR - no authorization check on orders ---
@app.route("/api/orders/<int:order_id>")
def get_order(order_id):
    conn = get_db()
    row = conn.execute(
        "SELECT id, user_id, product_name, total, status FROM orders WHERE id = ?",
        (order_id,),
    ).fetchone()
    conn.close()
    if row:
        return jsonify({"order": dict(row)})
    return jsonify({"error": "Order not found"}), 404


@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    conn = get_db()
    row = conn.execute(
        "SELECT id, username, role, email, password FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    conn.close()
    if row:
        # VULN: Exposes password hash/plaintext and PII without auth
        return jsonify({"user": dict(row)})
    return jsonify({"error": "User not found"}), 404


# --- VULN: Command injection (ping utility) ---
@app.route("/api/tools/ping", methods=["POST"])
def ping_host():
    data = request.get_json(force=True)
    host = data.get("host", "127.0.0.1")
    # VULN: Unsanitized shell command
    cmd = f"ping -n 2 {host}" if os.name == "nt" else f"ping -c 2 {host}"
    try:
        output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True, timeout=10)
        return jsonify({"host": host, "output": output})
    except subprocess.CalledProcessError as e:
        return jsonify({"host": host, "output": e.output}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- VULN: Path traversal (file read) ---
@app.route("/api/files/read")
def read_file():
    filename = request.args.get("file", "readme.txt")
    # VULN: No path validation - try ../../../etc/passwd style paths
    filepath = DATA_DIR / filename
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
        return jsonify({"file": filename, "content": content})
    except FileNotFoundError:
        return jsonify({"error": f"File not found: {filename}"}), 404


@app.route("/api/files/download")
def download_file():
    filename = request.args.get("file", "readme.txt")
    filepath = DATA_DIR / filename
    if filepath.exists():
        return send_file(filepath, as_attachment=True)
    return jsonify({"error": "File not found"}), 404


# --- VULN: SSRF (fetch arbitrary URL) ---
@app.route("/api/fetch", methods=["POST"])
def fetch_url():
    data = request.get_json(force=True)
    url = data.get("url", "")
    try:
        resp = requests.get(url, timeout=5, verify=False)  # VULN: SSRF + no TLS verify
        return jsonify({"url": url, "status": resp.status_code, "body": resp.text[:5000]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- VULN: Insecure deserialization (pickle) ---
@app.route("/api/session/load", methods=["POST"])
def load_session():
    data = request.get_json(force=True)
    blob = data.get("data", "")
    try:
        decoded = base64.b64decode(blob)
        obj = pickle.loads(decoded)  # VULN: pickle.loads on user input
        return jsonify({"loaded": str(obj)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/session/save", methods=["POST"])
def save_session():
    data = request.get_json(force=True)
    obj = data.get("preferences", {})
    blob = base64.b64encode(pickle.dumps(obj)).decode()
    return jsonify({"data": blob})


# --- VULN: eval() in calculator ---
@app.route("/api/calc", methods=["POST"])
def calculator():
    data = request.get_json(force=True)
    expression = data.get("expression", "1+1")
    try:
        result = eval(expression)  # VULN: eval on user input
        return jsonify({"expression": expression, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# --- VULN: Weak password hashing (MD5) ---
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    username = data.get("username", "")
    password = data.get("password", "")
    email = data.get("email", "")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    hashed = hashlib.md5(password.encode()).hexdigest()  # VULN: MD5
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password, role, email) VALUES (?, ?, 'user', ?)",
            (username, hashed, email),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Username already exists"}), 409
    conn.close()
    return jsonify({"success": True, "username": username, "password_hash": hashed})


# --- VULN: Information disclosure / debug endpoint ---
@app.route("/api/debug/config")
def debug_config():
    return jsonify(
        {
            "secret_key": SECRET_KEY,
            "admin_password": ADMIN_PASSWORD,
            "api_key": API_KEY,
            "database_password": DATABASE_PASSWORD,
            "db_path": str(DB_PATH),
            "environment": dict(os.environ),
        }
    )


# --- VULN: Missing auth on admin actions ---
@app.route("/api/admin/delete-user/<int:user_id>", methods=["DELETE"])
def admin_delete_user(user_id):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"deleted": user_id})


@app.route("/api/admin/users")
def admin_list_users():
    conn = get_db()
    rows = conn.execute("SELECT id, username, password, role, email FROM users").fetchall()
    conn.close()
    return jsonify({"users": [dict(r) for r in rows]})


if __name__ == "__main__":
    init_db()
    readme = DATA_DIR / "readme.txt"
    if not readme.exists():
        readme.write_text("Public file in VulnLab data directory.\n")
    print("\n*** VulnLab API - INTENTIONALLY INSECURE ***")
    print("For local security testing only. http://127.0.0.1:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
