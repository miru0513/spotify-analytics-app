from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    spotify_user_id = Column(String, unique=True, index=True)
    display_name = Column(String)

    # we'll add token fields later when we hook up Spotify OAuth
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)

    tracks = relationship("Track", back_populates="user")
    artists = relationship("Artist", back_populates="user")
    listening_history = relationship("ListeningHistory", back_populates="user")


class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    spotify_artist_id = Column(String, index=True)
    name = Column(String)
    genres = Column(String, nullable=True)  # comma-separated list

    user = relationship("User", back_populates="artists")
    tracks = relationship("Track", back_populates="artist")


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    spotify_track_id = Column(String, index=True)
    name = Column(String)
    album_name = Column(String)
    popularity = Column(Integer, nullable=True)
    artist_id = Column(Integer, ForeignKey("artists.id"))

    user = relationship("User", back_populates="tracks")
    artist = relationship("Artist", back_populates="tracks")
    plays = relationship("ListeningHistory", back_populates="track")


class ListeningHistory(Base):
    __tablename__ = "listening_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    track_id = Column(Integer, ForeignKey("tracks.id"))
    spotify_track_id = Column(String, index=True)
    played_at = Column(DateTime, index=True)
    context = Column(String, nullable=True)

    user = relationship("User", back_populates="listening_history")
    track = relationship("Track", back_populates="plays")
