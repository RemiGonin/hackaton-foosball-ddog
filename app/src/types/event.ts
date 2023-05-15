export const EVENT_TYPE = ["shoot", "goal", "speed"] as const;

export type TEAM = "red" | "blue";

export type EventApi = {
  type: (typeof EVENT_TYPE)[number];
  team: TEAM;
  value: number;
};

export type Event = EventApi & { timestamp: number };
