from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Artist, Track, ListeningHistory

router = APIRouter()


async def spotify_get(path: str, access_token: str, params: dict | None = None):

    base_url = "https://api.spotify.com/v1/"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        resp = await client.get(base_url + path, headers=headers, params=params or {})
        if resp.status_code == 401:

            raise HTTPException(status_code=401, detail="Spotify token expired or invalid")
        resp.raise_for_status()
        return resp.json()


@router.get("/sync/{user_id}")
async def sync_spotify_data(user_id: int, db: Session = Depends(get_db)):

    # 1) Get user
    user = db.query(User).filter_by(id=user_id).first()
    if not user or not user.access_token:
        raise HTTPException(status_code=404, detail="User not found or not logged in with Spotify")

    token = user.access_token


    top_artists_data = await spotify_get(
        "me/top/artists",
        token,
        params={"limit": 20, "time_range": "medium_term"},
    )

    for item in top_artists_data.get("items", []):
        spotify_artist_id = item["id"]
        name = item["name"]
        genres = ", ".join(item.get("genres", []))

        artist = (
            db.query(Artist)
            .filter_by(user_id=user.id, spotify_artist_id=spotify_artist_id)
            .first()
        )
        if not artist:
            artist = Artist(
                user_id=user.id,
                spotify_artist_id=spotify_artist_id,
                name=name,
                genres=genres,
            )
            db.add(artist)
        else:
            artist.name = name
            artist.genres = genres

    top_tracks_data = await spotify_get(
        "me/top/tracks",
        token,
        params={"limit": 50, "time_range": "medium_term"},
    )

    for t in top_tracks_data.get("items", []):
        spotify_track_id = t["id"]
        name = t["name"]
        album_name = t["album"]["name"]
        popularity = t.get("popularity")


        primary_artist = t["artists"][0]
        artist_spotify_id = primary_artist["id"]
        artist = (
            db.query(Artist)
            .filter_by(user_id=user.id, spotify_artist_id=artist_spotify_id)
            .first()
        )
        if not artist:
            artist = Artist(
                user_id=user.id,
                spotify_artist_id=artist_spotify_id,
                name=primary_artist["name"],
                genres="",
            )
            db.add(artist)
            db.flush()

        track = (
            db.query(Track)
            .filter_by(user_id=user.id, spotify_track_id=spotify_track_id)
            .first()
        )
        if not track:
            track = Track(
                user_id=user.id,
                spotify_track_id=spotify_track_id,
                name=name,
                album_name=album_name,
                popularity=popularity,
                artist=artist,
            )
            db.add(track)
        else:
            track.name = name
            track.album_name = album_name
            track.popularity = popularity
            track.artist = artist


    recent_data = await spotify_get(
        "me/player/recently-played",
        token,
        params={"limit": 50},
    )

    for item in recent_data.get("items", []):
        played_at_str = item["played_at"]
        played_at = datetime.fromisoformat(played_at_str.replace("Z", "+00:00"))
        spotify_track_id = item["track"]["id"]
        context = (item.get("context") or {}).get("type")


        existing = (
            db.query(ListeningHistory)
            .filter_by(
                user_id=user.id,
                spotify_track_id=spotify_track_id,
                played_at=played_at,
            )
            .first()
        )
        if existing:
            continue

        history_row = ListeningHistory(
            user_id=user.id,
            spotify_track_id=spotify_track_id,
            played_at=played_at,
            context=context,
        )
        db.add(history_row)

    db.commit()

    return {
        "status": "ok",
        "top_artists_synced": len(top_artists_data.get("items", [])),
        "top_tracks_synced": len(top_tracks_data.get("items", [])),
        "recent_plays_added": len(recent_data.get("items", [])),
    }
