import * as XLSX from "xlsx";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable, faX } from "@fortawesome/free-solid-svg-icons";

const ImportExcel = ({
  type,
  setData,
  setFileSelected,
  setFileImported,
  inputRef,
  setMinCol,
}) => {
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [fileData, setFileData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      const parsedData = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        header: 1,
      });
      let minColumn;
      let maxColumn;
      parsedData.forEach((row) => {
        if (maxColumn === undefined || row.length > maxColumn)
          maxColumn = row.length;
        for (let i = 0; i < maxColumn; i++) {
          if (row[i] === undefined) row[i] = "";
          else if (i < minColumn || minColumn === undefined) minColumn = i;
        }
      });
      setMinCol(minColumn);
      if (merges) {
        merges.forEach((m) => {
          const col =
            m.s.c === parsedData[m.s.r].length
              ? m.s.c - 1
              : 2 * m.s.c - parsedData[m.s.r].length > 0
              ? 2 * m.s.c - parsedData[m.s.r].length
              : m.s.c;
          const val = parsedData[m.s.r][col];
          for (let i = m.s.r; i <= m.e.r; i++) {
            if (parsedData[i][col] === "") {
              parsedData[i][col] = val;
            }
            for (let j = col; j <= m.e.c; j++) {
              if (parsedData[i][j] === "") {
                parsedData[i][j] = val;
              }
            }
          }
        });
      }
      const fixedData = parsedData.filter(
        (row) => row.length > 0 && !emptyRow(row)
      );
      for (let i = 0; i < fixedData.length; i++) {
        fixedData[i] = fixedData[i].slice(minColumn);
      }
      console.log(fixedData);
      localStorage.setItem(type, JSON.stringify(fixedData));
      setData(fixedData);
      setFileImported(true);
    }
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
      />

      {modalVisible && (
        <div
          className={`fixed mt-18 inset-0 flex items-center justify-center ${
            modalVisible
              ? "opacity-100 z-50 animate-fade"
              : "opacity-0 -z-50 animate-fadeOut"
          } transition-opacity duration-200 ease-in`}
        >
          <div
            className={`relative ${
              modalVisible ? "opacity-100 z-50" : "opacity-0 -z-50"
            } bg-white p-8 rounded-md w-150 ml-24 md:w-80`}
          >
            <div className="flex gap-4 items-center bg-slate-100 mt-3 rounded-lg text-xl text-center font-medium">
              <FontAwesomeIcon
                icon={faTable}
                size="2xl"
                className="text-zinc-400"
              />
              <h1 className="italic text-black">
                The file you chose has more than one sheet!
              </h1>
            </div>

            <h2 className="mt-8">
              Please select which sheet you want to import:
            </h2>
            <ul className="mt-2">
              {sheetNames.map((sheet) => (
                <li
                  key={sheet}
                  className="font-medium bg-slate-50 border-2 border-slate-200 mb-1 hover:bg-black hover:text-white cursor-pointer"
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
