# Versão Serverless para Vercel
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS para permitir frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Tickrify API running on Vercel"}

# Handler para Vercel
handler = app
