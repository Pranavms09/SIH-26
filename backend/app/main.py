from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.process import router as process_router
from app.api.gis import router as gis_router


app = FastAPI(
    title="Doc2Digital API",
    description="Intelligent Land Record Digitization & Verification Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

from app.config import get_cors_origins

origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload_router)
app.include_router(process_router)
app.include_router(gis_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Doc2Digital API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }