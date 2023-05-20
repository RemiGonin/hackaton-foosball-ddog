import time
from typing import Callable
from pathlib import Path

from fastapi import WebSocketDisconnect
import numpy as np
import cv2

from .types import Message

VIDEO_PATH = "./VID_20230515_105413.mp4"
DOWNSCALE_FACTOR = 80  # percent of original size
FRAMES_PER_TIME_WINDOW = 15
FRAMERATE = 30  # frames per second
TIME_PER_FRAME = 1 / FRAMERATE  # seconds
CAMERA_DIMENSIONS = (1080, 1920)  # (height, width)
FOOSBALL_WIDTH = 0.7  # meters
CALIBRATION_COOLDOWN = FRAMERATE * 2
GOAL_TIMEOUT_SEC = 3  # number of frames in 3 seconds
DEFAULT_PIXEL_TO_METER_RATIO = 0.00094

GAME_TIMEOUT = 60 * 30


def get_biggest_contour_center(ball_mask, field_mask, goal_mask):
    biggest_area = 0
    biggest_contour = None
    field_and_goal = 1
    if field_mask is not None and goal_mask is not None:
        field_and_goal = field_mask | goal_mask
    contours, _ = cv2.findContours(ball_mask & field_and_goal, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
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

    mask = cv2.dilate(mask, np.ones((8, 8), np.uint8), iterations=1)
    mask = cv2.erode(mask, np.ones((8, 8), np.uint8), iterations=6)

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
        frame = cv2.cvtColor(frame, cv2.COLOR_HSV2RGB)
        rect = cv2.minAreaRect(biggest_contour)
        foosball_width_px = rect[1][1] if rect[1][1] < rect[1][0] else rect[1][0]
        pixel_to_meter_ratio = FOOSBALL_WIDTH / foosball_width_px
        print(f"{pixel_to_meter_ratio = } {rect = !r}")
        return pixel_to_meter_ratio, mask

    return DEFAULT_PIXEL_TO_METER_RATIO, mask


def get_goals(frame, mask_goals_low, mask_goals_high):
    mask_goals = get_mask(frame, mask_goals_low, mask_goals_high)
    contours, _ = cv2.findContours(mask_goals, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        if len(contours) < 2:
            return None, None
        # Get the biggest 2 contours, should be the goals
        contours = sorted(contours, key=lambda x: cv2.contourArea(x))
        goal1, goal2 = cv2.boundingRect(contours[-1]), cv2.boundingRect(contours[-2])

        goal_left = goal1 if goal1[0] < goal2[0] else goal2
        goal_right = goal1 if goal1[0] > goal2[0] else goal2

        return (goal_left, goal_right), mask_goals

    return None, None


def check_if_goal(ball_center, goals):
    if goals:
        goal_left, goal_right = goals
        x1, y1, w1, h1 = goal_left
        if x1 < ball_center[0] < x1 + w1 and y1 < ball_center[1] < y1 + h1:
            return "red"  #! LEFT IS BLUE

        x2, y2, w2, h2 = goal_right
        if x2 < ball_center[0] < x2 + w2 and y2 < ball_center[1] < y2 + h2:
            return "blue"

        return None
    return None


def get_mask(frame, mask_range_low, mask_range_high) -> cv2.Mat:
    mask = cv2.inRange(frame, mask_range_low, mask_range_high)
    mask = cv2.erode(mask, np.ones((4, 4), np.uint8), iterations=2)
    mask = cv2.dilate(mask, np.ones((8, 8), np.uint8), iterations=6)
    return mask

def get_hsv(frame) -> cv2.Mat:
    width = int(frame.shape[1] * DOWNSCALE_FACTOR / 100)
    height = int(frame.shape[0] * DOWNSCALE_FACTOR / 100)
    dim = (width, height)
    frame = cv2.resize(frame, dim, interpolation=None)
    frame = cv2.blur(frame, (5, 5))
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    return frame


def get_ball_velocity(centers_x, centers_y, pixel_to_meter_ratio):
    # Less than 3 value can lead to shitty interpolation
    if (np.count_nonzero(~np.isnan(centers_x)) < 3):
        return 0, [[],[]]

    # TODO: refacto with concat x and y
    # Interpolate missing positions
    nans, x = nan_helper(centers_x)
    centers_x[nans] = np.interp(x(nans), x(~nans), centers_x[~nans])
    nans, y = nan_helper(centers_y)
    centers_y[nans] = np.interp(y(nans), y(~nans), centers_y[~nans])
    stacked = np.stack((centers_x, centers_y))

    positions_offset_x = np.abs(centers_x[1:] - centers_x[:-1])
    positions_offset_y = np.abs(centers_y[1:] - centers_y[:-1])
    velocities_x = positions_offset_x / TIME_PER_FRAME
    velocities_y = positions_offset_y / TIME_PER_FRAME

    velocities = np.sqrt(velocities_x**2 + velocities_y**2)

    max_velocity = np.max(velocities)  # pixel per second

    max_velocity_ms = max_velocity * pixel_to_meter_ratio  # meter per second

    return max_velocity_ms, stacked


def visualize(frame, ball_pos, velocity, trace, field_mask, goal_mask):
    frame = cv2.putText(frame, f"{velocity:.2f} m/s", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 20, 20), 6, 2)
    cv2.imshow('frame', frame)
    radius = 20
    color = (0, 0, 255)
    thickness = 10
    vis2 = cv2.cvtColor(field_mask, cv2.COLOR_GRAY2BGR)
    vis2[..., 2] *= 200
    vis2[..., 1] *= 100
    vis2[..., 0] *= 200
    if goal_mask is not None:
        vis2[..., 0] += goal_mask * 100
        vis2[..., 1] += goal_mask * 100
    image = cv2.circle(vis2, ball_pos, radius, color, thickness)
    for i in range(len(trace[0]) - 1):
        cv2.line(image, (int(trace[0][i]), int(trace[1][i])), (int(trace[0][i + 1]), int(trace[1][i + 1])), (255, 0, 0), thickness=4)
    cv2.imshow('ball', image)
    cv2.waitKey(20)


def set_video_time(value):
    global video
    global i
    video.set(cv2.CAP_PROP_POS_FRAMES, value)
    i = 0


async def track(send_message, visualization: Callable, stream_input: str=""):
    # Set the video flux buffer size to 5 to drop frames and not accumulate delay if we can't process fast emough
    #! TO REMOVE
    global video
    global i

    if stream_input:
        video = cv2.VideoCapture(stream_input)
        total = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        start_frame = 0
        video.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        cv2.namedWindow('frame')
        cv2.createTrackbar('trackbar', 'frame', start_frame, total, set_video_time)
    else:
        video = cv2.VideoCapture(1)
        video.set(cv2.CAP_PROP_FRAME_COUNT, 5)

    mask_ball_low = (23, 131, 133)
    mask_ball_high = (33, 251, 252)

    mask_field_low = (30, 40, 40)
    mask_field_high = (85, 215, 215)

    mask_goals_low = (100, 180, 24)
    mask_goals_high = (116, 250, 168)

    all_time_max_speed = 0
    max_velocity_ms = 0
    max_velo_frame = 0

    centers_x = np.zeros(FRAMES_PER_TIME_WINDOW)
    centers_y = np.zeros(FRAMES_PER_TIME_WINDOW)
    stacked_pos = [[], []]

    general_frame_count = 0
    i = 0
    goal_cool_down = 0
    time_until_calibration = 0

    while video.isOpened():
        start_time = time.time()
        ret, frame = video.read()
        if not ret:
            # TODO: add a retry number (in case no camera frame to read yet)
            print("No frame to read. end of video, or camera issue")
            break

        goal_cool_down -= 1
        time_until_calibration -= 1

        hsv_frame = get_hsv(frame)

        if time_until_calibration <= 0:
            pixel_to_meter_ratio, field_mask = get_pixel_to_meter_ratio(
                hsv_frame, mask_field_low, mask_field_high
            )
            goals, goal_mask = get_goals(hsv_frame, mask_goals_low, mask_goals_high)
            time_until_calibration = CALIBRATION_COOLDOWN

        ball_mask = get_mask(hsv_frame, mask_ball_low, mask_ball_high)
        center = get_biggest_contour_center(ball_mask, field_mask, goal_mask)

        visualization(frame, center, max_velocity_ms, stacked_pos, field_mask, goal_mask)

        if center:
            cX, cY = center
            centers_x[i] = cX
            centers_y[i] = cY

            if goal_cool_down <= 0:
                goal = check_if_goal((cX, cY), goals)
                if goal is not None:
                    await send_message(
                        Message(**{"type": "goal", "team": goal, "value": max_velocity_ms})
                    )
                    goal_cool_down = FRAMERATE * GOAL_TIMEOUT_SEC

        else:
            centers_x[i] = np.nan
            centers_y[i] = np.nan


        i += 1
        if i == FRAMES_PER_TIME_WINDOW:
            max_velocity_ms, stacked_pos = get_ball_velocity(
                centers_x, centers_y, pixel_to_meter_ratio
            )
            print(f"Velocity: {max_velocity_ms:.2f}")
            await send_message(
                Message(**{
                    "type": "speed",
                    "team": None,
                    "value": "{:.2f}".format(max_velocity_ms),
                })
            )
            # reset
            if max_velocity_ms > all_time_max_speed:
                all_time_max_speed = max_velocity_ms
                max_velo_frame = general_frame_count
            print(f"New max speed {all_time_max_speed} at frame {max_velo_frame}")
            i = 0
        
        general_frame_count += 1

        end_time = time.time()
        duration = end_time - start_time
        # print(f"Compute framerate: {1/duration:.2f}")


    # video.release()
    # cv2.destroyAllWindows()


async def analyse_game(send_message: Callable, visu_func: Callable = None, video_path: str=""):
    # start_game_time = time.time()
    print("analyse called")
    if video_path:
        video_path: Path = Path(video_path).resolve().expanduser()
        if not video_path.is_file():
            raise ValueError("Video file do not exist")
    if not visu_func:
        visu_func = lambda x, y, z, w, e, r: None
    await track(send_message, visu_func, str(video_path))

    # while True:
    #     await send_message(Message(**{"type": "speed", "team": None, "value": 40.4}))
    #     time.sleep(3)
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

