const fs = require('fs');
const path = require('path');
const moment = require('moment');
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
        let rows = req && req.body && req.body.rows;
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
        console.log('existanceProduct');
        console.log(JSON.stringify(existanceProduct));
        const obj = {};
        existanceProduct.forEach((el) => {
            obj[el.idProductProvider] = el.id;
        });
        const objKeys = Object.keys(obj);

        const provider = await Providers.findOne({
            where: {
                id: idProvider
            }
        });
        const providerName = provider && provider.nameProvider;
        console.log('providerName');
        console.log(providerName);

        let updateCount = 0;
        rows = rows.map((el) => {            
            if (providerName === 'markup') {
                el.idMainProduct = parseInt(el.idProductProvider, 10);
            }
            if (objKeys.includes((el.idProductProvider).toString())) {
                updateCount++;
                return {
                    ...el,
                    id: (obj[(el.idProductProvider).toString()])
                }
            }
            return el;
        });

        if (req.body.newMainProduct) {
            const resultMainProducts = await MainProducts.bulkCreate(rows.map(() => ({name: 'test'})));
            console.log('resultMainProducts');
            console.log(resultMainProducts);
            const newRows = [];
            resultMainProducts.forEach((el, i) => {
                newRows.push({
                    ...rows[i],
                    idMainProduct: el && el.dataValues && el.dataValues.id
                });
            });
            // console.log('newRows');
            // console.log(newRows);
            const result = await ProvidersProducts.bulkCreate(newRows);
            // console.log('result');
            // console.log(result);
        } else {
            const result = await ProvidersProducts.bulkCreate(rows, {
                updateOnDuplicate: [
                    'id',
                    // 'idProductProvider',
                    'values',
                    'updatedAt'
                ]
            });
            // const result = await ProvidersProducts.bulkCreate(rows, {
            //     fields:[
            //         'id',
            //         'idProductProvider',
            //         'values'
            //     ],
            //     updateOnDuplicate: ['id'] 
            // });
            // console.log('result');
            // console.log(result);
        }

        res.json({
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
        console.log(req.body);
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
        
        console.log(`id ${id}`);
        await ProvidersProducts.update({
            idMainProduct
        }, {
            where: {id: id}
        });
        console.log(222);
        res.status(200).json({});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getAssort = async () => {
    try {
        const providerProducts = await ProvidersProducts.findAll({
            raw: true
        });
        const providers = await Providers.findAll({
            raw: true
        });
        const mainProducts = await MainProducts.findAll({
            raw: true
        });
        if (!mainProducts || !providerProducts || !providers) {
            return {
                rows: [],
                shortListHeaders: [],
            }
          }
          const mainIds = mainProducts.map((el) => (el.id));
          const obj = {};
          mainIds.forEach((el) => {obj[el] = {}});
          // иметь сопоставление idProvider с именем провайдера
          // nameProviderIdProviderObj {idProvider: nameProvider}
          const nameProviderIdProviderObj = {};
          providers.forEach((provider) => {
            if (provider.id) {
              nameProviderIdProviderObj[provider.nameProvider] = {
                id: provider.id,
                fieldsNames: provider.fieldsNames && JSON.parse(provider.fieldsNames)
              };
            }
          });
          const idProviderNameProviderObj = {};
          providers.forEach((provider) => {
            if (provider.id && provider.nameProvider) {
              idProviderNameProviderObj[provider.id] = provider.nameProvider;
            }
          });
          providerProducts.forEach((el) => {
            if (el.idMainProduct) {
                const idAssort = el.idMainProduct;
              // obj[idMainProduct][`count #${el.idProvider}`] = el.count;
              
              if (nameProviderIdProviderObj['YM'] &&
                // (el.idProvider === nameProviderIdProviderObj['YM'].id)
                (idProviderNameProviderObj[el.idProvider] === 'YM')) {
                obj[idAssort]['YMId'] = el.idProductProvider;
                const fieldsNames = nameProviderIdProviderObj['YM'].fieldsNames;
                // let n = fieldsNames.indexOf('categoryInOurShope');
                let n = fieldsNames.indexOf('name');
                let values = el.values && JSON.parse(el.values);
                obj[idAssort]['categoryInOurShope'] = values && values[n];
                
                n = fieldsNames.indexOf('name');
                // values = el.values && JSON.parse(el.values);
                obj[idAssort]['YMName'] = values && values[n];
                
                n = fieldsNames.indexOf('linkOnImage');
                // values = el.values && JSON.parse(el.values);
                obj[idAssort]['linkOnImage'] = values && values[n];
              } else
              if (nameProviderIdProviderObj['Ozon'] &&
                // (el.idProvider === nameProviderIdProviderObj['Ozon'].id)
                (idProviderNameProviderObj[el.idProvider] === 'Ozon')) {
                obj[idAssort]['OzonId'] = el.idProductProvider;
                const fieldsNames = nameProviderIdProviderObj['Ozon'].fieldsNames;
                const n = fieldsNames.indexOf('name');
                const values = el.values && JSON.parse(el.values); 
                obj[idAssort]['OzonName'] = values && values[n];
              } else
              if (nameProviderIdProviderObj['1C'] &&
                // (el.idProvider === nameProviderIdProviderObj['1C'].id)
                (idProviderNameProviderObj[el.idProvider] === '1C')) {
                obj[idAssort]['1CId'] = el.idProductProvider;
                const values = el.values && JSON.parse(el.values); 
                const fieldsNames = nameProviderIdProviderObj['1C'].fieldsNames;
                let n = fieldsNames.indexOf('name');
                obj[idAssort]['1CName'] = values && values[n];
                n = fieldsNames.indexOf('price');
                obj[idAssort]['1CPrice'] = values && values[n];
                obj[idAssort]['1CUpdate'] = el.updatedAt;
              } else    
              if (nameProviderIdProviderObj['markup'] &&
                // (el.idProvider === nameProviderIdProviderObj['markup'].id)
                (idProviderNameProviderObj[el.idProvider] === 'markup')) {
                obj[idAssort]['markupId'] = el.idProductProvider;
                const values = el.values && JSON.parse(el.values);
                const fieldsNames = nameProviderIdProviderObj['markup'].fieldsNames;
                let n = fieldsNames.indexOf('markup');
                obj[idAssort]['markup'] = values && values[n];
              } else
              // здесь только поставщики (берем любого поставщика)
              if (!obj[idAssort]['providerName']) {
                const providerName = idProviderNameProviderObj[el.idProvider];
                obj[idAssort]['providerName'] = providerName;
                const fieldsNames = nameProviderIdProviderObj[providerName]
                    && nameProviderIdProviderObj[providerName].fieldsNames;
                let n = fieldsNames && fieldsNames.indexOf('name');
                const values = el.values && JSON.parse(el.values); 
                obj[idAssort]['providerProductName'] = values && values[n];
                n = fieldsNames && fieldsNames.indexOf('price');
                obj[idAssort]['providerProductPrice'] = values && values[n];
                obj[idAssort]['providerProductUpdate'] = el.updatedAt;
              }
              // newPrice
              if (obj[idAssort]['providerProductPrice']
                && obj[idAssort]['1CPrice']) {
                  const dataProvider = obj[idAssort]['providerProductUpdate']
                    &&  moment(obj[idAssort]['providerProductUpdate']);
                  const data1C = obj[idAssort]['1CUpdate']
                    &&  moment(obj[idAssort]['1CUpdate']);
                  console.log('dataProvider');
                  console.log(dataProvider);
                  console.log('data1C');
                  console.log(data1C);
              }
    
              // берет цену поставщика или если ее нет, то цену 1С
              if (obj[idAssort]['markup']
                && (obj[idAssort]['providerProductPrice']
                || obj[idAssort]['1CPrice'])) {
                    let val = 0;
                    if (obj[idAssort]['providerProductPrice']
                        && obj[idAssort]['1CPrice']) {
                        val = obj[idAssort]['markup'] * (dataProvider > data1C ? obj[idAssort]['providerProductPrice'] : obj[idAssort]['1CPrice']);
                    } else {
                        val = obj[idAssort]['markup'] * (obj[idAssort]['providerProductPrice'] ? obj[idAssort]['providerProductPrice'] : obj[idAssort]['1CPrice'])
                    }
                    if (val) {
                        obj[idAssort]['newPrice'] = Math.round(val);
                    }
                }   
    
            }
          });
          const rows = Object.keys(obj).map((id) => ({id: id, ...obj[id]}));
          console.log('rows');
          console.log(rows);
          const shortListHeaders = [
            'YMId',
            'YMName',
            'OzonId',
            'OzonName',
            '1CId',
            '1CName',
            '1CPrice',
            // '1CUpdate',
            'markupId',
            'markup',
            'providerName',
            'providerProductName',
            'providerProductPrice',
            // 'providerProductUpdate',
            'newPrice'
          ];

          return {
            rows,
            shortListHeaders: ['id', ...shortListHeaders],
          };
    } catch (error) {
        return error;
    }
}

module.exports = {
    readProviderFile,
    addProviderProducts,
    getProviderProducts,
    addLink,
    getAssort
}