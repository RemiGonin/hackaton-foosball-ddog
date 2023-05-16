import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from .compute import analyse_game

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

game_runnning = False


@app.get("/start")
async def start():
    game_runnning = True
    print("start called")
    return {"response": "started"}


@app.get("/stop")
async def stop():
    game_runnning = False
    print("stop called")
    return {"response": "stopped"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    async def send_update(data):
        message = {"type": "speed", "team": "unknown", "value": "0."}
        if data:
            message = data
        str_message = json.dumps(message)
        await websocket.send_text(str_message)

    await websocket.accept()
    print("Game started")
    try:
        await analyse_game(send_update)
    except WebSocketDisconnect:
        game_runnning = False
        print("Websocket connection stopped")
        return
