from datetime import timedelta

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Track, Artist, ListeningHistory

router = APIRouter()


def get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/summary")
def summary(user_id: int, db: Session = Depends(get_db)):
    """
    - total tracks stored
    - total listening history rows
    - top 5 artists by play count
    - top 5 genres by play count
    """
    user = get_user_or_404(user_id, db)

    total_tracks = db.query(Track).filter_by(user_id=user.id).count()
    total_plays = db.query(ListeningHistory).filter_by(user_id=user.id).count()

    # join history -> track -> artist based on spotify IDs
    rows = (
        db.query(ListeningHistory, Track, Artist)
        .join(Track, Track.spotify_track_id == ListeningHistory.spotify_track_id)
        .join(Artist, Track.artist_id == Artist.id)
        .filter(ListeningHistory.user_id == user.id)
        .all()
    )

    if not rows:
        return {
            "total_tracks": total_tracks,
            "total_plays": total_plays,
            "top_artists": [],
            "top_genres": [],
        }

    data = []
    for h, t, a in rows:
        data.append(
            {
                "artist_name": a.name,
                "genres": a.genres or "",
            }
        )

    df = pd.DataFrame(data)


    top_artists = (
        df.groupby("artist_name")
        .size()
        .sort_values(ascending=False)
        .head(5)
        .reset_index(name="play_count")
        .to_dict(orient="records")
    )


    genre_list = []
    for g in df["genres"]:
        if not g:
            continue
        for part in g.split(","):
            part = part.strip()
            if part:
                genre_list.append(part)

    if genre_list:
        genres_df = pd.DataFrame({"genre": genre_list})
        top_genres = (
            genres_df.groupby("genre")
            .size()
            .sort_values(ascending=False)
            .head(5)
            .reset_index(name="count")
            .to_dict(orient="records")
        )
    else:
        top_genres = []

    return {
        "total_tracks": total_tracks,
        "total_plays": total_plays,
        "top_artists": top_artists,
        "top_genres": top_genres,
    }


@router.get("/time-distribution")
def time_distribution(user_id: int, db: Session = Depends(get_db)):

    user = get_user_or_404(user_id, db)

    history = (
        db.query(ListeningHistory)
        .filter_by(user_id=user.id)
        .order_by(ListeningHistory.played_at.asc())
        .all()
    )

    if not history:
        return {"points": []}

    rows = []
    for h in history:
        dt = h.played_at
        rows.append(
            {
                "weekday": dt.weekday(),  # 0 = Monday
                "hour": dt.hour,
            }
        )

    df = pd.DataFrame(rows)
    grouped = df.groupby(["weekday", "hour"]).size().reset_index(name="count")


    return {"points": grouped.to_dict(orient="records")}


@router.get("/sessions")
def sessions(user_id: int, db: Session = Depends(get_db)):

    user = get_user_or_404(user_id, db)

    history = (
        db.query(ListeningHistory)
        .filter_by(user_id=user.id)
        .order_by(ListeningHistory.played_at.asc())
        .all()
    )

    if not history:
        return {"sessions": []}

    sessions_list = []
    current = {
        "start": history[0].played_at,
        "end": history[0].played_at,
        "plays": 1,
    }
    last_time = history[0].played_at

    for h in history[1:]:
        if h.played_at - last_time > timedelta(minutes=30):
            # close current session
            duration = (current["end"] - current["start"]).total_seconds() / 60.0
            current["duration_minutes"] = duration
            sessions_list.append(current)
            # start new session
            current = {
                "start": h.played_at,
                "end": h.played_at,
                "plays": 1,
            }
        else:
            current["end"] = h.played_at
            current["plays"] += 1
        last_time = h.played_at

    duration = (current["end"] - current["start"]).total_seconds() / 60.0
    current["duration_minutes"] = duration
    sessions_list.append(current)


    sessions_list.sort(key=lambda s: s["duration_minutes"], reverse=True)

    return {"sessions": sessions_list[:20]}  # top 20 sessions


@router.get("/daily-trend")
def daily_trend(user_id: int, db: Session = Depends(get_db)):

    user = get_user_or_404(user_id, db)

    history = (
        db.query(ListeningHistory)
        .filter_by(user_id=user.id)
        .order_by(ListeningHistory.played_at.asc())
        .all()
    )
    if not history:
        return {"points": []}

    rows = []
    for h in history:
        date_str = h.played_at.date().isoformat()
        rows.append({"date": date_str})

    df = pd.DataFrame(rows)
    grouped = (
        df.groupby("date")
        .size()
        .reset_index(name="plays")
        .sort_values("date")
    )

    return {"points": grouped.to_dict(orient="records")}
