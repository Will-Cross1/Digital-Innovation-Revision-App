import sqlite3
import sys
from pathlib import Path

import logging
logging.basicConfig(level=logging.DEBUG)

DB_FILE = Path("/data/app_db_1.db")

if not DB_FILE.exists():
    logging.error("Database file not found at %s", DB_FILE)
    sys.exit(1)

# connect to database (PRAGMA makes sure foreign keys work)
conn = sqlite3.connect(DB_FILE)
conn.execute("PRAGMA foreign_keys = ON;")
cursor = conn.cursor()