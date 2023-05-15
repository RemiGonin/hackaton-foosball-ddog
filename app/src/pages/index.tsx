import Image from "next/image";
import { Roboto } from "next/font/google";
import { Buttons } from "@/components/Buttons";
import { Separator } from "@/components/Separator";
import { EventList } from "@/components/EventList";
import { SpeedGraph } from "@/components/SpeedGraph";

export default function Home() {
  return (
    <main className="flex flex-col w-screen h-screen ">
      <div className="w-full p-4">
        <h1 className="text-lg">Track your balls</h1>
      </div>
      <div className="w-full flex flex-wrap flex-1 overflow-hidden">
        <div className="h-full w-1/2">
          <div className="w-full h-1/4">
            <Buttons />
            <Separator type="horizontal" />
          </div>
          <div className="w-full h-3/4 ">
            <SpeedGraph />
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
