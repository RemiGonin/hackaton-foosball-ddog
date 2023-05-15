import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from .compute import analyse_game

app = FastAPI()

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
    async def send_update(websocket, data):
        message = {"type": "speed", "team": "unknown", "value": "0."}
        if data:
            message = data
        str_message = json.dumps(message)
        await websocket.send_text(str_message)

    await websocket.accept()
    print("Game started")
    try:
        analyse_game(send_update)
    except WebSocketDisconnect:
        game_runnning = False
        print("Websocket connection stopped")
