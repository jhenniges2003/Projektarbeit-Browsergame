import { useState } from "react";

/*
  //////// CONST BUILD
  const buttonTexts = ["Text1", "Text2", "Text3", ...];

  const handleSelect = (value, index) => {
    console.log( value, index);
  };

  //////// COMPONENETS CALL
  <GameButtonGrid
    options={buttonTexts}
    onSelect={handleSelect}
  />
*/

export default function GameButtonGrid({ options = [], onSelect }) {

  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleClick = (option, index) => {
    setSelectedIndex(index);
    onSelect(option, index);
  };

  return (
    <div className="container p-0">
      <div className="row g-2">

        {[0, 1, 2, 3].map((index) => {
          const option = options[index];
          const isSelected = selectedIndex === index;
          const isDisabled = option === undefined || option === null;

          let buttonClass = "btn btn-outline-primary w-100";
          if (isSelected) {
            buttonClass = "btn btn-primary w-100";
          }

          return (
            <div className="col-6" key={index}>
              <button
                type="button"
                className={buttonClass}
                disabled={isDisabled}
                onClick={() => handleClick(option, index)}
              >
                {option ? option : "-"}
              </button>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}