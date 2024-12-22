import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faXmark } from "@fortawesome/free-solid-svg-icons";
import currency from "currency.js";

const Search = ({
  search,
  setSearch,
  data,
  setData,
  dataTypes,
  copyData,
  columns,
  formattedColumns,
  setSortType,
  setSortColumn,
  valueSet,
  currentValues,
  setCurrentValues,
  filterColumns,
  setFilterColumns,
}) => {
  const [createWithAI, setCreateWithAI] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const promptRef = useRef(null);
  const actions = [
    [
      "filter",
      "remove",
      "refine",
      "include",
      "exclude",
      "segment",
      "narrow",
      "without",
    ],
    [
      "select",
      "choose",
      "retrieve",
      "query",
      "isolate",
      "highlight",
      "subset",
      "show",
      "pick",
      "extract",
      "return",
    ],
    [
      "sort",
      "order",
      "rank",
      "organize",
      "arrange",
      "rank",
      "sequence",
      "prioritize",
      "order by",
      "align",
      "categorize",
    ],
    ["chart", "graph", "plot", "diagram", "tableau", "presentation", "display"],
  ];
  const parameters = [
    {
      type: "less",
      actions: ["select", "filter"],
      keywords: [
        "less",
        "lower",
        "before",
        "under",
        "below",
        "smaller",
        "fewer",
      ],
    },
    {
      type: "more",
      actions: ["select", "filter"],
      keywords: [
        "more",
        "higher",
        "after",
        "over",
        "above",
        "larger",
        "greater",
        "bigger",
      ],
    },
    {
      type: "between",
      actions: ["select", "filter"],
      keywords: [
        "between",
        "middle",
        "range",
        "interval",
        "from",
        "to",
        "within",
        "spanning",
      ],
    },
    {
      type: "top",
      actions: ["select", "filter"],
      keywords: [
        "top",
        "most",
        "best",
        "first",
        "highest",
        "leading",
        "maximum",
        "max",
        "peak",
        "uppermost",
        "upmost",
        "prime",
        "foremost",
        "elite",
        "superior",
        "latest",
      ],
    },
    {
      type: "bottom",
      actions: ["select", "filter"],
      keywords: [
        "bottom",
        "lowest",
        "last",
        "least",
        "minimum",
        "min",
        "trailing",
        "end",
        "base",
        "foot",
        "tail",
        "inferior",
        "earliest",
      ],
    },
    {
      type: "ascending",
      actions: ["sort"],
      keywords: [
        "ascending",
        "ascend",
        "upward",
        "increasing",
        "z-a",
        "a",
        "chronological",
        "earliest",
        "lowest",
      ],
    },
    {
      type: "descending",
      actions: ["sort"],
      keywords: [
        "descending",
        "descend",
        "downward",
        "decreasing",
        "a-z",
        "z",
        "reverse",
        "latest",
        "highest",
      ],
    },
  ];
  let action = "",
    column = "",
    parameter = "",
    value = "",
    secondValue = "",
    fallbackAction = "",
    fallbackColumn = "",
    fallbackParam = "";

  useEffect(() => {
    if (search) promptRef.current.focus();
  }, [search]);

  const analyzePrompt = async () => {
    let words, tokens, entities;
    let result = [];
    const maxLength = Math.max(
      ...formattedColumns.map((col) => col.split(" ").length)
    );
    await axios.post("http://127.0.0.1:5000/prompt", { prompt }).then((res) => {
      words = res.data.words.map((word) => word["word"]);
      tokens = res.data.words.map((word) => word["a_text"]);
      entities = res.data.entities;
    });
    words.forEach((word, i) => {
      if (action === "") {
        action = getAction(word);
      }
      if (column === "") {
        if (!formattedColumns.some((col) => col.split(" ").includes(word))) {
          column = "";
        } else {
          column = getColumn([...words].slice(i, i + maxLength + 1));
          if (column !== "") fallbackColumn = column;
          else fallbackColumn = "";
        }
      }
      if (parameter === "") {
        const newAction = action !== "" ? action : fallbackAction;
        parameter = getParameter(tokens[i], newAction);
      }
      if (value === "" || (parameter === "between" && secondValue === "")) {
        const val = getValue(word);
        if (parameter !== "between") value = val;
        else {
          if (value === "") value = val;
          else secondValue = val;
        }
      }
      if (action !== "sort" && allValues(false)) {
        if (column === "") column = fallbackColumn;
        if (parameter === "between") {
          if (value > secondValue) {
            const temp = value;
            value = secondValue;
            secondValue = temp;
          }
        }
        result.push({
          action: action !== "" ? action : fallbackAction,
          column: column !== "" ? column : fallbackColumn,
          parameter: parameter,
          value: value,
          ...(parameter === "between" && secondValue !== ""
            ? { secondValue: secondValue }
            : {}),
        });
        resetValues(false);
      } else if (
        action === "sort" &&
        allValues(true) &&
        !result.some((res) => res.action === "sort")
      ) {
        if (parameter !== "" || i === words.length - 1) {
          let newParam = "";
          if (parameter === "") {
            if (result.some((res) => res.parameter === "top"))
              newParam = "descending";
            else newParam = "ascending";
          } else {
            newParam = parameter;
          }
          result.push({
            action: action !== "" ? action : fallbackAction,
            column: column !== "" ? column : fallbackColumn,
            parameter: newParam,
          });
          resetValues(true);
        }
      }
    });
    result.forEach((res) => {
      processData(res);
    });
  };

  const getAction = (word) => {
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].includes(word)) return actions[i][0];
    }
    return "";
  };

  const getColumn = (words) => {
    for (const col of formattedColumns) {
      const colWords = col.split(" ");
      const matchesAll = colWords.every((w) => words.includes(w));
      if (matchesAll) {
        return col;
      }
    }

    let bestMatch = null;
    let maxMatches = 0;
    for (const col of formattedColumns) {
      const colWords = col.split(" ");
      const matchCount = colWords.filter((w) => words.includes(w)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = col;
      }
    }
    if (bestMatch !== null && bestMatch !== "") return bestMatch;
    return "";
  };

  const getParameter = (word, action) => {
    for (let i = 0; i < parameters.length; i++) {
      if (
        parameters[i].keywords.includes(word) &&
        parameters[i].actions.includes(action)
      )
        return parameters[i].type;
    }
    return "";
  };

  const getValue = (word) => {
    const value = word.replace(/[^0-9.]/g, "");
    return parseFloat(value) || "";
  };

  const allValues = (sort) => {
    return (
      (action !== "" || fallbackAction !== "") &&
      (column !== "" || fallbackColumn !== "") &&
      (parameter !== "" || sort) &&
      ((parameter === "between"
        ? secondValue !== "" && value !== ""
        : value !== "") ||
        sort)
    );
  };

  const resetValues = (sort) => {
    fallbackAction = sort ? "" : action;
    fallbackColumn = sort ? "" : column;
    fallbackParam = parameter;
    action = "";
    column = "";
    parameter = "";
    value = "";
  };

  const processData = (result) => {
    const colIndex = formattedColumns.indexOf(result.column);
    const column = columns[colIndex];
    const { action, parameter, value, secondValue } = result;
    if (action === "sort") {
      setSortColumn(column);
      setSortType(parameter !== "ascending");
    } else if (action === "filter" || action === "select") {
      let newValues = [];
      if (parameter === "less") {
        newValues = valueSet[colIndex].filter((v) => {
          const val = currency(v);
          if (action === "filter") return val < value;
          return val > value;
        });
      } else if (parameter === "more") {
        newValues = valueSet[colIndex].filter((v) => {
          const val = currency(v);
          if (action === "filter") return val > value;
          return val < value;
        });
      } else if (parameter === "top") {
        const newData = [...copyData]
          .slice(1)
          .sort((a, b) => currency(b[colIndex]) - currency(a[colIndex]))
          .slice(0, value);
        newValues = valueSet[colIndex].filter((v) => {
          const incl = newData.some((row) => row.includes(v));
          if (action === "filter") return incl;
          return !incl;
        });
      } else if (parameter === "bottom") {
        const newData = [...copyData]
          .slice(1)
          .sort((a, b) => currency(a[colIndex]) - currency(b[colIndex]))
          .slice(0, value);
        newValues = valueSet[colIndex].filter((v) => {
          const incl = newData.some((row) => row.includes(v));
          if (action === "filter") return incl;
          return !incl;
        });
      } else if (parameter === "between") {
        newValues = valueSet[colIndex].filter((v) => {
          const val = currency(v);
          if (action === "filter") return val > value && val < secondValue;
          return val < value || val > secondValue;
        });
      }
      setCurrentValues(
        currentValues.map((vals, index) => {
          if (index === colIndex) return newValues;
          return vals;
        })
      );
      if (!filterColumns.includes(column)) {
        setFilterColumns([...filterColumns, column]);
      }
    }
  };

  const createSuggestion = useCallback(() => {
    if (!data || data.length === 0) return [];

    const columns = data[0];
    const rows = data.slice(1);

    const columnTypes = columns.map((column, colIndex) => {
      const sampleValues = rows.map((row) => row[colIndex]);
      if (
        sampleValues.every((val) => !isNaN(val) && val !== null && val !== "")
      ) {
        return "number";
      }
      return "text";
    });

    const numberSuggestions = [];
    const generalSuggestions = [];

    const getRandomValues = (values) => {
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length < 2) return [uniqueValues[0], uniqueValues[0]];
      const shuffled = uniqueValues.sort(() => 0.5 - Math.random());
      const [val1, val2] = shuffled.slice(0, 2);
      return [Math.min(val1, val2), Math.max(val1, val2)];
    };

    columnTypes.forEach((type, index) => {
      const column = columns[index];
      const columnValues = rows
        .map((row) => row[index])
        .filter((val) => !isNaN(val));

      if (type === "number") {
        const [value1, value2] = getRandomValues(columnValues);
        numberSuggestions.push(
          `Select top 10 rows from "${column}"`,
          `Filter "${column}" between "${value1}" and "${value2}"`
        );
      }

      generalSuggestions.push(`Sort rows by "${column}" in ascending order`);
    });

    const prioritizedSuggestions = [
      ...numberSuggestions,
      ...generalSuggestions,
    ];

    return [...new Set(prioritizedSuggestions)].slice(0, 3);
  }, [data]);

  return (
    <div
      className={`absolute w-full overflow-y-auto top-10 bg-black z-99 flex flex-col gap-1 outline outline-2 outline-slate-200 rounded-md overflow-hidden animate-fade ${
        search ? "flex" : "hidden"
      }`}
    >
      <textarea
        ref={promptRef}
        type="text"
        className={`px-2 pt-1.5 text-sm font-medium resize-none border-2 border-emerald-400 border-b-slate-200 rounded-t-md bg-gradient-to-r from-cyan-500 to-emerald-300 text-white placeholder:text-white outline-none ${
          isTyping ? "h-20 rounded-md" : "h-9"
        } duration-200`}
        onFocus={focus}
        placeholder="Write your prompt..."
        onChange={(e) => {
          if (e.target.value === "") setIsTyping(false);
          else {
            setPrompt(e.target.value);
            setIsTyping(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            analyzePrompt(prompt);
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
        <div className="overflow-y-auto h-50">
          <p className="px-3 py-1 z-99 text-white text-sm font-medium animate-slideIn flex items-center gap-1 [animation-fill-mode:backwards]">
            <FontAwesomeIcon icon={faLightbulb} />
            Suggestions
          </p>
          {createSuggestion().map((suggestion, index) => {
            return (
              <div
                key={index}
                className="px-3 py-2  bg-[#2b364b] hover:bg-black duration-150  text-white cursor-pointer text-sm z-99 font-medium animate-slideIn [animation-fill-mode:backwards]"
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
        </div>
      )}
    </div>
  );
};

export default Search;
