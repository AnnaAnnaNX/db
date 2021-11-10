const fs = require('fs');
const path = require('path');
const { v1 } = require('uuid');
const { Op } = require('sequelize');
const { Providers, ProvidersProducts, MainProducts } = require('../models');
const { typeFilesWithFields } = require('../utils/consts.json');
const { getInfoFromAllFile } = require('../utils/helpers');
const { traceDeprecation } = require('process');
const mainProducts = require('../models/mainProducts');

const readProviderFile = async (req, res) => {
    console.log('readProviderFile');
    try {
        console.log(req.file);

        const idProvider  = req && req.body && req.body.idProvider;
        if (!idProvider) {
            throw new Error('not found idProvider');
        }

        // get product info while type file
        const content = await getInfoFromAllFile(parseInt(idProvider, 10), req.file);
        res.json(content);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const addProviderProducts = async (req, res) => {
    try {
        const rows = req && req.body && req.body.rows;
        console.log(req.body);
        if (!rows) {
            throw new Error('empty content');
        }
        const idProvider = rows && rows.length && rows[0] && rows[0].idProvider;
        if (!idProvider) {
            throw new Error('not found idProvider');
        }
        const existanceProduct = await ProvidersProducts.findAll({
            where: {
                idProvider
            }
        });
        const obj = {};
        existanceProduct.forEach((el) => {
            obj[el.idProductProvider] = el.id;
        });
        const objKeys = Object.keys(obj);

        let updateCount = 0;
        rows.map((el) => {
            if (objKeys.includes(el.idProductProvider)) {
                updateCount++;
                return {
                    ...el,
                    id: obj[el.idProductProvider]
                }
            }
            return el;
        });

        await ProvidersProducts.bulkCreate(rows);
        res.json( {
            created: rows.length - updateCount,
            updated: updateCount
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getProviderProducts = async (req, res) => {
    try {
        const content = await ProvidersProducts.findAll({
            raw: true
        });
        res.status(200).json({ data: content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const addLink = async (req, res) => {
    console.log('addLink');
    try {
        const idProvider = req.body && req.body.idProvider;
        const idProductProvider = req.body && req.body.idProductProvider;
        let idMainProduct = req.body && req.body.idMainProduct;
        if (!idMainProduct) {
            const result = await MainProducts.create(
                { name: 'test' },
                { raw: true }
            );
            console.log(result);
            idMainProduct = result.dataValues && result.dataValues.id;
            console.log(idMainProduct);
        }
        if (!idProvider || !idProductProvider || !idMainProduct) {
            throw new Error('not values');
        }
        const providersProduct = await ProvidersProducts.findOne({
            where: {
                idProvider,
                idProductProvider
            }
        });
        const id = providersProduct && providersProduct.dataValues && providersProduct.dataValues.id;
        await ProvidersProducts.update({
            idMainProduct
        }, {
            where: {id: id}
        });
        res.status(200);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    readProviderFile,
    addProviderProducts,
    getProviderProducts,
    addLink
}