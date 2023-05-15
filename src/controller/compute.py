import time
from fastapi import WebSocketDisconnect

GAME_TIMEOUT = 60 * 30

def analyse_game(callback):
    start_game_time = time.time()
    while True:
        game_duration = time.time() - start_game_time
        if game_duration > GAME_TIMEOUT:
            print("Game timeout")
            raise WebSocketDisconnect()
        time.sleep(10)
        # Do your stuff here
        # call callback with {"type": "speed", "team": "unknown", "value": "0."}

