import asyncio
from .compute import analyse_game
from .compute import visualize

VIDEO_PATH = "../../data/trimed_video.mp4"

async def random(c):
    pass

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(analyse_game(random, visualize, VIDEO_PATH))
    loop.run_forever()
    loop.close()
