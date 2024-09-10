import React from "react";

const MiniModal = ({ modalVisible, destination, deleteView, closeModal }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        modalVisible ? "opacity-100 z-50" : "opacity-0 -z-99"
      } transition-opacity duration-200 ease-in`}
    >
      <div className={`relative bg-white p-8 rounded-md w-100 md:w-80`}>
        <h1 className="text-xl text-center font-medium">
          Are you sure you want to delete the{" "}
          <span className="font-semibold">{destination}</span> table?
        </h1>
        <div className="mt-5 flex gap-3 items-center justify-center">
          <button
            className="bg-red-500 px-7 py-2 rounded-lg font-medium text-white duration-200 hover:bg-red-600"
            onClick={() => deleteView(destination)}
          >
            DELETE
          </button>

          <button
            className="bg-slate-400 px-7 py-2 rounded-lg font-medium text-white duration-200 hover:bg-slate-500"
            onClick={() => {
              closeModal();
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
      <div className="overlay fixed inset-0 bg-black opacity-50"></div>
    </div>
  );
};

export default MiniModal;
