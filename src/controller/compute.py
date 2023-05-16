import time
from fastapi import WebSocketDisconnect

GAME_TIMEOUT = 60 * 30

async def analyse_game(callback):
    start_game_time = time.time()
    print("analyse called")
    while True:
        game_duration = time.time() - start_game_time
        if game_duration > GAME_TIMEOUT:
            print("Game timeout")
            raise WebSocketDisconnect()
        # Do your stuff here
        print("sending stuff")
        # await callback(None)
        # message = {"type": "speed", "team": "unknown", "value": "0."}
        # if data:
            # message = data
        # str_message = json.dumps(message)
        # await websocket.send_text(str_message)
        time.sleep(10)
        # call callback with {"type": "speed", "team": "unknown", "value": "0."}

