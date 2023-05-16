import React, { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { APIEvent, Event } from "../types/event";
import { io } from "socket.io-client";
import { RASBERRY_BASE_PATH } from "../config";

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

const socket = io(RASBERRY_BASE_PATH, {
  autoConnect: false,
});

const convertSpeed = (speed: number) => (speed * 3600) / 1000;

function EventsProvider({ children }: { children: React.ReactNode }) {
  const [speeds, setSpeeds] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [highestSpeed, setHighestSpeed] = useState(0);
  const [nbGoals, setNbGoals] = useState(0);

  const start = async () => {
    setIsGameRunning(true);
    socket.connect();
  };
  const stop = async () => {
    setIsGameRunning(false);
    socket.disconnect();
  };

  const clearEvents = () => setEvents([]);

  useEffect(() => {
    socket.on("message", (apiEvent: APIEvent) => {
      /** If the event is a speed, we add it to the speed array to display graphs and stats */

      const timestamp = new Date().getTime();

      const event: Event = { timestamp, ...apiEvent };

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
    });

    return () => {
      socket.off("message");
    };
  }, []);

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
