const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Products } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');

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
            const listFields = typeFilesWithFields[type].dbFields;
            addedProducts = await Products.bulkCreate(content, {
                fields: listFields, // listFields, 
                updateOnDuplicate: ["name"]
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
                        purchasePrice: obj.purchasePrice
                    }
                };
            });
            // update entities

            addedProducts = await Products.bulkCreate(
                productsWithPriceAndCount,
                {
                    fields: ["id", "quantityGoodsAtSupplier", "purchasePrice", "createdAt", "updatedAt"],
                    updateOnDuplicate: ["id"]
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

const getUmlYml = async (req, res) => {
    try {
        const content = await Products.findAll({ raw: true });
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
        const content = await Products.findAll({ raw: true });
        const xml = await createUmlOzon(content);
        const pathToYml = path.resolve('files', `${v1()}.yml`);
        await fs.promises.writeFile(pathToYml, xml);
        res.download(pathToYml);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createProduct,
    getUmlYml,
    getUmlOzon
}