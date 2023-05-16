import React, { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { APIEvent, Event } from "../types/event";
import { RASBERRY_BASE_PATH } from "@/config";

type EventContext = {
  start: () => void;
  stop: () => void;
  clearEvents: () => void;
  highestSpeed: number;
  nbGoals: number;
  isGameRunning: boolean;
  speeds: Event[];
  events: Event[];
};

const eventsContext = createContext<EventContext>({
  start: () => undefined,
  stop: () => undefined,
  clearEvents: () => undefined,
  isGameRunning: false,
  speeds: [],
  events: [],
  highestSpeed: 0,
  nbGoals: 0,
});

const { Provider } = eventsContext;

const convertSpeed = (speed: number) => (speed * 3600) / 1000;

function EventsProvider({ children }: { children: React.ReactNode }) {
  const [speeds, setSpeeds] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [highestSpeed, setHighestSpeed] = useState(0);
  const [nbGoals, setNbGoals] = useState(0);

  const start = async () => {
    setIsGameRunning(true);
  };
  const stop = async () => {
    setIsGameRunning(false);
  };

  const clearEvents = () => setEvents([]);

  useEffect(() => {
    if (!isGameRunning) return;

    const ws = new WebSocket(`${RASBERRY_BASE_PATH}/ws`);

    ws.onmessage = (apiEvent: MessageEvent<APIEvent>) => {
      console.log(apiEvent);

      const timestamp = new Date().getTime();

      const event: Event = { timestamp, ...apiEvent.data };

      if (event.type === "speed") {
        const convertedSpeed = convertSpeed(event.value);

        setSpeeds((prevSpeeds) => [
          { ...event, value: convertedSpeed },
          ...prevSpeeds,
        ]);

        if (convertedSpeed > highestSpeed) setHighestSpeed(convertedSpeed);
      }

      setEvents((prevEvents) => [event, ...prevEvents]);

      if (event.type === "goal") setNbGoals((prevGoal) => prevGoal + 1);
    };

    console.log("connected ws", ws);

    return () => {
      ws.close();
    };
  }, [isGameRunning]);

  return (
    <Provider
      value={{
        start,
        stop,
        clearEvents,
        isGameRunning,
        events,
        speeds,
        highestSpeed,
        nbGoals,
      }}
    >
      {children}
    </Provider>
  );
}

function useEvents() {
  return useContext(eventsContext);
}

export { eventsContext, EventsProvider, useEvents };
