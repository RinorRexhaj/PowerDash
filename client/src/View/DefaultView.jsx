import React from "react";

const DefaultView = ({ type }) => {
  return (
    <div
      className={`w-full relative ${
        type !== "" ? "flex" : "hidden"
      }  flex-col z-50 justify-center items-center animate-fade [animation-fill-mode:backwards]`}
    >
      <div className="w-full relative min-h-125 shadow-2 bg-white flex flex-col overflow-y-clip">
        <div className="w-full sticky top-0 z-99 flex items-center justify-between shadow-2 bg-white py-3 px-8 sm:px-4">
          <h1 className={`flex text-xl font-semibold overflow-hidden`}>
            {type.split("").map((char, index) => {
              return (
                <p
                  className="animate-textReveal [animation-fill-mode:backwards]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  key={`${char}-${index}`}
                >
                  {char === " " ? "\u00A0" : char}{" "}
                </p>
              );
            })}
          </h1>
        </div>
        <div className="w-full flex items-center justify-center gap-2">
          <img
            src="src/assets/img/data.jpg"
            alt=""
            className="relative top-10 w-1/3 animate-fade [animation-fill-mode:backwards]"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="w-1/2">
            <p
              className={`w-full animate-fade flex justify-center mt-30 text-2xl text-black font-bold [animation-fill-mode:backwards]`}
              style={{ animationDelay: "1s" }}
            >
              Start your data visualization journey
            </p>
            <p
              className="w-full flex justify-center animate-slideIn text-lg font-medium [animation-fill-mode:backwards]"
              style={{ animationDelay: "1.25s" }}
            >
              {Object.entries(localStorage).length === 0
                ? "Click the + to add a new view for your data"
                : "Check out the views on the side"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultView;
