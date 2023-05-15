import { Event, EventApi } from "@/types/event";
import { EventCard } from "./EventCard";
import { useEffect, useState } from "react";
import { Delete } from "./Delete";

type Props = {};

const FAKE_EVENT: EventApi[] = [
  {
    type: "shoot",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "red",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
  {
    type: "shoot",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "red",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
  {
    type: "shoot",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "red",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
  {
    type: "goal",
    team: "blue",
    value: 100,
  },
];

export const EventList: React.FunctionComponent<Props> = () => {
  const [events, setEvents] = useState<Event[]>(
    FAKE_EVENT.map((e) => ({ ...e, timestamp: new Date().getTime() }))
  );

  const deleteEvents = () => setEvents([]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-end px-12 my-2">
        <Delete onClick={deleteEvents} />
      </div>
      <div className="w-full h-full overflow-auto px-8">
        {events.map((event, key) => (
          <EventCard key={`event-${key}`} event={event} />
        ))}
      </div>
    </div>
  );
};
