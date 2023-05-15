import { RASBERRY_BASE_PATH } from "@/config";
import { Button } from "./Button";
import { useState } from "react";

export const Buttons: React.FunctionComponent = () => {
  const [isGameStarted, setisGameStarted] = useState(false);

  const startGame = () => {
    console.log("start the game");
    setisGameStarted(true);
    fetch(`${RASBERRY_BASE_PATH}/start`);
  };

  const stopGame = () => {
    setisGameStarted(false);

    console.log("End the game");
    fetch(`${RASBERRY_BASE_PATH}/stop`);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-5">
      <Button
        label="START"
        variant="primary"
        onClick={startGame}
        disabled={isGameStarted}
      />
      <Button
        label="STOP"
        variant="secondary"
        onClick={stopGame}
        disabled={!isGameStarted}
      />
    </div>
  );
};
