const ExcelJS = require('exceljs');
const { typeFilesWithFields } = require('./consts.json');

const getInfoFromFile = async (type, file, fieldsNumberList) => {
    const fileInfo = typeFilesWithFields['ym'];
    const dbFields = fileInfo.dbFields;
    const excelNumbersColumns = fileInfo.excelNumbersColumns;
    const tagName = fileInfo.tagName;
    

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    if (type === 'ym') {
        let worksheet = workbook.getWorksheet(tagName);

        let rows = [];
        for (let i = 0; i < excelNumbersColumns.length; i++) {
            const column = excelNumbersColumns[i];
            vals = worksheet.getColumn(column).values;
            if (i === 0) {
                rows = vals.map((el) => {
                    const obj = {};
                    const val = (el && el.text) || el;
                    obj[dbFields[i]] = val;
                    return obj;
                });
            } else {
                rows = rows.map((obj, j) => {
                    const val = (vals[j] && vals[j].text) || vals[j];
                    obj[dbFields[i]] = val;
                    return obj;
                });
            }
        }
        console.log(JSON.stringify(rows));
 
    }


}

module.exports = {
    getInfoFromFile
}