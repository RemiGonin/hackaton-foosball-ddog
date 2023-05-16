import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from .compute import analyse_game
from .types import Message

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

<<<<<<< Updated upstream
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

game_runnning = False
=======
>>>>>>> Stashed changes


@app.get("/start")
async def start():
    game_running = True
    print("start called")
    return {"response": "started"}


@app.get("/stop")
async def stop():

    print("stop called")
    return {"response": "stopped"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    async def send_update(message: Message = None):
        if message is None:
            message = Message(**{"type": "speed", "team": None, "value": 0.})
        str_message: str = json.dumps(message.dict())
        await websocket.send_text(str_message)

    await websocket.accept()
    print("Game started")
    try:
        await analyse_game(send_update)
    except WebSocketDisconnect:

        print("Websocket connection stopped")
        return
