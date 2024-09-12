import { useState } from "react";
import * as XLSX from "xlsx";

const ImportExcel = () => {
  const [data, setData] = useState([]);
  const [fileSelected, setFileSelected] = useState(false);

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
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
    };
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {fileSelected && data.length === 0 && (
        <p className="text-red-500 font-bold">No data to display</p>
      )}
    </div>
  );
};

export default ImportExcel;
