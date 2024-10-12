import XLSX from "xlsx";
import path from 'path'
import fs from 'fs'

const outputFilePath = path.resolve('./i18n.xlsx');

export const appendRecordToExcel = (record) => {
    let workbook;
    if (fs.existsSync(outputFilePath)) {
        // Load the existing workbook
        workbook = XLSX.readFile(outputFilePath);
    } else {
        // Create a new workbook
        workbook = XLSX.utils.book_new();
    }

    // Get the first sheet or create a new one
    let sheetName = 'sheet1';
    let worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Convert the worksheet to JSON to append the new record
    const sheetData = XLSX.utils.sheet_to_json(worksheet);
    sheetData.push(record);

    // Convert the JSON back to a worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newWorksheet;

    // Write the updated workbook to file
    XLSX.writeFile(workbook, outputFilePath);
};