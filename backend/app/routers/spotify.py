import urllib.parse
from datetime import datetime, timedelta

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI
from ..database import get_db
from ..models import User

router = APIRouter()

SCOPES = "user-read-email user-top-read user-read-recently-played"


def build_auth_url() -> str:
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": SCOPES,
    }
    return "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(params)


async def exchange_code_for_token(code: str):
    async with httpx.AsyncClient() as client:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        }
        r = await client.post("https://accounts.spotify.com/api/token", data=data)
        r.raise_for_status()
        return r.json()


async def get_spotify_me(access_token: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://api.spotify.com/v1/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        r.raise_for_status()
        return r.json()


@router.get("/login")
def login():

    url = build_auth_url()
    return RedirectResponse(url)


@router.get("/callback")
async def callback(code: str, db: Session = Depends(get_db)):

    token_data = await exchange_code_for_token(code)
    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data["expires_in"]
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    me = await get_spotify_me(access_token)
    spotify_user_id = me["id"]
    display_name = me.get("display_name", spotify_user_id)


    user = db.query(User).filter_by(spotify_user_id=spotify_user_id).first()
    if not user:
        user = User(
            spotify_user_id=spotify_user_id,
            display_name=display_name,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expires_at=expires_at,
        )
        db.add(user)
    else:
        user.display_name = display_name
        user.access_token = access_token
        user.refresh_token = refresh_token
        user.token_expires_at = expires_at

    db.commit()
    db.refresh(user)


    frontend_url = f"http://localhost:5173/dashboard?user_id={user.id}"
    from fastapi.responses import RedirectResponse
    return RedirectResponse(frontend_url)

