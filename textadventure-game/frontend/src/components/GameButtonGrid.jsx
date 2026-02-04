import { useState } from "react";
import colors from "../styles/colors";

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

export default function GameButtonGrid({ options = [], onSelect, voteAvatars = [[], [], [], []], disabled = false }) {

  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleClick = (option, index) => {
    setSelectedIndex(index);
    onSelect(option, index);
    setSelectedIndex(null);
  };

  const renderVotes = (images = []) => {
    if(!images.length) {
      return <div style={{ height: 22}} />;
    }

    return (
      <div className="d-flex gap-1 mb-1" style={{ minHeight: 22 }}>
        {images.map((source, i) => (
          <img 
            key={i}
            src={source}
            alt=""
            style={{
              width: 20,
              height: 20, 
              borderRadius: "50%",
              objectFit: "cover",
              border: "apx solid rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container p-0">
      <div className="row g-2">

        {[0, 1, 2, 3].map((index) => {
          const option = options[index];
          const isSelected = selectedIndex === index;
          const isDisabled = disabled || option == null;

          let buttonClass = "btn btn-outline-primary w-100";
          if (isSelected) {
            buttonClass = "btn btn-primary w-100";
          }

          return (
            <div className="col-6" key={index}>
              <div className="border rounded p-2 h-100">
                {renderVotes(voteAvatars[index] || [])}

                <button
                  type="button"
                  className={buttonClass}
                  disabled={isDisabled}
                  onClick={() => handleClick(option, index)}
                  style={{
                    color: "white",
                    borderColor: "white",
                    backgroundColor: colors.primary
                  }}
                >
                  {option ? option : "-"}
                </button>
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}