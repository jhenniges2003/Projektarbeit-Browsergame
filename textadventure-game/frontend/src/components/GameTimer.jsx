import { useEffect, useState } from "react";
import colors from "../styles/colors";

/*
    <GameTimer seconds={90} onFinish={() => console.log("")}/>
*/

export default function GameTimer({ seconds, onFinish }) {

  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((currentTime) => {
        return currentTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [timeLeft, onFinish]);

  const minutes = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;
  const formattedTime = String(minutes).padStart(2, "0") + ":" + String(secondsLeft).padStart(2, "0");
  const progressPercentage = (timeLeft / seconds) * 100;

  return (
    <div className="d-flex align-items-center gap-3">
      <div style={{ minWidth: "60px", fontWeight: "bold", color: "white"}}>
        {formattedTime}
      </div>

      <div className="progress w-100" style={{ height: "20px", color: colors.primary }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: progressPercentage + "%", backgroundColor: colors.primary }}
        />
      </div>
    </div>
  );
}
