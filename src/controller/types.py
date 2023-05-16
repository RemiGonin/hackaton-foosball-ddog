from pydantic import BaseModel
import typing


class Message(BaseModel):
    type: typing.Union[typing.Literal["speed"], typing.Literal["goal"]]
    team: typing.Union[typing.Literal["red"], typing.Literal["blue"]] = None
    value: float = None
