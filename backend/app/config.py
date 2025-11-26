import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Spotify API credentials
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv(
    "SPOTIFY_REDIRECT_URI",
    "http://127.0.0.1:8000/spotify/callback"  # fallback default
)

# Database connection (SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotify.db")
