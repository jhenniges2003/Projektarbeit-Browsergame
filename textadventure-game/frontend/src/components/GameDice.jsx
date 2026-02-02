import { useEffect, useState } from "react";

/*
  //////// CONST BUILD
  <GameDice max={4} onFinish={(result) => console.log(result)}/>
*/

export default function GameDice({ max = 4, onFinish }) {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    let rollCount = 0;

    const rollInterval = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * max) + 1;
      setCurrentNumber(randomNumber);

      rollCount = rollCount + 1;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        setIsRolling(false);

        if (onFinish) {
          onFinish(randomNumber);
        }
      }
    }, 100);

    return () => {
      clearInterval(rollInterval);
    };
  }, [max, onFinish]);

  return (
    <div
      style={{
        width: "120px",
        height: "120px",
        border: "2px solid #333",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        fontWeight: "bold",
        backgroundColor: "#fff",
        userSelect: "none",
      }}
    >
      {currentNumber}
    </div>
  );
}
