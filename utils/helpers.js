const ExcelJS = require('exceljs');
const { typeFilesWithFields } = require('./consts.json');
const { json2xml } = require('./json2xml');

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

const addCategoryId = (products) => {
    const listCategories = products.map((el) => (el.categoryInOurShope));
    let uniqueListCategories = [...new Set(listCategories)];

    const productsWithCategoryId = products.map((product) => {
        const id = uniqueListCategories.indexOf(product.categoryInOurShope) + 1;
        return {
            ...product,
            categoryId: id
        }
    });
    return {
        categories: uniqueListCategories,
        contentWithCategoryId: productsWithCategoryId
    };
}

const createUmlYml = async (content) => {
    let offer = {offer: []};
    const obj = {q2: {offers: offer}};

    const { categories, contentWithCategoryId } = addCategoryId(content);
    // console.log(JSON.stringify(contentWithCategoryId, null, 2));

    offer.offer = contentWithCategoryId.map((product) => {
        const obj = {};
        obj["@id"] = product.id;
        obj.name = product.name;
        obj.price = product.retailPrice;
        obj.currencyId = 'RUR';
        obj.categoryId = product.categoryId;
        obj.count = product.quantityGoodsAtOurStore || 0;
        return obj;
    });
    // console.log(JSON.stringify(offer, null, 2));

    const xml2 = json2xml(obj);
    console.log(xml2);
    return xml2;
}

const createUmlOzon = async (content) => {
    let offer = {offer: []};
    const obj = {yml_catalog: {shop: {offers: offer}}};

    offer.offer = content.map((product) => {
        const obj = {};
        obj["@id"] = product.artOzon || 111;
        obj.name = product.name;
        obj.price = product.retailPrice;
        obj.oldprice = 0;
        obj.outlets = {
            outlet: [
                {'@instock': product.quantityGoodsAtOurStore || 0}
            ]
        };
        return obj;
    });
    console.log(JSON.stringify(offer, null, 2));

    const xml2 = json2xml(obj);
    console.log(xml2);
    return xml2;
}

module.exports = {
    getInfoFromFile,
    createUmlYml,
    createUmlOzon
}