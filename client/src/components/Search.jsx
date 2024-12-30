import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faXmark } from "@fortawesome/free-solid-svg-icons";
import currency from "currency.js";
import { toast } from "react-toastify";

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
    // {
    //   type: "where",
    //   actions: ["select", "filter"],
    // },
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

  const analyzePrompt = async (suggestion) => {
    setAnalyzing(true);
    let words, tokens;
    let result = [];
    const maxLength = Math.max(
      ...formattedColumns.map((col) => col.split(" ").length)
    );
    const newPrompt =
      suggestion !== undefined
        ? suggestion.toLowerCase()
        : prompt.toLowerCase();
    await axios
      .post("http://127.0.0.1:5000/search", {
        prompt: newPrompt,
      })
      .then((res) => {
        words = res.data.words.map((word) => word["word"]);
        tokens = res.data.words.map((word) => word["a_text"]);
      })
      .catch((err) => {
        toast.error("Something went wrong!", {
          position: "top-right",
          progressStyle: { background: "#3b82f6" },
          theme: "dark",
          autoClose: 2500,
          className:
            "relative w-64 bottom-6 left-16 bg-black shadow-sm shadow-slate-400/20 font-medium",
        });
        resetState();
        return;
      });
    let newData = [];
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
          action: action || fallbackAction,
          column: column || fallbackColumn,
          parameter: parameter,
          value: value || 1,
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
            action: action || fallbackAction,
            column: column || fallbackColumn,
            parameter: newParam,
          });
          resetValues(true);
        }
      }
    });
    setTimeout(() => {
      result.forEach((res) => {
        newData = processData(res, newData);
      });
      newData.unshift(columns);
      setData(newData);
      setTimeout(() => resetState(), 100);
    }, 300);
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
        : value !== "" || parameter === "top" || parameter === "bottom") ||
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

  const compareValues = (dataType, first, second) => {
    if (dataType === "number") return currency(first) - currency(second);
    else if (dataType === "string") return first.localeCompare(second);
    else return new Date(first).getTime() - new Date(second).getTime();
  };

  const includesRow = (valueSet, colIndex, newData) => {
    return valueSet[colIndex].filter((v) => {
      return !newData.some((row) => row.includes(v));
    });
  };

  const sortData = (dataType, columnIndex, sortType, data) => {
    const sortedData = data.sort((a, b) => {
      if (dataType === "string") {
        return !sortType
          ? a[columnIndex].localeCompare(b[columnIndex])
          : b[columnIndex].localeCompare(a[columnIndex]);
      } else if (dataType === "number") {
        return !sortType
          ? currency(a[columnIndex]) - currency(b[columnIndex])
          : currency(b[columnIndex]) - currency(a[columnIndex]);
      } else if (dataType === "date") {
        return !sortType
          ? new Date(a[columnIndex]).getTime() -
              new Date(b[columnIndex]).getTime()
          : new Date(b[columnIndex]).getTime() -
              new Date(a[columnIndex]).getTime();
      }
    });
    return sortedData;
  };

  const processData = (result, resData) => {
    const colIndex = formattedColumns.indexOf(result.column);
    const column = columns[colIndex];
    const { action, parameter, value, secondValue } = result;
    let newData = [];
    if (action === "sort") {
      newData = sortData(
        dataTypes[column],
        colIndex,
        parameter !== "ascending",
        resData.length === 0 ? [...copyData].slice(1) : resData
      );
    } else {
      let newValues = [];
      if (parameter === "less") {
        newData = [...copyData].slice(1).filter((v) => {
          const val = currency(v[colIndex]);
          if (action !== "filter") return val < value;
          return val > value;
        });
      } else if (parameter === "more") {
        newData = [...copyData].slice(1).filter((v) => {
          const val = currency(v[colIndex]);
          if (action !== "filter") return val > value;
          return val < value;
        });
      } else if (parameter === "top") {
        newData = [...copyData]
          .slice(1)
          .sort((a, b) =>
            compareValues(dataTypes[column], b[colIndex], a[colIndex])
          )
          .slice(
            action === "select" ? 0 : value,
            action === "select" ? value : copyData.length - 1
          );
      } else if (parameter === "bottom") {
        newData = [...copyData]
          .slice(1)
          .sort((a, b) =>
            compareValues(dataTypes[column], a[colIndex], b[colIndex])
          )
          .slice(
            action === "select" ? 0 : value,
            action === "select" ? value : copyData.length - 1
          );
      } else if (parameter === "between") {
        newData = [...copyData].slice(1).filter((v) => {
          const val = currency(v[colIndex]);
          if (action !== "filter") return val > value && val < secondValue;
          return val < value || val > secondValue;
        });
      }
      newValues = includesRow(valueSet, colIndex, newData);
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
    return newData;
  };

  const createSuggestion = () => {
    if (!data || data.length === 0) return [];

    const columns = data[0];
    const rows = data.slice(1);

    const numberSuggestions = [];
    const generalSuggestions = [];

    const getRandomValues = (values) => {
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length < 2) return [uniqueValues[0], uniqueValues[0]];
      uniqueValues.sort((a, b) => a - b);

      const bottom20Index = Math.ceil(uniqueValues.length * 0.2);
      const top80Index = Math.floor(uniqueValues.length * 0.8);

      const bottomRange = uniqueValues.slice(bottom20Index);
      const topRange = uniqueValues.slice(0, top80Index);

      if (!bottomRange.length || !topRange.length) {
        throw new Error("Not enough values in valid ranges to select from.");
      }

      const bottomValue =
        bottomRange[Math.floor(Math.random() * bottomRange.length)];
      const topValue = topRange[Math.floor(Math.random() * topRange.length)];

      const transformToLargestSignificantDigit = (val) => {
        const highestPlaceValue = Math.pow(10, Math.floor(Math.log10(val)));
        return Math.round(val / highestPlaceValue) * highestPlaceValue;
      };

      let transformedBottomValue, transformedTopValue;

      do {
        const bottomValue =
          bottomRange[Math.floor(Math.random() * bottomRange.length)];
        const topValue = topRange[Math.floor(Math.random() * topRange.length)];

        transformedBottomValue =
          transformToLargestSignificantDigit(bottomValue);
        transformedTopValue = transformToLargestSignificantDigit(topValue);
      } while (transformedBottomValue === transformedTopValue);

      return [
        Math.min(transformedBottomValue, transformedTopValue),
        Math.max(transformedBottomValue, transformedTopValue),
      ];
    };

    const numberColumns = columns
      .filter((col) => dataTypes[col] === "number")
      .slice(0, 2);
    const dateColumn = columns.find((col) => dataTypes[col] === "date");
    const stringColumn = columns.find((col) => dataTypes[col] === "string");
    numberColumns.forEach((column, index) => {
      const columnValues = rows
        .map((row) => currency(row[columns.indexOf(column)]))
        .filter((val) => !isNaN(val));
      if (dataTypes[column] === "number") {
        const [value1, value2] = getRandomValues(columnValues);
        if (numberColumns.length === 1) {
          numberSuggestions.push(
            `Select top 10 rows from ${column.trim()}`,
            `Filter ${column.trim()} between ${value1} and ${value2}`
          );
        } else {
          numberSuggestions.push(
            index === 0
              ? `Select top 10 rows from ${column.trim()}`
              : `Filter ${column.trim()} between ${value1} and ${value2}`
          );
        }
      }
    });
    generalSuggestions.push(
      dateColumn !== undefined &&
        `Sort ${dateColumn.trim()} from the latest to the earliest`,
      `Sort ${stringColumn.trim()} from A-Z`,
      numberColumns[0] !== undefined &&
        `Sort ${numberColumns[0].trim()} from highest to lowest`
    );

    const prioritizedSuggestions = [
      ...numberSuggestions,
      ...generalSuggestions,
    ];
    return [...new Set(prioritizedSuggestions)].slice(0, 5);
  };

  const resetState = () => {
    setCreateWithAI(false);
    setSuggestion(false);
    setPrompt("");
    setAnalyzing(false);
    setIsTyping(false);
    // createWithAIRef.current.blur();
    setSearch(false);
  };

  return (
    <div
      className={`absolute w-full overflow-y-auto top-10 bg-black z-99 flex flex-col gap-1 outline outline-2 outline-slate-200 rounded-md overflow-hidden animate-fade ${
        search ? "flex" : "hidden"
      }`}
    >
      {analyzing ? (
        <p
          className={`px-2 pt-1.5 h-9 text-sm text-center font-medium border-2 border-emerald-400 border-b-slate-200 rounded-t-md bg-gradient-to-r from-cyan-500 to-emerald-300 text-white outline-none animate-analyzing`}
        >
          Analyzing...
        </p>
      ) : (
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
              analyzePrompt();
            }
          }}
        />
      )}
      {!analyzing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetState();
          }}
          className={`absolute top-1 right-1 w-4 h-4 p-1 flex items-center justify-center rounded-full bg-white `}
        >
          <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
        </button>
      )}
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
                  analyzePrompt(suggestion);
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
