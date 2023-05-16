import Image from "next/image";
import { Roboto } from "next/font/google";
import { Buttons } from "@/components/Buttons";
import { Separator } from "@/components/Separator";
import { EventList } from "@/components/EventList";
import { SpeedGraph } from "@/components/SpeedGraph";
import { Stats } from "@/components/Stats";
import { useEvents } from "@/context/events";

export default function Home() {
  const { highestSpeed, nbGoals, nbGoalsBlue, nbGoalsRed } = useEvents();

  return (
    <main className="flex flex-col w-screen h-screen ">
      <div className="w-full p-4">
        <h1 className="text-lg"> Foosball tracker </h1>
      </div>
      <div className="w-full flex flex-wrap flex-1 overflow-hidden">
        <div className="h-full w-1/2">
          <div className="w-full h-1/4">
            <Buttons />
            <Separator type="horizontal" />
          </div>
          <div className="w-full h-3/4 ">
            <div className="h-2/3 w-full">
              <SpeedGraph />
            </div>
            <div className="h-1/3 w-full flex gap-4 py-8 px-4 overflow-auto">
              <Stats label="Highest Speed" value={highestSpeed} unit="km/h" />
              <Stats label="Total Goals" value={nbGoals} />
              <Stats label="Goals Red" value={nbGoalsRed} team="red" />
              <Stats label="Goals Blue" value={nbGoalsBlue} team="blue" />
            </div>
          </div>
        </div>
        <Separator type="vertical" />
        <div className="flex-1 h-full">
          <EventList />
        </div>
      </div>
    </main>
  );
}
