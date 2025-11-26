from fastapi import FastAPI
from .database import engine
from .models import Base
from .routers import spotify, sync, analytics  # 👈 add analytics
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Spotify Analytics API")

Base.metadata.create_all(bind=engine)

app.include_router(spotify.router, prefix="/spotify", tags=["spotify"])
app.include_router(sync.router, prefix="/spotify", tags=["spotify"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])  # 👈 new

@app.get("/health")
def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
