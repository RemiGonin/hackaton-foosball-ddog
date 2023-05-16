import { EVENT_TYPE, Event, TEAM } from "../types/event";

type Props = {
  event: Event;
};

const getTitle = (eventType: (typeof EVENT_TYPE)[number]) => {
  if (eventType === "goal") return "An insane goal has been scored !!";
  if (eventType === "shoot") return "A very fast shot has been fired !!";
};

const getTeam = (team: TEAM) => (team === "blue" ? "TEAM BLUE" : "TEAM RED");

export const EventCard: React.FunctionComponent<Props> = ({ event }) => {
  return (
    <div className={`w-full h-32 rounded-lg bg-gray-100 flex my-4 px-4 py-2 `}>
      <div className="flex-1 flex flex-col justify-around h-full">
        <div>
          <p className="flex-1 flex justify-start items-center text-lg">
            {getTitle(event.type)}
          </p>
          <p
            className={`${
              event.team === "blue" ? "text-blue-500" : "text-red-500"
            } text-xs font-normal`}
          >
            {getTeam(event.team)}
          </p>
        </div>
        <p className="text-xs text-gray-600">
          {new Date(event.timestamp).toLocaleTimeString()}{" "}
        </p>
      </div>
      <div className="flex items-center justify-center ">
        <div className="flex gap-2 justify-start items-baseline">
          <span className="font-black text-2xl">{event.value.toFixed(2)}</span>
          <span className="text-sm font-normal text-gray-600 ">km/h</span>
        </div>
      </div>
    </div>
  );
};
