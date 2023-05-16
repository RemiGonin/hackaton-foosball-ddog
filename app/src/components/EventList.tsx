import { EventCard } from "./EventCard";
import { Delete } from "./Delete";
import { useEvents } from "@/context/events";
import { SelectTeam } from "./SelectTeam";
import { TEAM } from "@/types/event";
import { useEffect, useState } from "react";

type Props = {};

export const EventList: React.FunctionComponent<Props> = () => {
  const { events, clearEvents } = useEvents();

  const [filteredList, setFilteredList] = useState(events);

  const [currentTeam, setCurrentTeam] = useState<TEAM | "all">("all");

  useEffect(() => {
    if (currentTeam === "all") setFilteredList(events);
    else setFilteredList(events.filter((e) => e.team === currentTeam));
  }, [currentTeam, events]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-end px-12 my-2 gap-4">
        <SelectTeam onChange={setCurrentTeam} />
        <Delete onClick={clearEvents} />
      </div>
      <div className="w-full h-full overflow-auto px-8">
        {filteredList.map((event, key) => (
          <EventCard key={`event-${key}`} event={event} />
        ))}
      </div>
    </div>
  );
};
