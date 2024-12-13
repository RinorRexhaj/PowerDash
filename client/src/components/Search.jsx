import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faXmark } from "@fortawesome/free-solid-svg-icons";

const Search = ({ search, setSearch, data }) => {
  const [createWithAI, setCreateWithAI] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const promptRef = useRef(null);
  const createWithAIRef = useRef(null);

  useEffect(() => {
    promptRef.current.focus();
  }, []);

  const createSuggestion = useCallback(() => {
    if (!data || data.length === 0) return [];

    const suggestions = [];
    const columns = data[0];
    const rows = data.slice(1);

    columns.forEach((column, index) => {
      suggestions.push(`Show all data in the "${column}" column`);
      suggestions.push(`Find unique values in "${column}"`);

      // Generate specific suggestions if the column contains numerical data
      if (rows.every((row) => !isNaN(row[index]))) {
        suggestions.push(`Calculate the average of "${column}"`);
        suggestions.push(`Find the maximum value in "${column}"`);
      }
    });

    return suggestions;
  }, [data]);

  return (
    <div className="absolute w-full overflow-y-auto top-10 bg-black z-99 flex flex-col gap-1 outline outline-2 outline-slate-200 rounded-md overflow-hidden">
      <textarea
        ref={promptRef}
        type="text"
        className={`px-[7px] py-[3px]  resize-none border-2 border-emerald-400 border-b-slate-200 rounded-t-md bg-gradient-to-r from-cyan-500 to-emerald-300 text-white placeholder:text-white outline-none ${
          isTyping ? "h-20" : "h-9"
        } duration-200`}
        onFocus={focus}
        placeholder="Write your prompt"
        onChange={(e) => {
          if (e.target.value === "") setIsTyping(false);
          else {
            setPrompt(e.target.value);
            setIsTyping(true);
          }
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCreateWithAI(false);
          setSuggestion(false);
          setPrompt("");
          setAnalyzing(false);
          // createWithAIRef.current.blur();
          setSearch(false);
        }}
        className={`absolute top-1 right-1 w-4 h-4 p-1 flex items-center justify-center rounded-full bg-white `}
      >
        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
      </button>
      {!isTyping && (
        <>
          <p className="px-3 py-1 z-99 text-white text-sm font-medium animate-slideIn flex items-center gap-1 [animation-fill-mode:backwards]">
            <FontAwesomeIcon icon={faLightbulb} />
            Suggestions
          </p>
          {createSuggestion().map((suggestion, index) => {
            return (
              <div
                key={index}
                className="px-3 py-2 bg-[#2b364b] hover:bg-black duration-150  text-white cursor-pointer text-sm z-99 font-medium animate-slideIn [animation-fill-mode:backwards]"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setPrompt(suggestion);
                  setSuggestion(false);
                  // analyzePrompt(suggestion);
                }}
              >
                {suggestion}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Search;
