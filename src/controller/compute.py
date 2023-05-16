import time
from fastapi import WebSocketDisconnect
import numpy as np
import cv2
from typing import Callable

# from .types import Message

VIDEO_PATH = "./VID_20230515_105413.mp4"
DOWNSCALE_FACTOR = 80  # percent of original size
FRAMES_PER_TIME_WINDOW = 15
FRAMERATE = 60  # frames per second
TIME_PER_FRAME = 1 / FRAMERATE  # seconds
CAMERA_DIMENSIONS = (1080, 1920)  # (height, width)
FOOSBALL_WIDTH = 0.7  # meters

GAME_TIMEOUT = 60 * 30


def get_biggest_contour_center(frame):
    biggest_area = 0
    biggest_contour = None
    contours, _ = cv2.findContours(frame, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > biggest_area:
            biggest_area = area
            biggest_contour = cnt

    if biggest_contour is None:
        return None

    M = cv2.moments(biggest_contour)
    cX = int(M["m10"] / M["m00"])
    cY = int(M["m01"] / M["m00"])
    return cX, cY


def nan_helper(y):
    return np.isnan(y), lambda z: z.nonzero()[0]


def get_pixel_to_meter_ratio(frame, mask_field_low, mask_field_high):
    mask = get_mask(frame, mask_field_low, mask_field_high)

    mask = cv2.dilate(mask, np.ones((10, 10), np.uint8), iterations=6)

    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    # We get the biggest countour we find, should be the field
    biggest_area = 0
    biggest_contour = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > biggest_area:
            biggest_area = area
            biggest_contour = cnt

    if biggest_contour is not None:
    if biggest_contour is not None:
        frame = cv2.cvtColor(frame, cv2.COLOR_HSV2RGB)
        rect = cv2.minAreaRect(biggest_contour)
        foosball_width_px = rect[1][1]
        pixel_to_meter_ratio = FOOSBALL_WIDTH / foosball_width_px
        print(f"{pixel_to_meter_ratio = }")
        return pixel_to_meter_ratio

    return 1


def get_goals(frame, mask_goals_low, mask_goals_high):
    mask_goals = get_mask(frame, mask_goals_low, mask_goals_high)
    contours, _ = cv2.findContours(mask_goals, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        if len(contours) < 2:
            return None
        # Get the biggest 2 contours, should be the goals
        contours = sorted(contours, key=lambda x: cv2.contourArea(x))
        goal1, goal2 = cv2.boundingRect(contours[-1]), cv2.boundingRect(contours[-2])

        goal_left = goal1 if goal1[0] < goal2[0] else goal2
        goal_right = goal1 if goal1[0] > goal2[0] else goal2

        return goal_left, goal_right

    return None


def check_if_goal(frame, mask_goals_low, mask_goals_high, ball_center, goals):
    if goals:
        goal_left, goal_right = goals
        x1, y1, w1, h1 = goal_left
        if x1 < ball_center[0] < x1 + w1 and y1 < ball_center[1] < y1 + h1:
            return "blue"  #! LEFT IS BLUE

        x2, y2, w2, h2 = goal_right
        if x2 < ball_center[0] < x2 + w2 and y2 < ball_center[1] < y2 + h2:
            return "red"

        return None
    return None


def get_mask(frame, mask_range_low, mask_range_high):
    width = int(frame.shape[1] * DOWNSCALE_FACTOR / 100)
    height = int(frame.shape[0] * DOWNSCALE_FACTOR / 100)
    dim = (width, height)
    frame = cv2.resize(frame, dim, interpolation=None)

    frame = cv2.blur(frame, (5, 5))

    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    mask = cv2.inRange(frame, mask_range_low, mask_range_high)

    mask = cv2.erode(mask, np.ones((4, 4), np.uint8), iterations=2)

    mask = cv2.dilate(mask, np.ones((8, 8), np.uint8), iterations=6)

    return mask


def get_ball_velocity(centers_x, centers_y, pixel_to_meter_ratio):
    if np.all(np.isnan(centers_x)) or np.all(np.isnan(centers_y)):
        return 0

    # Interpolate missing positions
    nans, x = nan_helper(centers_x)
    centers_x[nans] = np.interp(x(nans), x(~nans), centers_x[~nans])
    nans, y = nan_helper(centers_y)
    centers_y[nans] = np.interp(y(nans), y(~nans), centers_x[~nans])

    positions_offset_x = np.abs(centers_x[1:] - centers_x[:-1])
    positions_offset_y = np.abs(centers_y[1:] - centers_y[:-1])

    velocities_x = positions_offset_x / TIME_PER_FRAME
    velocities_y = positions_offset_y / TIME_PER_FRAME

    velocities = np.sqrt(velocities_x**2 + velocities_y**2)

    max_velocity = np.max(velocities)  # pixel per second

    max_velocity_ms = max_velocity * pixel_to_meter_ratio  # meter per second

    return max_velocity_ms


def track():
    # Set the video flux buffer size to 5 to drop frames and not accumulate delay if we can't process fast emough
    #! TO REMOVE
    video = cv2.VideoCapture(VIDEO_PATH)
    video.set(cv2.CAP_PROP_FRAME_COUNT, 5)
    video.set(cv2.CAP_PROP_POS_FRAMES, 12000)

    mask_ball_low = (23, 131, 133)
    mask_ball_high = (33, 251, 252)

    mask_field_low = (33, 20, 0)
    mask_field_high = (92, 255, 255)

    mask_goals_low = (75, 170, 9)
    mask_goals_high = (116, 255, 158)

    centers_x = np.zeros(FRAMES_PER_TIME_WINDOW)
    centers_y = np.zeros(FRAMES_PER_TIME_WINDOW)

    i = 0
    first_frame = True
    goal_cool_down = 0
    refresh_counter = 0
    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break
        cv2.imshow('frame', frame)
        key = cv2.waitKey(30)
        if key == ord('q') or key == 27:
            break
        if first_frame:
            pixel_to_meter_ratio = get_pixel_to_meter_ratio(
                frame, mask_field_low, mask_field_high
            )
            goals = get_goals(frame, mask_goals_low, mask_goals_high)
            first_frame = False

        ball_mask = get_mask(frame, mask_ball_low, mask_ball_high)
        centers = get_biggest_contour_center(ball_mask)
        if centers:
            cX, cY = centers
            centers_x[i] = cX
            centers_y[i] = cY

            if goal_cool_down == 0:
                goal = check_if_goal(frame, mask_goals_low, mask_goals_high, (cX, cY), goals)
                if goal is not None:
                    await send_message(
                        Message(**{"type": "goal", "team": goal, "value": None})
                    )
                    goal_cool_down = FRAMERATE * 3  # number of frames in 3 seconds

        else:
            centers_x[i] = np.nan
            centers_y[i] = np.nan

        if goal_cool_down > 0:
            goal_cool_down -= 1

        i = i + 1
        if i == FRAMES_PER_TIME_WINDOW:
            max_velocity_ms = get_ball_velocity(
                centers_x, centers_y, pixel_to_meter_ratio
            )
            print(max_velocity_ms)
            await send_message(
                Message(**{
                    "type": "speed",
                    "team": None,
                    "value": "{:.2f}".format(max_velocity_ms),
                })
            )
            # reset
            i = 0

        refresh_counter += 1

        if refresh_counter == FRAMERATE * 2:
            goals = get_goals(frame, mask_goals_low, mask_goals_high)
            pixel_to_meter_ratio = get_pixel_to_meter_ratio(
                frame, mask_field_low, mask_field_high
            )
            refresh_counter = 0



    # video.release()
    # cv2.destroyAllWindows()


def analyse_game():
    # start_game_time = time.time()
    print("analyse called")
    # while True:
    #     await send_message(Message(**{"type": "speed", "team": None, "value": 40.4}))
    #     time.sleep(3)
    track()
    # while True:
    #     game_duration = time.time() - start_game_time
    #     if game_duration > GAME_TIMEOUT:
    #         print("Game timeout")
    #         raise WebSocketDisconnect()
    #     # Do your stuff here
    #     print("sending stuff")
    #     await send_message(None)
        # message = {"type": "speed", "team": "unknown", "value": "0."}
        # if data:
        # message = data
        # str_message = json.dumps(message)
        # await websocket.send_text(str_message)

        # call callback with {"type": "speed", "team": "unknown", "value": "0."}

analyse_game()