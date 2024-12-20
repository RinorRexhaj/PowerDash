import * as XLSX from "xlsx";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable, faX } from "@fortawesome/free-solid-svg-icons";

const ImportExcel = ({ type, setFileSelected, initData, inputRef }) => {
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [fileData, setFileData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  let minColumn, maxColumn;
  let minRow, maxRow;
  let cells = [];

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!file) return;
    setFileSelected(true);

    reader.readAsArrayBuffer(file);
    // reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);
      setFileData(workbook);

      if (sheets.length === 1) {
        setSelectedSheet(sheets[0]);
        processSheetData(workbook, sheets[0]);
      } else {
        setModalVisible(true);
      }
    };
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    setModalVisible(false);
    processSheetData(fileData, sheetName);
  };

  const processSheetData = (workbook, sheetName) => {
    if (workbook && sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const merges =
        sheet["!merges"] !== undefined &&
        sheet["!merges"].sort((a, b) => a.s.r - b.s.r);
      setBoundaries(sheet);
      cells.length = maxRow - minRow + 1;
      for (let i = 0; i < cells.length; i++) {
        cells[i] = [];
        for (let j = 0; j < maxColumn - minColumn + 1; j++) cells[i][j] = "";
      }
      setValues(sheet);
      if (merges) {
        merges.forEach((m) => {
          const val = cells[m.s.r - minRow][m.s.c - minColumn];
          for (let i = m.s.r; i <= m.e.r; i++) {
            for (let j = m.s.c; j <= m.e.c; j++) {
              cells[i - minRow][j - minColumn] = val;
            }
          }
        });
      }
      const fixedData = cells.filter((row) => row.length > 0 && !emptyRow(row));
      const storageData = JSON.stringify(fixedData);
      if (type !== "" && type !== undefined && type !== null) {
        localStorage.setItem(type, storageData);
        initData(storageData);
        setTimeout(() => {
          setFileSelected(false);
        }, [200]);
      }
    }
  };

  const setBoundaries = (sheet) => {
    Object.entries(sheet).map(([key]) => {
      if (key === "!ref" || key === "!merges" || key === "!margins") return;
      let col = 0,
        row = 0;
      const colString = key.replace(/[^a-zA-Z]+/g, "");
      colString.split("").map((char) => {
        col += char.charCodeAt(0) - 65;
      });
      const rowString = key.replace(/[^0-9]+/g, "");
      row = parseInt(rowString - 1);
      if (col < minColumn || minColumn === undefined) minColumn = col;
      else if (col > maxColumn || maxColumn === undefined) maxColumn = col;
      if (row < minRow || minRow === undefined) minRow = row;
      else if (row > maxRow || maxRow === undefined) maxRow = row;
    });
  };

  const setValues = (sheet) => {
    Object.entries(sheet).map(([key, value]) => {
      if (key === "!ref" || key === "!merges" || key === "!margins") return;
      let col = 0,
        row = 0;
      const colString = key.replace(/[^a-zA-Z]+/g, "");
      colString.split("").map((char) => {
        col += char.charCodeAt(0) - 65;
      });
      const rowString = key.replace(/[^0-9]+/g, "");
      row = parseInt(rowString - 1);
      cells[row - minRow][col - minColumn] = value.w;
    });
  };

  const emptyRow = (row) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== undefined && row[i] !== null && row[i] !== "")
        return false;
    }
    return true;
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="opacity-0 -z-99 absolute"
        onChange={handleFileUpload}
        ref={inputRef}
        name="import"
      />
      {modalVisible && (
        <div
          className={`fixed mt-18 flex items-center justify-center ${
            modalVisible
              ? "opacity-100 z-50 animate-fade"
              : "opacity-0 -z-50 animate-fadeOut"
          } transition-opacity duration-200 ease-in`}
        >
          <div
            className={`relative ${
              modalVisible ? "opacity-100 z-50" : "opacity-0 -z-50"
            } bg-white p-8 rounded-md w-130 ml-24 md:w-80`}
          >
            <div className="flex gap-4 items-center bg-slate-100 mt-3 rounded-lg text-xl text-center font-medium">
              <FontAwesomeIcon
                icon={faTable}
                size="2xl"
                className="text-zinc-400"
              />
              <h1 className="font-bold text-black">
                The file you chose has more than one sheet!
              </h1>
            </div>

            <h2 className="mt-8 font-medium">
              Please select which sheet you want to import:
            </h2>
            <ul className="mt-2">
              {sheetNames.map((sheet) => (
                <li
                  key={sheet}
                  className="font-medium px-2 bg-slate-50 border-2 border-slate-200 mb-1 hover:bg-black hover:text-white cursor-pointer"
                  onClick={() => handleSheetChange(sheet)}
                >
                  <button>{sheet}</button>
                </li>
              ))}
            </ul>
            <button
              className="absolute top-1 right-3"
              onClick={() => setModalVisible(false)}
            >
              {" "}
              <FontAwesomeIcon
                icon={faX}
                size="lg"
                className="text-slate-600 hover:text-black"
              />{" "}
            </button>
          </div>
          <div className="overlay fixed inset-0 bg-black opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default ImportExcel;
