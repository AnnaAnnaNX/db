const ExcelJS = require('exceljs');
const { typeFilesWithFields } = require('./consts.json');

const getInfoFromFile = async (type, file, fieldsNumberList) => {
    const fileInfo = typeFilesWithFields['ym'];
    const dbFields = fileInfo.dbFields;
    const excelNumbersColumns = fileInfo.excelNumbersColumns;
    const tagName = fileInfo.tagName;
    const beginProductRowNumber = fileInfo.beginProductRowNumber;
      

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    let rows = [];
    if (type === 'ym') {
        let worksheet = await workbook.getWorksheet(tagName);

        for (let i = 0; i < excelNumbersColumns.length; i++) {
            const column = excelNumbersColumns[i];
            let vals = await worksheet.getColumn(column).values;
            vals = vals.slice(beginProductRowNumber);
            if (i === 0) {
                rows = vals.map((el) => {
                    const obj = {};
                    const val = (el && el.richText && el.richText.text) || el;
                    obj[dbFields[i]] = val;
                    return obj;
                });
            } else {
                rows = rows.map((obj, j) => {
                    const val = (vals[j] && vals[j].richText && vals[j].richText.text) || vals[j];
                    obj[dbFields[i]] = val;
                    return obj;
                });
            }
        }
        rows = rows.filter((el) => (el));
        console.log(JSON.stringify(rows, null, 2));
 
    }

    return rows; 
}

module.exports = {
    getInfoFromFile
}