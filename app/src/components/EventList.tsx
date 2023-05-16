import { EventCard } from "./EventCard";
import { Delete } from "./Delete";
import { useEvents } from "@/context/events";

type Props = {};

export const EventList: React.FunctionComponent<Props> = () => {
  const { events, clearEvents } = useEvents();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-end px-12 my-2">
        <Delete onClick={clearEvents} />
      </div>
      <div className="w-full h-full overflow-auto px-8">
        {events.map((event, key) => (
          <EventCard key={`event-${key}`} event={event} />
        ))}
      </div>
    </div>
  );
};
