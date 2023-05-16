import { RASBERRY_BASE_PATH } from "@/config";
import { Button } from "./Button";
import { useState } from "react";
import { useEvents } from "@/context/events";

export const Buttons: React.FunctionComponent = () => {
  const { isGameRunning, start, stop } = useEvents();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-5">
      <Button
        label="START"
        variant="primary"
        onClick={start}
        disabled={isGameRunning}
      />
      <Button
        label="STOP"
        variant="secondary"
        onClick={stop}
        disabled={!isGameRunning}
      />
    </div>
  );
};
