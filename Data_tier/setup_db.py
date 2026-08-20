import sqlite3
from pathlib import Path

# container paths
BASE_DIR = Path(__file__).parent
SCHEMA_FILE = BASE_DIR / "schema.sql"
DB_FILE = Path("/data/app_db_1.db")

# only makes the database if it doesn't exist
if not DB_FILE.exists():
    print("Creating database")
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    with open(SCHEMA_FILE, "r") as f:
        cursor.executescript(f.read())

    conn.close()
    print("Database created.")
else:
    print("Database already exists. Nothing changed.")