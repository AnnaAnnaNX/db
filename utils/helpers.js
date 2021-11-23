const path = require('path');
const ExcelJS = require('exceljs');
const { typeFilesWithFields } = require('./consts.json');
const { json2xml } = require('./json2xml');
const { Providers } = require('../models');

const format = (val, fieldName) => {
    if (!val || (typeof val === 'number')) {
        return val;
    }
    console.log(`val - ${val}`);
    if ((fieldName === 'quantityGoodsAtOurStore')
    || (fieldName === 'quantityGoodsAtSupplier')
    || (fieldName === 'count')) {
        const q = val.replace(/</gi, '').replace(/>/gi, '');
        console.log(`q = ${q}`);
        return parseInt(q, 10);
    }
    if ((fieldName === 'retailPrice')
    || (fieldName === 'purchasePrice')) {
        return  parseInt(val.replace(/ /gi, ''), 10);
    }
    return val;
}

const getInfoFromAllFile = async (idProvider, file) => {
    console.log('getInfoFromAllFile');
      
    const params = await Providers.findOne({
        where: {
            id: idProvider
        }
    });

    if (!params) {
        throw new Error('not found params');
    }

    let worksheet = null;
    const workbook = new ExcelJS.Workbook();
    const extension = path.extname(file.path);
    if (extension === '.xlsx') {
        await workbook.xlsx.readFile(file.path);
    } else if (extension === '.csv') {
        worksheet = await workbook.csv.readFile(file.path);
    } else {
        return;
    }

    let rows = [];
    if (extension === '.xlsx') {
        worksheet = await workbook.getWorksheet(params.tabName || 'Ассортимент');
    }

    const dbFields = params.fieldsNames
    && JSON.parse(params.fieldsNames);

    // const dbFields = [
    //     'idProductProvider',
    //     'name',
    //     'price',
    //     'count'
    // ];

    const excelNumbersColumns = params.fieldsSymbols
    && JSON.parse(params.fieldsSymbols);

    // const excelNumbersColumns = [
    //     params.columnInnerId,
    //     params.columnName,
    //     params.columnPrice,
    //     params.columnCountProduct
    // ];
    
    for (let i = 0; i < excelNumbersColumns.length; i++) {
        const column = excelNumbersColumns[i];
        console.log(worksheet ? 'worksheet' : 'no worksheet');
        let vals = await worksheet.getColumn(column).values;
        vals = vals.slice(params.row);
        if (i === 0) {
            rows = vals.map((el) => {
                const obj = {};
                const val = (el && el.richText && el.richText.text) || el;
                obj[dbFields[i]] = format(val, dbFields[i]);
                return obj;
            });
        } else {
            rows = rows.map((obj, j) => {
                const val = (vals[j] && vals[j].richText && vals[j].richText.text) || vals[j];
                obj[dbFields[i]] = format(val, dbFields[i]);
                return obj;
            });
        }
    }
    rows = rows.map((obj, j) => {
        obj.idProvider = idProvider;
        return obj;
    });
    rows = rows.filter((el) => (el));
    console.log(JSON.stringify(rows, null, 2));
 
    

    return rows; 

}

const getInfoFromFile = async (type, file, fieldsNumberList) => {
    const fileInfo = typeFilesWithFields[type];
    const dbFields = fileInfo.dbFields;
    const excelNumbersColumns = fileInfo.excelNumbersColumns;
    const tagName = fileInfo.tagName;
    const beginProductRowNumber = fileInfo.beginProductRowNumber;
      
    let worksheet = null;
    const workbook = new ExcelJS.Workbook();
    const extension = path.extname(file.path);
    if (extension === '.xlsx') {
        await workbook.xlsx.readFile(file.path);
    } else if (extension === '.csv') {
        worksheet = await workbook.csv.readFile(file.path);
    } else {
        return;
    }

    let rows = [];
    if (['ym', 'ozon', 'price_list', 'ost_baza'].includes(type)) {
        if (extension === '.xlsx') {
            worksheet = await workbook.getWorksheet(tagName);
        }

        for (let i = 0; i < excelNumbersColumns.length; i++) {
            const column = excelNumbersColumns[i];
            console.log(worksheet ? 'worksheet' : 'no worksheet');
            let vals = await worksheet.getColumn(column).values;
            vals = vals.slice(beginProductRowNumber);
            if (i === 0) {
                rows = vals.map((el) => {
                    const obj = {};
                    const val = (el && el.richText && el.richText.text) || el;
                    obj[dbFields[i]] = format(val, dbFields[i]);
                    return obj;
                });
            } else {
                rows = rows.map((obj, j) => {
                    const val = (vals[j] && vals[j].richText && vals[j].richText.text) || vals[j];
                    obj[dbFields[i]] = format(val, dbFields[i]);
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
    const obj = {yml_catalog: {offers: offer}};
    obj.yml_catalog["@date"] = (new Date()).toISOString();

    // header
    obj.yml_catalog.name = 'BestSeller';
    obj.yml_catalog.company = 'Tne Best inc.';
    obj.yml_catalog.url = 'http://best.seller.ru';
    obj.yml_catalog.currencies = {
        currency: {
            "@id": "RUR",
            "@rate": "1"
        }
    };

    const { categories, contentWithCategoryId } = addCategoryId(content);
    // console.log(JSON.stringify(contentWithCategoryId, null, 2));

    const categoryArr = categories.map((category, i) => {
        return {
            "@id": i+1,
            "#text": category
        };
    })
    obj.yml_catalog.categories = {
        category: categoryArr
    }
    
    offer.offer = contentWithCategoryId.map((product) => {
        const obj = {};
        obj["@id"] = product.YMId;
        obj.name = product.YMName;
        obj.price = product.newPrice;
        obj.currencyId = 'RUR';
        obj.categoryId = product.categoryId;
        // obj.count = (product.quantityGoodsAtOurStore + product.quantityGoodsAtSupplier) || 0;
        return obj;
    });
    console.log(JSON.stringify(offer, null, 2));
    console.log(JSON.stringify(obj, null, 2));

    const xml2 = json2xml(obj);
    console.log(xml2);
    return `<?xml version="1.0" encoding="UTF-8"?>${xml2}`;
}

const createUmlOzon = async (content) => {
    let offer = {offer: []};
    const obj = {yml_catalog: {shop: {offers: offer}}};

    offer.offer = content.map((product) => {
        const obj = {};
        obj["@id"] = product.artOzon || 111;
        // obj.name = product.name;
        obj.price = product.retailPrice;
        obj.oldprice = 0;
        obj.outlets = {
            outlet: [
                {'@instock': (product.quantityGoodsAtOurStore + product.quantityGoodsAtSupplier) || 0}
            ]
        };
        return obj;
    });
    console.log(JSON.stringify(offer, null, 2));

    const xml2 = json2xml(obj);
    console.log(xml2);
    return xml2;
}

const getTypeExcelFile = async (file) => {
    try {
        const workbook = new ExcelJS.Workbook();
        console.log('file.path');
        console.log(file.path);
        const extension = path.extname(file.path);
        console.log('extension');
        console.log(extension);
        if (extension === '.xlsx') {
            await workbook.xlsx.readFile(file.path);
        } else if (extension === '.csv') {
            await workbook.csv.readFile(file.path);
            return 'ozon'; // csv-файл только у Ozon
        } else {
            return;
        }
        const arr = [];
        workbook.eachSheet(function(worksheet) {
            arr.push(worksheet.name); // не работает для csv
        });
        // TODO: брать из consts названия вкладок
        if (arr.includes('Ассортимент')) {
            return 'ym';
        }
        if (arr.includes('products')) {
            return 'ozon';
        }
        if (arr.includes('TDSheet')) {
            return 'price_list';
        }
        if (arr.includes('Уютель LED+TL')) {
            return 'ost_baza';
        }
    } catch (e) {
        return null;
    }
}

module.exports = {
    getInfoFromFile,
    createUmlYml,
    createUmlOzon,
    getTypeExcelFile,
    getInfoFromAllFile
}