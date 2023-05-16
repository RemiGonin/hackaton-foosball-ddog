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
  nbGoalsRed: number;
  nbGoalsBlue: number;
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
  nbGoalsRed: 0,
  nbGoalsBlue: 0,
});

const MAX_GRAPH_POINTS = 30;

const { Provider } = eventsContext;

const convertSpeed = (speed: number) => (speed * 3600) / 1000;

function EventsProvider({ children }: { children: React.ReactNode }) {
  const [speeds, setSpeeds] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [highestSpeed, setHighestSpeed] = useState(0);
  const [nbGoals, setNbGoals] = useState(0);
  const [nbGoalsRed, setNbGoalsRed] = useState(0);
  const [nbGoalsBlue, setNbGoalsBlue] = useState(0);

  const start = async () => {
    setIsGameRunning(true);
  };
  const stop = async () => {
    setIsGameRunning(false);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  useEffect(() => {
    if (!isGameRunning) return;

    const ws = new WebSocket(`${RASBERRY_BASE_PATH}/ws`);

    ws.onmessage = (apiEvent: MessageEvent) => {
      console.log("new message receive");
      console.log(apiEvent.data);

      const timestamp = new Date().getTime();

      const apiEventParsed = JSON.parse(apiEvent.data) as APIEvent;

      const event: Event = {
        timestamp,
        team: apiEventParsed.team,
        value: apiEventParsed.value,
        type: apiEventParsed.type,
      };

      const convertedSpeed = convertSpeed(event.value);

      if (event.type === "speed") {
        setSpeeds((prevSpeeds) => {
          if (prevSpeeds.length === MAX_GRAPH_POINTS) {
            return [
              ...prevSpeeds.slice(1, prevSpeeds.length),
              { ...event, value: convertedSpeed },
            ];
          }

          return [...prevSpeeds, { ...event, value: convertedSpeed }];
        });

        setHighestSpeed((prevHighestSpeed) => {
          if (convertedSpeed > prevHighestSpeed) return convertedSpeed;
          return prevHighestSpeed;
        });
        return;
      }

      setEvents((prevEvents) => [
        { ...event, value: convertedSpeed },
        ...prevEvents,
      ]);

      if (event.type === "goal") {
        setNbGoals((prevGoal) => prevGoal + 1);
        if (event.team === "blue") setNbGoalsBlue((prevGoal) => prevGoal + 1);
        else setNbGoalsRed((prevGoal) => prevGoal + 1);
      }
    };

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
        nbGoalsBlue,
        nbGoalsRed,
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
