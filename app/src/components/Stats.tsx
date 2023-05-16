import { TEAM } from "@/types/event";

type Props = {
  label: string;
  value: number;
  unit?: string;
  team?: TEAM;
};

export const Stats: React.FunctionComponent<Props> = ({
  label,
  value,
  unit,
  team,
}) => {
  return (
    <div className="h-full relative shrink-0 rounded-md min-w-[208px] bg-gray-100 flex flex-col items-center">
      <h3 className="pt-3 text-lg">{label}</h3>
      {team ? (
        <span
          className={`text-sm font-normal absolute top-10 ${
            team === "blue" ? "text-blue-500" : "text-red-500"
          }`}
        >
          Team {team}
        </span>
      ) : null}
      <div className="flex-1 w-full flex items-center justify-center px-14">
        <div className="relative">
          <span className="font-black text-5xl ">{value}</span>{" "}
          {unit ? (
            <span className="text-sm font-normal text-gray-600 absolute -right-10 bottom-2 ">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
