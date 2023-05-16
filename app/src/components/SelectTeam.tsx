import { TEAM } from "@/types/event";
import { useState } from "react";

type Props = {
  onChange: (team: TEAM | "all") => void;
};

const OPTIONS: readonly (TEAM | "all")[] = ["all", "blue", "red"] as const;

export const SelectTeam: React.FunctionComponent<Props> = ({ onChange }) => {
  const [selectedValue, setSelectedValue] = useState<TEAM | "all">("all");

  return (
    <select
      name="Team select"
      id="teamSelect"
      value={selectedValue}
      onChange={(e) => {
        setSelectedValue(e.target.value as TEAM | "all");
        onChange(e.target.value as TEAM | "all");
      }}
    >
      {OPTIONS.map((opt) => (
        <option
          value={opt}
          className={`${
            opt === "blue"
              ? "text-blue-500"
              : opt === "red"
              ? "text-red-500"
              : ""
          }`}
          key={opt}
        >
          {opt} team
        </option>
      ))}
    </select>
  );
};
