import * as XLSX from "xlsx";

const ImportExcel = ({
  type,
  setData,
  setFileSelected,
  setFileImported,
  inputRef,
  setMinCol,
}) => {
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
      localStorage.setItem(type, JSON.stringify(fixedData));
      setData(fixedData);
      setFileImported(true);
    };
  };

  const emptyRow = (row) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== undefined && row[i] !== null && row[i] !== "")
        return false;
    }
    return true;
  };

  return (
    <input
      type="file"
      accept=".xlsx, .xls"
      className="opacity-0 -z-99 absolute"
      onChange={handleFileUpload}
      ref={inputRef}
    />
  );
};

export default ImportExcel;
