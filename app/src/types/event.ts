export const EVENT_TYPE = ["shoot", "goal", "speed"] as const;

export type TEAM = "red" | "blue";

export type APIEvent = {
  type: (typeof EVENT_TYPE)[number];
  team: TEAM;
  value: number;
};

export type Event = APIEvent & { timestamp: number };
