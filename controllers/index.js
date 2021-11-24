const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Products } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');
const providerProductsController = require('../controllers/providerProducts');

const {
    getInfoFromFile,
    createUmlYml,
    createUmlOzon,
    getTypeExcelFile
 } = require('../utils/helpers');

// or update
const createProduct = async (req, res) => {
    try {
        console.log(req.file);

        // get type load file - 'ym', 'ozon', 'price_list', 'ost_baza'
        const type = await getTypeExcelFile(req.file);
        console.log('type');
        console.log(type);
        if (![ 'ym', 'ozon', 'price_list', 'ost_baza'].includes(type)) {
            new Error('not defined type file');
        }

        // get product info while type file
        const content = await getInfoFromFile(type, req.file);

        // bulk
        let addedProducts = null;
        if ((type === 'ym') || (type === 'ozon')) {

            const products = await Products.findAll({
                raw: true
            });

            const idByNameObj = {};
            products.forEach((product) => {
                if (product
                && product.id
                && product.name) {
                    const val = product.name && product.name.trim();
                    idByNameObj[val] = product.id;
                }
            })
            console.log('idByNameObj');
            console.log(JSON.stringify(idByNameObj, null, 2));
    
            const contentWithId = content.map((el) => {
                if (el && el.name) {
                    const val = el.name && el.name.trim();
                    if (idByNameObj[val]) {
                        return {
                            ...el,
                            id: idByNameObj[val]
                        }
                    }
                }
                return el;
            });

            console.log('contentWithId');
            console.log(JSON.stringify(contentWithId, null, 2));

            const listFields = typeFilesWithFields[type].dbFields;
            addedProducts = await Products.bulkCreate(contentWithId, {
                fields: ['id', ...listFields], // listFields, 
                updateOnDuplicate: listFields
            });
        } else if ((type === 'price_list') || (type === 'ost_baza')) {
            // find product for update price and count
            const codes = content.map((el) => (el.code));
            console.log(`read from file - ${codes && codes.length}`);
            const products = await Products.findAll({
                raw: true,
                where: {
                    [Op.or]: [
                        { skuYm: codes },
                        { artOzon: codes }
                    ]
                }
            });
            console.log(`in db have - ${products && products.length}`);
            // add price and count to products
            const productsWithPriceAndCount = [...products].map((product) => {
                const arr = content.filter((el) => ((el.code === product.skuYm) || (el.code === product.artOzon)));
                if (arr && arr.length) {
                    const obj = arr[0];
                    return {
                        ...product,
                        quantityGoodsAtSupplier: obj.quantityGoodsAtSupplier,
                        retailPrice: obj.retailPrice
                    }
                };
            });
            // update entities

            addedProducts = await Products.bulkCreate(
                productsWithPriceAndCount,
                {
                    fields: ["id", "quantityGoodsAtSupplier", "retailPrice", "createdAt", "updatedAt"],
                    updateOnDuplicate: ["quantityGoodsAtSupplier", "retailPrice", "createdAt", "updatedAt"]
                }
            );
            console.log(`updated - ${addedProducts && addedProducts.length}`);
        }
        return res.status(201).json({
            readFromFile: (content && content.length) || 0,
            added: (addedProducts && addedProducts.length) || 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const readYmOrOzonExcel = async (req, res) => {
    try {
        console.log('readYmOrOzonExcel');
        console.log(req.file);

        // get type load file - 'ym', 'ozon', 'price_list', 'ost_baza'
        const type = await getTypeExcelFile(req.file);
        console.log('type');
        console.log(type);
        if (![ 'ym', 'ozon', 'price_list', 'ost_baza'].includes(type)) {
            new Error('not defined type file');
        }

        // get product info while type file
        const content = await getInfoFromFile(type, req.file);

        // bulk
        let addedProducts = null;
        if ((type === 'ym') || (type === 'ozon')) {

            const products = await Products.findAll({
                raw: true
            });

            const idByNameObj = {};
            products.forEach((product) => {
                if (product
                && product.id
                && product.name) {
                    const val = product.name && product.name.trim();
                    idByNameObj[val] = product.id;
                }
            })
            console.log('idByNameObj');
            console.log(JSON.stringify(idByNameObj, null, 2));
    
            const contentWithId = content.map((el) => {
                if (el && el.name) {
                    const val = el.name && el.name.trim();
                    if (idByNameObj[val]) {
                        return {
                            ...el,
                            id: idByNameObj[val]
                        }
                    }
                }
                return el;
            });

            console.log('contentWithId');
            console.log(JSON.stringify(contentWithId, null, 2));

            const listFields = typeFilesWithFields[type].dbFields;
            return res.status(201).json({
                listFields,
                contentWithId
            });
            // addedProducts = await Products.bulkCreate(contentWithId, {
            //     fields: ['id', ...listFields], // listFields, 
            //     updateOnDuplicate: listFields
            // });
        } else {
            throw new Error('wrong type file, required ym or ozon');
        }
        // return res.status(201).json({
        //     readFromFile: (content && content.length) || 0,
        //     added: (addedProducts && addedProducts.length) || 0
        // });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUmlYml = async (req, res) => {
    try {
        // const content = await Products.findAll({
        //     raw: true,
        //     where: {
        //         skuYm: {
        //             [Op.ne]: null
        //         }
        //     }
        // });
       
        const result = await providerProductsController.getAssort();
        const assort = result && result.rows;
        
        console.log(assort);
        // оставить в ассортименте только товары в SKU YM
        const content = assort.filter((obj) => (obj.YMId && obj.newPrice));
        if (!content || (content.length === 0)) {
            return res.status(500).json({ error: 'нет товаров для выгрузки' });
        } 
        console.log('content');console.log(6);
        console.log(content);

        const xml = await createUmlYml(content);
        const pathToYml = path.resolve('files', `${v1()}.yml`);
        await fs.promises.writeFile(pathToYml, xml);
        res.download(pathToYml);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUmlOzon = async (req, res) => {
    try {
        // const content = await Products.findAll({
        //     raw: true,
        //     where: {
        //         artOzon: {
        //             [Op.ne]: null
        //         }
        //     }
        // });
        const result = await providerProductsController.getAssort();
        const assort = result && result.rows;

        const content = assort.filter((obj) => (obj.OzonId && obj.newPrice));

        if (!content || (content.length === 0)) {
            return res.status(500).json({ error: 'нет товаров для выгрузки' });
        }
        
        console.log('content');
        console.log(content);

        const xml = await createUmlOzon(content);
        const pathToYml = path.resolve('files', `${v1()}.yml`);
        await fs.promises.writeFile(pathToYml, xml);
        res.download(pathToYml);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getProducts = async (req, res) => {
    try {
        const content = await Products.findAll({
            raw: true
        });
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createProduct,
    readYmOrOzonExcel,
    getUmlYml,
    getUmlOzon,
    getProducts
}