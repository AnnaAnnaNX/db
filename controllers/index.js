const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Products } = require('../models');

const {
    getInfoFromFile,
    createUmlYml,
    createUmlOzon,
    getTypeExcelFile
 } = require('../utils/helpers');

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
        const addedProducts = await Products.bulkCreate(content);
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